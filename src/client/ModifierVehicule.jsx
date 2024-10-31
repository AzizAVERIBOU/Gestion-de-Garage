import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { mettreAJourVehicule } from '../store/vehiculeSlice';
import '../styles/ModifierVehicule.css';

const ModifierVehicule = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const user = useSelector(state => state.user.currentUser);
  const vehicules = useSelector(state => state.vehicule.vehicules);
  const vehiculeToEdit = vehicules.find(v => v.id === parseInt(id));

  const [vehicule, setVehicule] = useState({
    marque: '',
    modele: '',
    annee: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }

    if (vehiculeToEdit) {
      setVehicule(vehiculeToEdit);
    } else {
      navigate('/client/tableau-de-bord');
    }
  }, [user, vehiculeToEdit, navigate]);

  // Générer la liste des années
  const anneeActuelle = new Date().getFullYear();
  const annees = Array.from(
    { length: anneeActuelle - 1949 },
    (_, i) => anneeActuelle - i
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(mettreAJourVehicule({ ...vehicule, id: parseInt(id) }));
    navigate('/client/tableau-de-bord');
  };

  if (!vehiculeToEdit) {
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
              Modifier le véhicule
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Marque</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicule.marque}
                        onChange={(e) => setVehicule({...vehicule, marque: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Modèle</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicule.modele}
                        onChange={(e) => setVehicule({...vehicule, modele: e.target.value})}
                        required
                      />
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

                <div className="d-grid">
                  <Button variant="primary" type="submit">
                    Enregistrer les modifications
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

export default ModifierVehicule; 