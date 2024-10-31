import { configureStore } from '@reduxjs/toolkit';
import utilisateurReducer from './userSlice';
import vehiculeReducer from './vehiculeSlice';
import rendezVousReducer from './rendezVousSlice';
import disponibiliteReducer from './disponibiliteSlice';
import factureReducer from './factureSlice';
import paiementReducer from './paiementSlice';

export const store = configureStore({ // avec la nouvelle version on a essyer d'utiliser createStore mais sa marque un erreur
   // et donc on a utilise configureStore qui est marque comme la bonne pratique dans la documentation de redux
  reducer: {
    utilisateur: utilisateurReducer,
    vehicule: vehiculeReducer,
    rendezVous: rendezVousReducer,
    disponibilite: disponibiliteReducer,
    facture: factureReducer,
    paiement: paiementReducer,
  },
}); 