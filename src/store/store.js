import { configureStore } from '@reduxjs/toolkit';
import utilisateurReducer from './userSlice';
import vehiculeReducer from './vehiculeSlice';
import rendezVousReducer from './rendezVousSlice';
import disponibiliteReducer from './disponibiliteSlice';
import factureReducer from './factureSlice';
import paiementReducer from './paiementSlice';

export const store = configureStore({
  reducer: {
    utilisateur: utilisateurReducer,
    vehicule: vehiculeReducer,
    rendezVous: rendezVousReducer,
    disponibilite: disponibiliteReducer,
    facture: factureReducer,
    paiement: paiementReducer,
  },
}); 