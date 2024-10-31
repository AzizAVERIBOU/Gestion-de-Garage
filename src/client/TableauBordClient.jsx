import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faCar, 
  faSignOutAlt,
  faUser,
  faEdit,
  faCreditCard,
  faFileInvoice,
  faTrash,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { definirUtilisateur, mettreAJourUtilisateur, deconnexion } from '../store/userSlice';
import { supprimerVehicule } from '../store/vehiculeSlice';
import { 
  selectionnerRendezVousParUtilisateur, 
  annulerRendezVous 
} from '../store/rendezVousSlice';
import { selectionnerFacturesParUtilisateur } from '../store/factureSlice';
import '../styles/TableauBordClient.css';
import '../styles/Dashboard.css';

const TableauBordClient = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  
  // Filtrer les véhicules pour n'afficher que ceux de l'utilisateur connecté
  const vehicules = useSelector(state => 
    state.vehicule.vehicules.filter(v => v.userId === user?.id)
  );
  
  const rendezVous = useSelector(state => selectionnerRendezVousParUtilisateur(state, user?.id));
  const factures = useSelector(state => selectionnerFacturesParUtilisateur(state, user?.id));

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  const handleEdit = () => {
    setEditedUser({ ...user });
    setShowEditModal(true);
  };

  const handleSave = () => {
    dispatch(mettreAJourUtilisateur(editedUser));
    setShowEditModal(false);
  };

  const handleLogout = () => {
    dispatch(deconnexion());
    navigate('/');
  };

  const handleDeleteVehicule = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      dispatch(supprimerVehicule(id));
    }
  };

  const handleCancelRendezVous = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      dispatch(annulerRendezVous(id));
    }
  };

  // Filtrer les rendez-vous acceptés qui nécessitent un paiement
  const rendezVousAPayer = rendezVous.filter(rdv => 
    rdv.status === 'accepté' && rdv.details?.coutEstime && !rdv.facture
  );

  if (!user) {
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

  return (
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
            onClick={handleLogout}
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
                <p><strong>Nom:</strong> {user.lastName || user.name}</p>
                <p><strong>Prénom:</strong> {user.firstName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
              </div>
              <div className="action-buttons">
                <Button 
                  variant="outline-secondary"
                  onClick={handleEdit}
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
                                onClick={() => navigate('/client/paiement', { 
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
                        {rdv.status === 'planifié' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancelRendezVous(rdv.id)}
                            title="Annuler le rendez-vous"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
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
                            onClick={() => navigate(`/client/modifier-vehicule/${vehicule.id}`)}
                            className="me-1"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteVehicule(vehicule.id)}
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
            onClick={() => navigate('/client/ajout-vehicule')}
          >
            <FontAwesomeIcon icon={faCar} className="me-2" />
            Enregistrer un véhicule
          </Button>
          <Button 
            variant="outline-success" 
            size="lg"
            onClick={() => navigate('/client/rendez-vous')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            Planifier un rendez-vous
          </Button>
          {rendezVousAPayer.length > 0 ? (
            <Button 
              variant="outline-info" 
              size="lg"
              onClick={() => navigate('/client/paiement', {
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
            onClick={() => navigate('/client/factures')}
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier mes informations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="modal-form">
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                value={editedUser?.lastName || editedUser?.name || ''}
                onChange={(e) => setEditedUser({
                  ...editedUser,
                  lastName: e.target.value,
                  name: e.target.value
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                value={editedUser?.firstName || ''}
                onChange={(e) => setEditedUser({
                  ...editedUser,
                  firstName: e.target.value
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editedUser?.email || ''}
                onChange={(e) => setEditedUser({
                  ...editedUser,
                  email: e.target.value
                })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TableauBordClient; 