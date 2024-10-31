import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import TableauBordClient from './client/TableauBordClient';
import TableauBordMecano from './mecanicien/TableauBordMecano';
import AjoutVehicule from './client/AjoutVehicule';
import PriseRendezVous from './client/PriseRendezVous';
import Paiement from './client/Paiement';
import Factures from './client/Factures';
import ModifierVehicule from './client/ModifierVehicule';
import AjoutDisponibilite from './mecanicien/AjoutDisponibilite';
import FacturesBenefices from './mecanicien/FacturesBenefices';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/client/tableau-de-bord" element={<TableauBordClient />} />
        <Route path="/mecanicien/tableau-de-bord" element={<TableauBordMecano />} />
        <Route path="/client/ajout-vehicule" element={<AjoutVehicule />} />
        <Route path="/client/rendez-vous" element={<PriseRendezVous />} />
        <Route path="/client/paiement" element={<Paiement />} />
        <Route path="/client/factures" element={<Factures />} />
        <Route path="/client/modifier-vehicule/:id" element={<ModifierVehicule />} />
        <Route path="/mecanicien/ajout-disponibilite" element={<AjoutDisponibilite />} />
        <Route path="/mecanicien/factures-benefices" element={<FacturesBenefices />} />
      </Routes>
    </Router>
  );
}

export default App;
