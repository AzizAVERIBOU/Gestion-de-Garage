import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { mettreAJourStatutRendezVous, selectionnerRendezVousParUtilisateur } from '../store/rendezVousSlice';
import { ajouterFacture } from '../store/factureSlice';
import { ajouterMethodePaiement, selectionnerMethodesPaiementParUtilisateur } from '../store/paiementSlice';
import '../styles/Paiement.css';

const Paiement = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const dispatch = useDispatch();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);
  const rendezVous = useSelector(state => selectionnerRendezVousParUtilisateur(state, user?.id));
  const montantAPayer = location.state?.montant || '';
  const rdvId = location.state?.rdvId;

  // on cherche le rendez vous en fonction de l'id du rendez vous
  const rdvConcerne = rendezVous.find(rdv => rdv.id === rdvId);

  const [paiement, setPaiement] = useState({
    montant: montantAPayer,
    numeroCarte: '',
    dateExpiration: '',
    cvv: '',
    nomCarte: ''
  });
  // ce constante va nous permettre de gerer les erreurs
  const [error, setError] = useState('');
  // ce constante va nous permettre de savoir si l'utilisateur veut sauvegarder la carte  
  const [sauvegarderCarte, setSauvegarderCarte] = useState(false);
  // on va selectionner les methodes de paiement enregistrées pour l'utilisateur
  const methodesEnregistrees = useSelector(state => selectionnerMethodesPaiementParUtilisateur(state, user?.id));
  // ce constante va nous permettre de savoir si l'utilisateur veut utiliser une methode de paiement enregistrée
  const [useMethodeEnregistree, setUseMethodeEnregistree] = useState(false);
  // ce constante va nous permettre de selectionner la methode de paiement enregistrée
  const [selectedMethode, setSelectedMethode] = useState(null);

  useEffect(() => {
    if (!montantAPayer || !rdvId || !rdvConcerne) {
      navigate('/client/tableau-de-bord');
    }
  }, [montantAPayer, rdvId, rdvConcerne, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // les benefices de mecano sont de 15% comme il demande
      const montantTotal = parseFloat(montantAPayer);
      const montantMecanicien = montantTotal * 0.15; // 15% pour le mécanicien
      const beneficesGarage = montantTotal * 0.85; // le 85% on met ca pour le garage

      // on generefacture avec les informations du véhicule et les bénéfices
      const facture = {
        id: `F-${Date.now()}`,
        date: new Date().toISOString(),
        montantTotal: montantTotal,
        montantMecanicien: montantMecanicien,
        beneficesGarage: beneficesGarage,
        rdvId: rdvId,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || user.name || ''}`.trim(),
        mecanicienId: rdvConcerne.mecanicienId,
        mecanicienNom: `${rdvConcerne.mecanicienPrenom} ${rdvConcerne.mecanicienNom}`,
        vehicule: {
          id: rdvConcerne.vehiculeInfo.id,
          marque: rdvConcerne.vehiculeInfo.marque,
          modele: rdvConcerne.vehiculeInfo.modele,
          annee: rdvConcerne.vehiculeInfo.annee
        }, // on ajoute les details du vehicule 
        service: rdvConcerne.motif,
        description: rdvConcerne.description,
        status: 'payée',
        dateRdv: rdvConcerne.date,
        heureRdv: rdvConcerne.heure,
        // on ajoute les details du paiement
        paiement: {
          date: new Date().toISOString(),
          methode: useMethodeEnregistree ? 'carte enregistrée' : 'nouvelle carte',
          derniers4Chiffres: paiement.numeroCarte.slice(-4)
        }
      };

      // on ajoute la facture au store (sera disponible pour le client et le mécanicien)
      dispatch(ajouterFacture(facture));

      // on met a jour le statut du rendez vous
      dispatch(mettreAJourStatutRendezVous({
        id: rdvId,
        status: 'payé',
        facture: facture
      }));

      // si l'utilisateur veut sauvegarder la carte
      if (sauvegarderCarte) {
        dispatch(ajouterMethodePaiement({
          userId: user.id,
          methodePaiement: {
            numeroCarte: paiement.numeroCarte,
            dateExpiration: paiement.dateExpiration,
            nomCarte: paiement.nomCarte
          }
        }));
      }

      // on redirige vers la page des factures
      navigate('/client/factures');
    } catch (err) {
      setError('Erreur lors du traitement du paiement');
    }
  };

  return (
    // on a fait le rendu en utilisant bootstrap
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
            <Card.Header className="bg-info text-white">
              <FontAwesomeIcon icon={faCreditCard} className="me-2" />
              Effectuer le paiement
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Alert variant="info" className="mb-4">
                <h5>Montant à payer : {montantAPayer} CAD</h5>
              </Alert>

              <Form onSubmit={handleSubmit}>
                {methodesEnregistrees.length > 0 && (
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label="Utiliser une carte enregistrée"
                      checked={useMethodeEnregistree}
                      onChange={(e) => setUseMethodeEnregistree(e.target.checked)}
                    />
                    
                    {useMethodeEnregistree && (
                      <div className="mt-3">
                        {methodesEnregistrees.map(methode => (
                          <Card 
                            key={methode.id}
                            className={`mb-2 ${selectedMethode?.id === methode.id ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedMethode(methode)}
                          >
                            <Card.Body>
                              <p className="mb-1">{methode.numeroCarte}</p>
                              <p className="mb-0 small text-muted">
                                {methode.nomCarte} - Expire: {methode.dateExpiration}
                              </p>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Form.Group>
                )}

                {(!useMethodeEnregistree || methodesEnregistrees.length === 0) && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro de carte</Form.Label>
                      <Form.Control
                        type="text"
                        value={paiement.numeroCarte}
                        onChange={(e) => setPaiement({...paiement, numeroCarte: e.target.value})}
                        placeholder="XXXX XXXX XXXX XXXX"
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date d'expiration</Form.Label>
                          <Form.Control
                            type="text"
                            value={paiement.dateExpiration}
                            onChange={(e) => setPaiement({...paiement, dateExpiration: e.target.value})}
                            placeholder="MM/AA"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>CVV</Form.Label>
                          <Form.Control
                            type="text"
                            value={paiement.cvv}
                            onChange={(e) => setPaiement({...paiement, cvv: e.target.value})}
                            placeholder="XXX"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Nom sur la carte</Form.Label>
                      <Form.Control
                        type="text"
                        value={paiement.nomCarte}
                        onChange={(e) => setPaiement({...paiement, nomCarte: e.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Sauvegarder cette carte pour de futurs paiements"
                        checked={sauvegarderCarte}
                        onChange={(e) => setSauvegarderCarte(e.target.checked)}
                      />
                    </Form.Group>
                  </>
                )}

                <div className="d-grid">
                  <Button variant="success" type="submit">
                    Payer {montantAPayer} CAD
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

export default Paiement;