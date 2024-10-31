import React from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFileInvoice, faChartLine, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/FacturesBenefices.css';

const FacturesBenefices = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.utilisateur.utilisateurCourant);
  const factures = useSelector(state => 
    state.facture.factures.filter(f => 
      f.mecanicienId === user?.id && f.status === 'payée'
    )
  );

  // methode pour calculer combien gagne le mecanicien
  const totaux = factures.reduce((acc, facture) => ({
    montantTotal: acc.montantTotal + parseFloat(facture.montantTotal || 0),
    montantMecanicien: acc.montantMecanicien + parseFloat(facture.montantMecanicien || 0)
  }), { montantTotal: 0, montantMecanicien: 0 });

  return (
    // on a utiliser le container de bootstrap pour faire de la mise en page
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Button //bouton pour retourner au tableau de bord
            variant="link" 
            className="mb-4"
            onClick={() => navigate('/mecanicien/tableau-de-bord')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour au tableau de bord 
          </Button>

          <Row className="mb-4">
            <Col> 
              {/* card bootstrap pour afficher le resume des benefices */}
              <Card> 
                <Card.Header className="bg-success text-white">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" />
                  Résumé des bénéfices
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="text-center mb-3">
                      <h6>Montant Total des Services</h6>
                      <h3 className="text-primary">{totaux.montantTotal.toFixed(2)} CAD</h3>
                    </Col>
                    <Col md={6} className="text-center mb-3">
                      <h6>Vos Bénéfices (15%)</h6>
                      <h3 className="text-success">{totaux.montantMecanicien.toFixed(2)} CAD</h3>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="bg-primary text-white">
              <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
              Historique des factures
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Montant Total</th>
                    <th>Vos Bénéfices</th>
                  </tr>
                </thead>
                <tbody>
                  {factures.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucune facture disponible
                      </td>
                    </tr>
                  ) : (
                    factures.map(facture => (
                      <tr key={facture.id}>
                        <td>{facture.id}</td>
                        <td>{new Date(facture.date).toLocaleDateString()}</td>
                        <td>{facture.userName}</td>
                        <td>{facture.service}</td>
                        <td>{parseFloat(facture.montantTotal || 0).toFixed(2)} CAD</td>
                        <td>{parseFloat(facture.montantMecanicien || 0).toFixed(2)} CAD</td>
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

export default FacturesBenefices;