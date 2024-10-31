import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCar, faSignOutAlt, faUser, faEdit, faCreditCard, faFileInvoice, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { mettreAJourUtilisateur, deconnexion } from '../store/userSlice';
import { supprimerVehicule } from '../store/vehiculeSlice';
import { selectionnerRendezVousParUtilisateur, annulerRendezVous, mettreAJourRendezVous, demanderModificationRendezVous, approuverModificationRendezVous, refuserModificationRendezVous } from '../store/rendezVousSlice';
import { selectionnerFacturesParUtilisateur } from '../store/factureSlice';
import { selectionnerToutesLesDisponibilites } from '../store/disponibiliteSlice';
import '../styles/TableauBordClient.css';
import '../styles/Dashboard.css';

const TableauBordClient = () => {
  
  const naviguer = useNavigate();
  const dispatch = useDispatch();
  const utilisateur = useSelector(state => state.utilisateur.utilisateurCourant);
  const [afficherModalEdition, setAfficherModalEdition] = useState(false);
  const [utilisateurModifie, setUtilisateurModifie] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rdvToEdit, setRdvToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    heure: '',
    motif: '',
    description: ''
  });
  const [creneauxDisponibles, setCreneauxDisponibles] = useState([]);

  const vehicules = useSelector(state => 
    state.vehicule.vehicules.filter(v => v.userId === utilisateur?.id)
  );
  
  const rendezVous = useSelector(state => selectionnerRendezVousParUtilisateur(state, utilisateur?.id));
  const factures = useSelector(state => selectionnerFacturesParUtilisateur(state, utilisateur?.id));
  const disponibilites = useSelector(selectionnerToutesLesDisponibilites);

  useEffect(() => {
    if (!utilisateur) {
      naviguer('/connexion');
    }
  }, [utilisateur, naviguer]);

  // on gere l'edition des informations de l'utilisateur ici
  const gererEdition = () => {
    setUtilisateurModifie({ ...utilisateur });
    setAfficherModalEdition(true);
  };

  // on gere la sauvegarde des informations de l'utilisateur ici
  const gererSauvegarde = () => {
    dispatch(mettreAJourUtilisateur(utilisateurModifie));
    setAfficherModalEdition(false);
  };

  // on gere la deconnexion de l'utilisateur ici
  const gererDeconnexion = () => {
    dispatch(deconnexion());
    naviguer('/');
  };

  // on gere la suppression d'un vehicule ici
  const gererSuppressionVehicule = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      dispatch(supprimerVehicule(id));
    }
  };

  // on gere l'annulation d'un rendez vous ici
  const gererAnnulationRendezVous = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      dispatch(annulerRendezVous(id));
    }
  };

  // on filtre les rendez vous acceptés qui nécessitent un paiement ici
  const rendezVousAPayer = rendezVous.filter(rdv => 
    rdv.status === 'accepté' && rdv.details?.coutEstime && !rdv.facture
  );

  // on gere le click sur le bouton d'edition d'un rendez vous ici
  const handleEditClick = (rdv) => {
    console.log('1. Début handleEditClick - RDV reçu:', rdv);
    setRdvToEdit(rdv);
    
    const creneauxMecanicien = disponibilites[rdv.mecanicienId] || {};
    console.log('2. Créneaux du mécanicien récupérés:', creneauxMecanicien);
    
    const tousLesCreneaux = Object.keys(creneauxMecanicien).reduce((acc, date) => {
      acc[date] = [...(creneauxMecanicien[date] || [])];
      return acc;
    }, {});

    if (!tousLesCreneaux[rdv.date]) {
      tousLesCreneaux[rdv.date] = [];
    }

    if (!tousLesCreneaux[rdv.date].includes(rdv.heure)) {
      tousLesCreneaux[rdv.date] = [...tousLesCreneaux[rdv.date], rdv.heure].sort();
    }

    console.log('5. Créneaux finaux disponibles:', tousLesCreneaux);
    setCreneauxDisponibles(tousLesCreneaux);
    
    setEditForm({
      date: rdv.date,
      heure: rdv.heure,
      motif: rdv.motif,
      description: rdv.description || ''
    });
    
    setShowEditModal(true);
  };

  // on gere la soumission de l'edition d'un rendez vous ici
  const handleEditSubmit = () => {
    if (!editForm.date || !editForm.heure || !editForm.motif) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const modifications = {
      ...rdvToEdit,
      ...editForm
    };

    dispatch(demanderModificationRendezVous({
      id: rdvToEdit.id,
      modifications: modifications
    }));

    setShowEditModal(false);
    setRdvToEdit(null);
    setEditForm({
      date: '',
      heure: '',
      motif: '',
      description: ''
    });
  };

  // on gere le chargement du tableau de bord du client ici
  if (!utilisateur) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <p>Chargement...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return ( // le tableau de bord du client en utilisant react-bootstrap 
    <Container fluid className="dashboard-container">
      <Row className="dashboard-header align-items-center justify-content-center mb-5">
        <Col className="text-center">
          <h1 className="display-4 fw-bold text-primary">
            Tableau de Bord Client
          </h1>
          <hr className="mx-auto" style={{ 
            width: '50%', 
            height: '3px',
            background: 'linear-gradient(to right, #0d6efd, #0dcaf0)'
          }}/>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-danger" 
            onClick={gererDeconnexion}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Déconnexion
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="info-card">
            <Card.Header className="bg-secondary text-white">
              <div>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Mes Informations
              </div>
            </Card.Header>
            <Card.Body>
              <div className="info-details">
                <p><strong>Nom:</strong> {utilisateur.lastName || utilisateur.name}</p>
                <p><strong>Prénom:</strong> {utilisateur.firstName}</p>
                <p><strong>Email:</strong> {utilisateur.email}</p>
                <p><strong>Nom d'utilisateur:</strong> {utilisateur.username}</p>
              </div>
              <div className="action-buttons">
                <Button 
                  variant="outline-secondary"
                  onClick={gererEdition}
                  className="w-100"
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Modifier mes informations
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="rendez-vous-card">
            <Card.Header className="bg-primary text-white">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Mes Rendez-vous
            </Card.Header>
            <Card.Body>
              {rendezVous.length === 0 ? (
                <p>Aucun rendez-vous programmé</p>
              ) : (
                <div className="rendez-vous-list">
                  {rendezVous.map((rdv) => (
                    <div key={rdv.id} className="rendez-vous-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            {new Date(rdv.date).toLocaleDateString()} à {rdv.heure}
                          </h6>
                          <p className="mb-1">
                            Véhicule : {rdv.vehiculeInfo.marque} {rdv.vehiculeInfo.modele}
                          </p>
                          <p className="mb-1">Motif : {rdv.motif}</p>
                          {rdv.description && (
                            <p className="mb-2 text-muted small">
                              Description : {rdv.description}
                            </p>
                          )}
                          <div className="mt-2">
                            <span className={`badge bg-${
                              rdv.status === 'planifié' ? 'warning' :
                              rdv.status === 'accepté' ? 'success' :
                              rdv.status === 'refusé' ? 'danger' : 'secondary'
                            }`}>
                              {rdv.status}
                            </span>
                          </div>

                          {rdv.status === 'accepté' && rdv.details && (
                            <div className="mt-2 p-2 bg-light rounded">
                              <div className="mb-3">
                                <p className="mb-1">
                                  <strong>Durée estimée :</strong> {rdv.details.dureeEstimee}
                                </p>
                                <p className="mb-1">
                                  <strong>Coût estimé :</strong> {rdv.details.coutEstime} CAD
                                </p>
                              </div>
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => naviguer('/client/paiement', { 
                                  state: { 
                                    montant: rdv.details.coutEstime,
                                    rdvId: rdv.id
                                  }
                                })}
                                className="w-100"
                              >
                                <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                                Payer {rdv.details.coutEstime} CAD
                              </Button>
                            </div>
                          )}

                          {rdv.status === 'refusé' && rdv.raisonRefus && (
                            <div className="mt-2 p-2 bg-light rounded border-danger">
                              <p className="mb-0 text-danger">
                                <strong>Raison du refus :</strong> {rdv.raisonRefus}
                              </p>
                            </div>
                          )}
                        </div>
                        {(rdv.status === 'planifié' || rdv.status === 'accepté') && !rdv.facture && (
                          <div className="btn-group">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditClick(rdv)}
                              className="me-1"
                              disabled={rdv.status === 'modification_en_attente'}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => gererAnnulationRendezVous(rdv.id)}
                              disabled={rdv.status === 'modification_en_attente'}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="vehicules-card">
            <Card.Header className="bg-success text-white">
              <FontAwesomeIcon icon={faCar} className="me-2" />
              Mes Vhicules
            </Card.Header>
            <Card.Body>
              {vehicules.length === 0 ? (
                <p>Aucun véhicule enregistré</p>
              ) : (
                <div className="vehicules-list">
                  {vehicules.map((vehicule) => (
                    <div key={vehicule.id} className="vehicule-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{vehicule.marque} {vehicule.modele}</h6>
                          <p className="text-muted mb-0">Année : {vehicule.annee}</p>
                          {vehicule.vin && (
                            <small className="text-muted d-block">VIN : {vehicule.vin}</small>
                          )}
                        </div>
                        <div className="btn-group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => naviguer(`/client/modifier-vehicule/${vehicule.id}`)}
                            className="me-1"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => gererSuppressionVehicule(vehicule.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="d-flex justify-content-center gap-3">
          <Button 
            variant="outline-primary" 
            size="lg"
            onClick={() => naviguer('/client/ajout-vehicule')}
          >
            <FontAwesomeIcon icon={faCar} className="me-2" />
            Enregistrer un véhicule
          </Button>
          <Button 
            variant="outline-success" 
            size="lg"
            onClick={() => naviguer('/client/rendez-vous')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            Planifier un rendez-vous
          </Button>
          {rendezVousAPayer.length > 0 ? (
            <Button 
              variant="outline-info" 
              size="lg"
              onClick={() => naviguer('/client/paiement', {
                state: {
                  montant: rendezVousAPayer[0].details.coutEstime,
                  rdvId: rendezVousAPayer[0].id
                }
              })}
            >
              <FontAwesomeIcon icon={faCreditCard} className="me-2" />
              Paiement en attente
              <Badge bg="danger" className="ms-2">
                {rendezVousAPayer.length}
              </Badge>
            </Button>
          ) : (
            <Button 
              variant="outline-info" 
              size="lg"
              disabled
            >
              <FontAwesomeIcon icon={faCreditCard} className="me-2" />
              Aucun paiement en attente
            </Button>
          )}
          <Button 
            variant="outline-secondary" 
            size="lg"
            onClick={() => naviguer('/client/factures')}
          >
            <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
            Vérifier mes factures
            {factures.length > 0 && (
              <Badge bg="secondary" className="ms-2">
                {factures.length}
              </Badge>
            )}
          </Button>
        </Col>
      </Row>

      <Modal show={afficherModalEdition} onHide={() => setAfficherModalEdition(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier mes informations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="modal-form">
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                value={utilisateurModifie?.lastName || utilisateurModifie?.name || ''}
                onChange={(e) => setUtilisateurModifie({
                  ...utilisateurModifie,
                  lastName: e.target.value,
                  name: e.target.value
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                value={utilisateurModifie?.firstName || ''}
                onChange={(e) => setUtilisateurModifie({
                  ...utilisateurModifie,
                  firstName: e.target.value
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={utilisateurModifie?.email || ''}
                onChange={(e) => setUtilisateurModifie({
                  ...utilisateurModifie,
                  email: e.target.value
                })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAfficherModalEdition(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={gererSauvegarde}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le rendez-vous</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Select
                value={editForm.date}
                onChange={(e) => {
                  console.log('7. Changement de date sélectionnée:', e.target.value);
                  console.log('8. Créneaux disponibles pour cette date:', creneauxDisponibles[e.target.value]);
                  setEditForm({
                    ...editForm,
                    date: e.target.value,
                    heure: ''
                  });
                }}
                required
              >
                <option value="">Sélectionnez une date</option>
                {Object.keys(creneauxDisponibles)
                  .sort((a, b) => new Date(a) - new Date(b))
                  .map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Heure</Form.Label>
              <Form.Select
                value={editForm.heure}
                onChange={(e) => {
                  console.log('9. Changement d\'heure sélectionnée:', e.target.value);
                  setEditForm({...editForm, heure: e.target.value});
                }}
                required
                disabled={!editForm.date}
              >
                <option value="">Sélectionnez une heure</option>
                {editForm.date && creneauxDisponibles[editForm.date]?.sort().map(heure => (
                  <option key={heure} value={heure}>
                    {heure}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Motif</Form.Label>
              <Form.Select
                value={editForm.motif}
                onChange={(e) => setEditForm({...editForm, motif: e.target.value})}
                required
              >
                <option value="">Sélectionnez un motif</option>
                <option value="Révision">Révision</option>
                <option value="Réparation">Réparation</option>
                <option value="Entretien">Entretien</option>
                <option value="Diagnostic">Diagnostic</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optionnel)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Décrivez votre problème ou besoin..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Enregistrer les modifications
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TableauBordClient; 