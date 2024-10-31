import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import mecanos from '../datas/mecanos';
import { definirUtilisateur } from '../store/userSlice';
import '../styles/Connexion.css';

const Connexion = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isMecano, setIsMecano] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupérer les utilisateurs stockés
  const storedUsers = JSON.parse(localStorage.getItem('storedUsers') || '[]');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isMecano) {
      const mecano = mecanos.find(
        m => m.username === username && m.password === password
      );

      if (mecano) {
        dispatch(definirUtilisateur({ ...mecano, type: 'mecanicien' }));
        navigate('/mecanicien/tableau-de-bord');
      } else {
        setError('Identifiants mécanicien invalides');
      }
      setLoading(false);
      return;
    }

    // Vérifier dans le store
    const storedUser = storedUsers.find(user => user.username === username);

    if (storedUser) {
      dispatch(definirUtilisateur({ ...storedUser, type: 'client' }));
      navigate('/client/tableau-de-bord');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newUser = { ...data, type: 'client' };
        dispatch(definirUtilisateur(newUser));
        navigate('/client/tableau-de-bord');
      } else {
        throw new Error('Identifiants invalides');
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Button 
            variant="link" 
            className="mb-4"
            onClick={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour
          </Button>
          
          <Card>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Connexion</h2>
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Nom d'utilisateur
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Mot de passe
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Je suis un mécanicien"
                    checked={isMecano}
                    onChange={(e) => setIsMecano(e.target.checked)}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
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

export default Connexion;