import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faArrowLeft, faCar, faArrowRight, faUser, faCalendarCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ajouterRendezVous } from '../store/rendezVousSlice';
import { selectionnerToutesLesDisponibilites } from '../store/disponibiliteSlice';
import '../styles/PriseRendezVous.css';
import mecanos from '../datas/mecanos';

const PriseRendezVous = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);
  const vehicules = useSelector(state => state.vehicule.vehicules) || [];
  const disponibilites = useSelector(selectionnerToutesLesDisponibilites) || {};

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  // on va gerer les etapes du rendez vous cette constante va nous permettre de savoir ou on en est dans le processus
  const [etape, setEtape] = useState(1);
  // on va gerer les informations du rendez vous ici
  const [rendezVous, setRendezVous] = useState({
    vehiculeId: '',
    mecanicienId: '',
    date: '',
    heure: '',
    motif: '',
    description: ''
  });
  const [error, setError] = useState('');

  // on va filtrer les mécaniciens seulement qui sont disponibles
  const mecaniciensDisponibles = mecanos.filter(mecanicien => {
    // on verifie si le mécanicien a des horaires configurés
    return disponibilites[mecanicien.id] && Object.keys(disponibilites[mecanicien.id]).length > 0;
  });

  const handleNext = () => {
    if (etape === 1 && !rendezVous.vehiculeId) {
      setError('Veuillez sélectionner un véhicule');
      return;
    }
    if (etape === 2 && !rendezVous.mecanicienId) {
      setError('Veuillez sélectionner un mécanicien');
      return;
    }
    if (etape === 3 && (!rendezVous.date || !rendezVous.heure)) {
      setError('Veuillez sélectionner une date et une heure');
      return;
    }
    setError('');
    setEtape(etape + 1);
  };
  // on va gerer le retour a l'etape precedente
  const handleBack = () => {
    if (etape > 1) {
      setEtape(etape - 1);
    } else {
      navigate('/client/tableau-de-bord');
    }
  };

  //etape numero 1
  const renderEtape1 = () => (
    <>
      <h5 className="mb-4">Étape 1: Sélection du véhicule</h5>
      {vehicules.length === 0 ? (
        <Alert variant="warning">
          Vous devez d'abord enregistrer un véhicule avant de prendre rendez-vous.
          <div className="mt-3">
            <Button 
              variant="primary"
              onClick={() => navigate('/client/ajout-vehicule')}
            >
              Ajouter un véhicule
            </Button>
          </div>
        </Alert>
      ) : (
        <>
          <div className="mb-4">
            {vehicules.map((vehicule) => (
              <Card 
                key={vehicule.id}
                className={`mb-3 cursor-pointer ${rendezVous.vehiculeId === vehicule.id ? 'border-primary' : ''}`}
                onClick={() => setRendezVous({...rendezVous, vehiculeId: vehicule.id})}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon 
                      icon={faCar} 
                      className={`me-3 ${rendezVous.vehiculeId === vehicule.id ? 'text-primary' : ''}`}
                      size="2x"
                    />
                    <div>
                      <h6 className="mb-1">{vehicule.marque} {vehicule.modele}</h6>
                      <p className="mb-0 text-muted">Année: {vehicule.annee}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={handleBack}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Retour
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Suivant
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Button>
          </div>
        </>
      )}
    </>
  );

  //etape numero 2
  const renderEtape2 = () => (
    <>
      <h5 className="mb-4">Étape 2: Choix du mécanicien</h5>
      {mecaniciensDisponibles.length === 0 ? (
        <Alert variant="warning">
          Aucun mécanicien n'est disponible pour le moment.
          Veuillez réessayer plus tard.
        </Alert>
      ) : (
        <div className="mb-4">
          {mecaniciensDisponibles.map((mecanicien) => (
            <Card 
              key={mecanicien.id}
              className={`mb-3 cursor-pointer ${rendezVous.mecanicienId === mecanicien.id ? 'border-primary' : ''}`}
              onClick={() => setRendezVous({...rendezVous, mecanicienId: mecanicien.id})}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-2">
                      {mecanicien.prenom} {mecanicien.nom}
                    </h6>
                    <p className="mb-1 text-muted">
                      <strong>Spécialité:</strong> {mecanicien.specialite}
                    </p>
                    <p className="mb-0 small text-muted">
                      <strong>Expérience:</strong> {mecanicien.experience}
                    </p>
                    <small className="text-success">
                      <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                      Disponible
                    </small>
                  </div>
                  {rendezVous.mecanicienId === mecanicien.id && (
                    <div className="text-primary">
                      <FontAwesomeIcon icon={faUser} size="lg" />
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Retour
        </Button>
        <Button 
          variant="primary" 
          onClick={handleNext}
          disabled={mecaniciensDisponibles.length === 0}
        >
          Suivant
          <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      </div>
    </>
  );

  //etape numero 3
  const renderEtape3 = () => {
    const mecanicienSelectionne = mecaniciensDisponibles.find(m => m.id === rendezVous.mecanicienId);
    const disponibilitesMecanicien = disponibilites[rendezVous.mecanicienId] || {};

    // Créer une copie sécurisée des créneaux
    const getCreneauxDisponibles = (date) => {
      const creneaux = disponibilitesMecanicien[date];
      return Array.isArray(creneaux) ? [...creneaux].sort() : [];
    };

    return (
      <>
        <h5 className="mb-4">Étape 3: Choix de la date et l'heure</h5>
        <Form.Group className="mb-4">
          <Form.Label>Date du rendez-vous</Form.Label>
          <Form.Select
            value={rendezVous.date}
            onChange={(e) => setRendezVous({...rendezVous, date: e.target.value, heure: ''})}
            required
          >
            <option value="">Sélectionnez une date</option>
            {Object.keys(disponibilitesMecanicien)
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

        {rendezVous.date && (
          <Form.Group className="mb-4">
            <Form.Label>Heure du rendez-vous</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {getCreneauxDisponibles(rendezVous.date).map(heure => (
                <Button
                  key={heure}
                  variant={rendezVous.heure === heure ? "primary" : "outline-primary"}
                  onClick={() => setRendezVous({...rendezVous, heure})}
                >
                  {heure}
                </Button>
              ))}
            </div>
          </Form.Group>
        )}

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <div className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour
          </Button>
          <Button 
            variant="primary" 
            onClick={handleNext}
            disabled={!rendezVous.date || !rendezVous.heure}
          >
            Suivant
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </Button>
        </div>
      </>
    );
  };

  //etape numero 4
  const renderEtape4 = () => (
    <>
      <h5 className="mb-4">Étape 4: Détails du service</h5>
      <Form.Group className="mb-4">
        <Form.Label>Type de service</Form.Label>
        <Form.Select
          value={rendezVous.motif}
          onChange={(e) => setRendezVous({...rendezVous, motif: e.target.value})}
          required
        >
          <option value="">Sélectionnez un service</option>
          <option value="revision">Révision</option>
          <option value="reparation">Réparation</option>
          <option value="diagnostic">Diagnostic</option>
          <option value="entretien">Entretien</option>
          <option value="autre">Autre</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={rendezVous.description}
          onChange={(e) => setRendezVous({...rendezVous, description: e.target.value})}
          placeholder="Décrivez votre besoin en détail..."
          required
        />
      </Form.Group>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Retour
        </Button>
        <Button 
          variant="success" 
          onClick={handleSubmit}
          disabled={!rendezVous.motif || !rendezVous.description}
        >
          Confirmer le rendez-vous
          <FontAwesomeIcon icon={faCalendarCheck} className="ms-2" />
        </Button>
      </div>
    </>
  );

  const handleSubmit = () => {
    if (!rendezVous.motif || !rendezVous.description) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const newRendezVous = {
      ...rendezVous,
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || user.name || ''}`.trim(),
      userEmail: user.email,
      status: 'planifié',
      dateCreation: new Date().toISOString(),
      vehiculeInfo: vehicules.find(v => v.id === parseInt(rendezVous.vehiculeId))
    };

    dispatch(ajouterRendezVous(newRendezVous));
    navigate('/client/tableau-de-bord');
  };

  // Si l'utilisateur n'est pas connecté, afficher un loader
  if (!user) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p className="mt-3">Chargement...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Planifier un rendez-vous
            </Card.Header>
            <Card.Body className="p-4">
              <div className="progress mb-4" style={{ height: "2px" }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${(etape / 4) * 100}%` }}
                  aria-valuenow={etape} 
                  aria-valuemin="0" 
                  aria-valuemax="4"
                ></div>
              </div>

              {etape === 1 && renderEtape1()}
              {etape === 2 && renderEtape2()}
              {etape === 3 && renderEtape3()}
              {etape === 4 && renderEtape4()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PriseRendezVous; 