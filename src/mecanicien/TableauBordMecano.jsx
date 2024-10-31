import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarWeek, 
  faSignOutAlt, 
  faCalendar, 
  faUser, 
  faFileInvoice, 
  faCheck, 
  faTimes,
  faTasks 
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  definirDisponibilites, 
  selectionnerToutesLesDisponibilites 
} from '../store/disponibiliteSlice';
import { 
  selectionnerTousLesRendezVous, 
  mettreAJourStatutRendezVous,
  approuverModificationRendezVous 
} from '../store/rendezVousSlice';
import '../styles/TableauBordMecano.css';
import '../styles/Dashboard.css';

const TableauBordMecano = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);
  const disponibilites = useSelector(selectionnerToutesLesDisponibilites);
  const rendezVous = useSelector(selectionnerTousLesRendezVous);
  const [showDispoModal, setShowDispoModal] = useState(false);
  const [plageHoraire, setPlageHoraire] = useState({
    date: '',
    plage: 'matin'
  });
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [refusInfo, setRefusInfo] = useState({ raison: '' });
  const [acceptInfo, setAcceptInfo] = useState({
    dureeEstimee: '',
    coutEstime: ''
  });

  // on verifie si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  const handleSavePlage = () => {
    let creneaux = [];
    
    // on genere les creneaux selon la plage horaire
    if (plageHoraire.plage === 'matin') {
      creneaux = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    } else {
      creneaux = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    }

    // on cree une nouvelle copie des disponibilites
    const newDisponibilites = {
      ...disponibilites,
      [user.id]: {
        ...(disponibilites[user.id] || {}),
        [plageHoraire.date]: [...creneaux]
      }
    };

    dispatch(definirDisponibilites(newDisponibilites));
    setShowDispoModal(false);
  };

  // fonction pour formater les disponibilites pour pouvoir afficher 
  const getDisponibilitesFormatees = () => {
    if (!user || !disponibilites || !disponibilites[user.id]) {
      return [];
    }

    // on cree une copie profonde des donnees pour eviter les problemes de mutation
    return Object.entries({...disponibilites[user.id]})
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, creneaux]) => ({
        date,
        creneaux: Array.isArray(creneaux) ? [...creneaux] : []
      }));
  };

  // on filtre les rendez-vous du mecanicien connecte qui sont en attente
  const rendezVousEnAttente = rendezVous.filter(rdv => 
    rdv.mecanicienId === user?.id && 
    (rdv.status === 'planifié' || rdv.status === 'modification_en_attente')
  );

  const handleAcceptRendezVous = (rdvId) => { // fonction pour accepter un rendez-vous avec l'id du rendez-vous
    dispatch(mettreAJourStatutRendezVous({
      id: rdvId,
      status: 'accepté'
    }));
  };

  const handleRefuseRendezVous = (rdvId) => {
    if (window.confirm('Êtes-vous sûr de vouloir refuser ce rendez-vous ?')) {
      dispatch(mettreAJourStatutRendezVous({
        id: rdvId,
        status: 'refusé'
      }));
    }
  };

  const handleRefuseClick = (rdv) => {
    setSelectedRdv(rdv);
    setShowRefusModal(true); //pour afficher la modal de refus
  };

  const handleAcceptClick = (rdv) => {
    setSelectedRdv(rdv);
    setShowAcceptModal(true);
  };

  const handleConfirmRefus = () => {
    if (!refusInfo.raison.trim()) {
      alert('Veuillez spécifier une raison pour le refus');
      return;
    }

    dispatch(mettreAJourStatutRendezVous({
      id: selectedRdv.id,
      status: 'refusé',
      raisonRefus: refusInfo.raison
    }));

    setShowRefusModal(false);
    setRefusInfo({ raison: '' });
    setSelectedRdv(null);
  };

  const handleConfirmAccept = () => {
    if (!acceptInfo.dureeEstimee || !acceptInfo.coutEstime) {
      alert('Veuillez remplir toutes les informations');
      return;
    }

    dispatch(mettreAJourStatutRendezVous({
      id: selectedRdv.id,
      status: 'accepté',
      details: {
        dureeEstimee: acceptInfo.dureeEstimee,
        coutEstime: acceptInfo.coutEstime
      }
    }));

    setShowAcceptModal(false);
    setAcceptInfo({ dureeEstimee: '', coutEstime: '' });
    setSelectedRdv(null);
  };

  // si l'utilisateur n'est pas connecte, on affiche un loader 
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
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="display-4 fw-bold text-primary text-center">
            Tableau de Bord Mécanicien
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
            onClick={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Déconnexion
          </Button>
        </Col>
      </Row>

      <Row>
        {/* card bootstrap pour afficher les informations du mecanicien */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header className="bg-secondary text-white">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Mes Informations
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <p><strong>Nom:</strong> {user.nom}</p>
                <p><strong>Prénom:</strong> {user.prenom}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Spécialité:</strong> {user.specialite}</p>
                <p><strong>Expérience:</strong> {user.experience}</p>
              </div>
              <div className="d-grid">
                <Button variant="outline-secondary">
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Modifier mes informations
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* card bootstrap pour afficher les rendez-vous en attente */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header className="bg-warning text-white">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Rendez-vous en attente
              {rendezVousEnAttente.length > 0 && (
                <Badge bg="danger" className="ms-2">
                  {rendezVousEnAttente.length}
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              <div className="rendez-vous-list">
                {rendezVousEnAttente.length === 0 ? (
                  <Alert variant="info">
                    Aucun rendez-vous en attente de confirmation
                  </Alert>
                ) : (
                  rendezVousEnAttente.map((rdv) => (
                    <Card key={rdv.id} className="mb-3 border-warning">
                      <Card.Body>
                        {rdv.status === 'modification_en_attente' && (
                          <Alert variant="info" className="mb-2">
                            Demande de modification
                            <hr/>
                            <small>
                              <strong>Changements demandés :</strong><br/>
                              Date: {new Date(rdv.modifications.date).toLocaleDateString()}<br/>
                              Heure: {rdv.modifications.heure}<br/>
                              Motif: {rdv.modifications.motif}
                            </small>
                          </Alert>
                        )}
                        <h6 className="mb-2">
                          {new Date(rdv.date).toLocaleDateString()} à {rdv.heure}
                        </h6>
                        <p className="mb-1">
                          <strong>Client:</strong> {rdv.userName}
                        </p>
                        <p className="mb-1">
                          <strong>Véhicule:</strong> {rdv.vehiculeInfo.marque} {rdv.vehiculeInfo.modele}
                        </p>
                        <p className="mb-1">
                          <strong>Service:</strong> {rdv.motif}
                        </p>
                        {rdv.description && (
                          <p className="mb-3 text-muted small">
                            <strong>Description:</strong> {rdv.description}
                          </p>
                        )}
                        <div className="d-flex gap-2">
                          {rdv.status === 'modification_en_attente' ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => dispatch(approuverModificationRendezVous({ id: rdv.id }))}
                              >
                                <FontAwesomeIcon icon={faCheck} className="me-1" />
                                Approuver les modifications
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedRdv(rdv);
                                  setShowRefusModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTimes} className="me-1" />
                                Refuser les modifications
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAcceptClick(rdv)}
                              >
                                <FontAwesomeIcon icon={faCheck} className="me-1" />
                                Accepter
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRefuseClick(rdv)}
                              >
                                <FontAwesomeIcon icon={faTimes} className="me-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* card bootstrap pour afficher les horaires du mecanicien */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header className="bg-success text-white">
              <FontAwesomeIcon icon={faCalendarWeek} className="me-2" />
              Mon Planning
            </Card.Header>
            <Card.Body>
              <div className="horaires-list">
                {getDisponibilitesFormatees().length === 0 ? (
                  <Alert variant="info">
                    Aucune disponibilité configurée
                  </Alert>
                ) : (
                  getDisponibilitesFormatees().map(({ date, creneaux }) => (
                    <div key={date} className="mb-3">
                      <h6>{new Date(date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {creneaux
                          .sort((a, b) => a.localeCompare(b))
                          .map((creneau) => (
                            <Badge 
                              key={`${date}-${creneau}`} 
                              bg="success" 
                              className="p-2"
                            >
                              {creneau}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-info text-white">
              <FontAwesomeIcon icon={faTasks} className="me-2" />
              Historique des Rendez-vous Traités
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Véhicule</th>
                      <th>Service</th>
                      <th>Statut</th>
                      <th>Durée</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendezVous
                      .filter(rdv => 
                        rdv.mecanicienId === user?.id && 
                        (rdv.status === 'accepté' || rdv.status === 'refusé' || rdv.status === 'terminé' || rdv.status === 'payé')
                      )
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(rdv => (
                        <tr key={rdv.id}>
                          <td>{new Date(rdv.date).toLocaleDateString()} à {rdv.heure}</td>
                          <td>{rdv.userName}</td>
                          <td>{rdv.vehiculeInfo.marque} {rdv.vehiculeInfo.modele}</td>
                          <td>{rdv.motif}</td>
                          <td>
                            <Badge bg={
                              rdv.status === 'accepté' ? 'success' :
                              rdv.status === 'refusé' ? 'danger' : 
                              rdv.status === 'payé' ? 'info' :
                              'primary'
                            }>
                              {rdv.status}
                            </Badge>
                          </td>
                          <td>{rdv.details?.dureeEstimee || '-'}</td>
                          <td>{rdv.details?.coutEstime ? `${rdv.details.coutEstime} CAD` : '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
                {rendezVous.filter(rdv => 
                  rdv.mecanicienId === user?.id && 
                  (rdv.status === 'accepté' || rdv.status === 'refusé' || rdv.status === 'terminé' || rdv.status === 'payé')
                ).length === 0 && (
                  <Alert variant="info" className="text-center">
                    Aucun rendez-vous traité pour le moment
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* deux boutons pour ajouter des disponibilites et voir les factures et benefices */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-center gap-3">
          <Button 
            variant="outline-primary" 
            size="lg"
            onClick={() => navigate('/mecanicien/ajout-disponibilite')}
          >
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            Ajouter des disponibilités
          </Button>
          <Button 
            variant="outline-success" 
            size="lg"
            onClick={() => navigate('/mecanicien/factures-benefices')}
          >
            <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
            Factures et bénéfices
          </Button>
        </Col>
      </Row>

      {/* Modal de refus */}
      <Modal show={showRefusModal} onHide={() => setShowRefusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Refuser le rendez-vous</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Raison du refus</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={refusInfo.raison}
              onChange={(e) => setRefusInfo({ raison: e.target.value })}
              placeholder="Veuillez expliquer la raison du refus..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRefusModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmRefus}>
            Confirmer le refus
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'acceptation */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Accepter le rendez-vous</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Durée estimée des travaux</Form.Label>
            <Form.Select
              value={acceptInfo.dureeEstimee}
              onChange={(e) => setAcceptInfo({...acceptInfo, dureeEstimee: e.target.value})}
              required
            >
              <option value="">Sélectionnez une durée</option>
              <option value="30min">30 minutes</option>
              <option value="1h">1 heure</option>
              <option value="1h30">1h30</option>
              <option value="2h">2 heures</option>
              <option value="2h30">2h30</option>
              <option value="3h">3 heures</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>montant a payer (CAD)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={acceptInfo.coutEstime}
              onChange={(e) => setAcceptInfo({...acceptInfo, coutEstime: e.target.value})}
              placeholder="0.00"
              required
            />
            <Form.Text className="text-muted">
              Entrez le montant en dollars canadiens
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleConfirmAccept}>
            Confirmer l'acceptation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TableauBordMecano; 