import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { definirDisponibilites } from '../store/disponibiliteSlice';
import '../styles/AjoutDisponibilite.css';

const AjoutDisponibilite = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);
  const [error, setError] = useState('');
  const [plageHoraire, setPlageHoraire] = useState({
    date: '',
    plage: 'matin'
  });

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Vérifier si la date est un dimanche
    const date = new Date(plageHoraire.date);
    if (date.getDay() === 0) {
      setError('Les dimanches ne sont pas disponibles');
      return;
    }

    // nous avons definis ces plages horaires pour faciliter la gestion des disponibilites au niveau des horaires
    // comme ca on peut utiliser les fonctionnalite de cliquer sur une plage horaire pour ajouter une disponibilite
    // au lieu de devoir entrer les horaires manuellement avec le calendrier propre a react bootstrap
    let creneaux = [];
    if (plageHoraire.plage === 'matin') {
      creneaux = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    } else if (plageHoraire.plage === 'apres-midi') {
      creneaux = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    } else {
      creneaux = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
      ];
    }

    dispatch(definirDisponibilites({
      mecanicienId: user.id,
      date: plageHoraire.date,
      creneaux: creneaux
    }));

    navigate('/mecanicien/tableau-de-bord');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Button  //bouton pour retourner au tableau de bord
            variant="link" 
            className="mb-4"
            onClick={() => navigate('/mecanicien/tableau-de-bord')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour au tableau de bord
          </Button>
          {/* card bootstrap pour ajouter des disponibilites */}
          <Card>  
            <Card.Header className="bg-primary text-white">
              <FontAwesomeIcon icon={faCalendar} className="me-2" />
              Ajouter des disponibilités
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={plageHoraire.date}
                    onChange={(e) => setPlageHoraire({ ...plageHoraire, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <Form.Text className="text-muted">
                    Les dimanches ne sont pas disponibles
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Plage horaire</Form.Label>
                  <Form.Select
                    value={plageHoraire.plage}
                    onChange={(e) => setPlageHoraire({ ...plageHoraire, plage: e.target.value })}
                    required
                  >
                    <option value="matin">Matin (8h - 12h)</option>
                    <option value="apres-midi">Après-midi (14h - 18h)</option>
                    <option value="journee">Journée complète (8h - 18h)</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit">
                    Enregistrer les disponibilités
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

export default AjoutDisponibilite; 