import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faArrowLeft, faBarcode, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ajouterVehicule } from '../store/vehiculeSlice';
import '../styles/AjoutVehicule.css';

// Le système de cache est utilisé pour optimiser les performances lors des recherches de véhicules
// Quand un utilisateur recherche une marque ou un modèle :
// 1. On vérifie d'abord si cette recherche existe déjà dans le cache
// 2. Si oui, on retourne directement les résultats stockés, évitant ainsi un appel API
// 3. Si non, on fait l'appel API et on stocke les résultats dans le cache pour les futures recherches
// Avantages :
// - Réduction du nombre d'appels API
// - Réponses plus rapides pour les recherches répétées
// - Meilleure expérience utilisateur
// - Économie de bande passante
// Le cache est temporaire et existe uniquement pendant la session de l'utilisateur
const marqueCache = new Map();  // Cache pour stocker les résultats de recherche des marques
const modeleCache = new Map();  // Cache pour stocker les résultats de recherche des modèles

const AjoutVehicule = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);

  // on verifie si l'utilisateur est connecte
  useEffect(() => {
    if (!user) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  const [methode, setMethode] = useState('manuelle');
  const [vehicule, setVehicule] = useState({
    marque: '',
    modele: '',
    annee: '',
    vin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState({
    marques: [],
    modeles: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Générer la liste des années
  const anneeActuelle = new Date().getFullYear();
  const annees = Array.from(
    { length: anneeActuelle - 1949 },
    (_, i) => anneeActuelle - i
  );

  const handleVinSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vehicule.vin}?format=json`);
      const data = await response.json();
      
      if (data.Results) {
        // Extraire les informations pertinentes
        const make = data.Results.find(item => item.Variable === "Make")?.Value;
        const model = data.Results.find(item => item.Variable === "Model")?.Value;
        const year = data.Results.find(item => item.Variable === "Model Year")?.Value;

        if (make && model && year) {
          setVehicule({
            ...vehicule,
            marque: make,
            modele: model,
            annee: year
          });
        } else {
          setError("Impossible de récupérer toutes les informations du véhicule");
        }
      } else {
        setError("VIN invalide ou non reconnu");
      }
    } catch (err) {
      setError("Erreur lors de la récupération des informations");
      console.error('Erreur NHTSA:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/connexion');
      return;
    }
    
    const vehiculeToSave = {
      ...vehicule,
      userId: user.id,
      ...(methode === 'vin' && { vin: vehicule.vin })
    };
    dispatch(ajouterVehicule(vehiculeToSave));
    navigate('/client/tableau-de-bord');
  };

  // Fonction optimisée pour récupérer les marques avec système de cache
  const fetchMarques = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSuggestions({ ...suggestions, marques: [] });
      return;
    }

    // Vérifier si la recherche existe déjà dans le cache
    const cacheKey = searchTerm.toLowerCase();
    if (marqueCache.has(cacheKey)) {
      // Si oui, utiliser les données du cache au lieu de faire un appel API
      setSuggestions({
        ...suggestions,
        marques: marqueCache.get(cacheKey)
      });
      return;
    }

    // Si non, faire l'appel API et stocker le résultat dans le cache
    setIsLoading(true);
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json`);
      const data = await response.json();
      if (data.Results) {
        const filteredMakes = data.Results
          .filter(make => 
            make.Make_Name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 8) // Limiter à 8 suggestions pour plus de rapidité
          .map(item => item.Make_Name);

        // Stocker les résultats dans le cache pour les futures recherches
        marqueCache.set(cacheKey, filteredMakes);
        setSuggestions({
          ...suggestions,
          marques: filteredMakes
        });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des marques:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction optimisée pour récupérer les modèles
  const fetchModeles = async (marque) => {
    if (!marque) return;

    // Vérifier le cache
    if (modeleCache.has(marque)) {
      setSuggestions({
        ...suggestions,
        modeles: modeleCache.get(marque)
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(marque)}?format=json`);
      const data = await response.json();
      if (data.Results) {
        const modeles = data.Results.map(item => item.Model_Name);
        // Mettre en cache les résultats
        modeleCache.set(marque, modeles);
        setSuggestions({
          ...suggestions,
          modeles: modeles
        });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des modèles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire de changement optimisé pour la marque
  const handleMarqueChange = (e) => {
    const value = e.target.value;
    setVehicule(prev => ({
      ...prev,
      marque: value,
      modele: ''
    }));

    // Réinitialiser les suggestions de modèles
    setSuggestions(prev => ({
      ...prev,
      modeles: []
    }));

    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    window.searchTimeout = setTimeout(() => {
      if (value.length >= 2) {
        fetchMarques(value);
      } else {
        setSuggestions(prev => ({
          ...prev,
          marques: []
        }));
      }
    }, 200);
  };

  // Gestionnaire de sélection de marque modifié
  const handleMarqueSelect = async (marque) => {
    // Mettre à jour le véhicule avec la marque sélectionnée
    setVehicule(prev => ({
      ...prev,
      marque: marque,
      modele: '' // Réinitialiser le modèle
    }));

    // Fermer la liste des suggestions de marques
    setSuggestions(prev => ({
      ...prev,
      marques: []
    }));

    // Charger les modèles pour cette marque
    setIsLoading(true);
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(marque)}?format=json`);
      const data = await response.json();
      
      if (data.Results) {
        const modeles = data.Results.map(item => item.Model_Name);
        setSuggestions(prev => ({
          ...prev,
          modeles: modeles
        }));
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des modèles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté, on peut retourner null ou un loader
  if (!user) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Button 
            variant="link" 
            className="mb-4"
            onClick={() => navigate('/client/tableau-de-bord')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour au tableau de bord
          </Button>

          <Card>
            <Card.Header className="bg-primary text-white">
              <FontAwesomeIcon icon={faCar} className="me-2" />
              Enregistrer un nouveau véhicule
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Méthode d'ajout</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Saisie manuelle"
                      name="methode"
                      checked={methode === 'manuelle'}
                      onChange={() => {
                        setMethode('manuelle');
                        setError('');
                      }}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Numéro VIN"
                      name="methode"
                      checked={methode === 'vin'}
                      onChange={() => {
                        setMethode('vin');
                        setError('');
                      }}
                    />
                  </div>
                </Form.Group>

                {methode === 'vin' ? (
                  <div className="mb-4">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faBarcode} className="me-2" />
                        Numéro VIN
                      </Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          value={vehicule.vin}
                          onChange={(e) => setVehicule({...vehicule, vin: e.target.value.toUpperCase()})}
                          placeholder="Ex: 1HGCM82633A123456"
                          required
                        />
                        <Button 
                          variant="secondary" 
                          onClick={handleVinSearch}
                          disabled={loading || !vehicule.vin}
                        >
                          {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            'Rechercher'
                          )}
                        </Button>
                      </div>
                      <Form.Text className="text-muted">
                        Le numéro VIN se trouve sur la carte grise du véhicule
                      </Form.Text>
                    </Form.Group>

                    {error && (
                      <Alert variant="danger">
                        {error}
                      </Alert>
                    )}

                    {(vehicule.marque || vehicule.modele || vehicule.annee) && (
                      <Alert variant="info">
                        <p className="mb-1"><strong>Informations détectées :</strong></p>
                        <p className="mb-1">Marque : {vehicule.marque}</p>
                        <p className="mb-1">Modèle : {vehicule.modele}</p>
                        <p className="mb-0">Année : {vehicule.annee}</p>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <>
                    {methode === 'manuelle' && (
                      <>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Marque</Form.Label>
                              <div className="position-relative">
                                <Form.Control
                                  type="text"
                                  value={vehicule.marque}
                                  onChange={handleMarqueChange}
                                  onFocus={() => {
                                    if (vehicule.marque.length >= 2) {
                                      fetchMarques(vehicule.marque);
                                    }
                                  }}
                                  placeholder="Commencez à taper pour voir les suggestions..."
                                  autoComplete="off"
                                  required
                                />
                                {isLoading && (
                                  <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                  </div>
                                )}
                                {suggestions.marques.length > 0 && (
                                  <div className="suggestions-container position-absolute w-100 mt-1 bg-white border rounded shadow-sm">
                                    {suggestions.marques.map((marque, index) => (
                                      <div
                                        key={index}
                                        className="p-2 hover-bg-light"
                                        onClick={() => handleMarqueSelect(marque)}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {marque}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Modèle</Form.Label>
                              <Form.Select
                                value={vehicule.modele}
                                onChange={(e) => setVehicule({...vehicule, modele: e.target.value})}
                                required
                                disabled={!vehicule.marque || suggestions.modeles.length === 0}
                              >
                                <option value="">Sélectionnez un modèle</option>
                                {suggestions.modeles.map((modele, index) => (
                                  <option key={index} value={modele}>
                                    {modele}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-4">
                          <Form.Label>Année</Form.Label>
                          <Form.Select
                            value={vehicule.annee}
                            onChange={(e) => setVehicule({...vehicule, annee: e.target.value})}
                            required
                          >
                            <option value="">Sélectionnez une année</option>
                            {annees.map(annee => (
                              <option key={annee} value={annee}>
                                {annee}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </>
                    )}
                  </>
                )}

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading || (methode === 'vin' && !vehicule.marque)}
                  >
                    {methode === 'vin' && !vehicule.marque ? 
                      'Veuillez d\'abord rechercher le VIN' : 
                      'Enregistrer le véhicule'
                    }
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AjoutVehicule;