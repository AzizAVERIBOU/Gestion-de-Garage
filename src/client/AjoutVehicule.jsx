import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faArrowLeft, faBarcode, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ajouterVehicule, fetchMarques, fetchModeles } from '../store/vehiculeSlice';
import '../styles/AjoutVehicule.css';

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

  // Générer la liste des années
  const anneeActuelle = new Date().getFullYear();
  const annees = Array.from(
    { length: anneeActuelle - 1949 },
    (_, i) => anneeActuelle - i // ici on creer la liste des annees en utilisant une boucle 
  );

  const handleVinSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vehicule.vin}?format=json`);
      const data = await response.json();
      
      if (data.Results) {
        // on va chercher les modeles sur le vin rechercher sur l'api de nhtsa
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
          setError("Impossible de récupérer toutes les informations du véhicule"); // si on ne trouve pas les informations du vin pour savoir quelle partie du code on est 
        }
      } else {
        setError("VIN invalide ou non reconnu"); // si on ne trouve pas les informations du vin 
      }
    } catch (err) {
      setError("Erreur lors de la récupération des informations");
      console.error('Erreur NHTSA:', err);
    } finally {
      setLoading(false);
    }
  };
  // action pour enregistrer le vehicule
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

  // on recupere les marques et les modeles du state
  const { marques, modeles, loading: stateLoading } = useSelector(state => state.vehicule);

  // on recupere la valeur de la marque et on la met dans le state avec un debounce
  const handleMarqueChange = (e) => {
    const value = e.target.value;
    setVehicule(prev => ({
      ...prev,
      marque: value,
      modele: ''
    }));

    // on utilise la notion de debounce pour limiter le nombre de requete a l'api
    //sa nous permet de ne pas faire des requetes a l'api a chaque fois que l'utilisateur tape une lettre
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    window.searchTimeout = setTimeout(() => {
      if (value.length >= 2) {
        dispatch(fetchMarques(value));
      }
    }, 300);
  };

  // on recupere la valeur de la marque et on la met dans le state
  const handleMarqueSelect = async (marque) => {
    setVehicule(prev => ({
      ...prev,
      marque: marque,
      modele: ''
    }));

    // Vider les suggestions de marques immédiatement
    dispatch({ type: 'vehicule/fetchMarques/fulfilled', payload: [] });
    
    // Récupérer les modèles pour la marque sélectionnée
    dispatch(fetchModeles(marque));
  };

  // Si l'utilisateur n'est pas connecté, on peut retourner null ou un loader
  if (!user) {
    return null;
  }

  return (
    // on affiche la page d'ajout de vehicule en utilisant bootstrap
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
                        Entrer le numéro VIN du véhicule , il se trouve sur la carte grise du véhicule
                      </Form.Text>
                    </Form.Group>

                    {error && (
                      <Alert variant="danger">
                        {error}
                      </Alert>
                    )}

                    {(vehicule.marque || vehicule.modele || vehicule.annee) && (
                      <Alert variant="info">
                        <p className="mb-1"><strong>Informations du véhicule :</strong></p>
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
                                      dispatch(fetchMarques(vehicule.marque));
                                    }
                                  }}
                                  placeholder="Commencez à taper pour voir les suggestions..."
                                  autoComplete="off"
                                  required
                                />
                                {marques?.length > 0 && vehicule.marque && (
                                  <div className="suggestions-container position-absolute w-100 mt-1 bg-white border rounded shadow-sm">
                                    {marques.map((marque, index) => (
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
                                disabled={!vehicule.marque || stateLoading}
                              >
                                <option value="">Sélectionnez le modèle</option>
                                {modeles.map((modele, index) => (
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
                            <option value="">Sélectionnez l'année de votre véhicule</option>
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