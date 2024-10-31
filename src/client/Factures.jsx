import React from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectionnerFacturesParUtilisateur } from '../store/factureSlice';
import '../styles/Factures.css';

const Factures = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);
  const factures = useSelector(state => selectionnerFacturesParUtilisateur(state, user?.id));

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    // on affiche la page des factures en utilisant le rendu de bootstrap 
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Button 
            variant="link" 
            className="mb-4"
            onClick={() => navigate('/client/tableau-de-bord')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour au tableau de bord
          </Button>

          <Card>
            <Card.Header className="bg-secondary text-white">
              <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
              Mes Factures
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Date</th>
                    <th>Véhicule</th>
                    <th>Service</th>
                    <th>Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {factures.length === 0 ? ( // si il n'y a pas de facture on affiche un message
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucune facture disponible
                      </td>
                    </tr>
                  ) : (
                    factures.map(facture => ( // on map les factures pour les afficher
                      <tr key={facture.id}>
                        <td>{facture.id}</td>
                        <td>{formatDate(facture.date)}</td>
                        <td>
                          {facture.vehicule.marque} {facture.vehicule.modele} ({facture.vehicule.annee})
                        </td>
                        <td>{facture.service}</td>
                        <td>{facture.montant} CAD</td>
                        <td>
                          <span className={`badge bg-${facture.status === 'payée' ? 'success' : 'warning'}`}>
                            {facture.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Factures; 