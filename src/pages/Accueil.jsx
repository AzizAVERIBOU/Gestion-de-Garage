import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUserPlus, faCar } from '@fortawesome/free-solid-svg-icons';
import '../styles/Accueil.css';

const Accueil = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faCar} size="4x" className="text-primary mb-3" />
                <h1 className="display-5 fw-bold">Bienvenue</h1>
                <p className="lead text-muted mb-4">
                  Ici c'est notre garage ! <br/>
                  Nous vous proposons de vous connecter ou de vous inscrire pour accéder à nos services.
                </p>
              </div>
              {/*mes boutons pour la connexion et inscription */}
              <div className="d-grid gap-3">
                <Button  
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/connexion')}
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                  Connexion
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="lg"
                  onClick={() => navigate('/inscription')}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Inscription
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Accueil; 