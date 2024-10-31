import { createSlice } from '@reduxjs/toolkit';

// Vider le localStorage au chargement de la page
window.addEventListener('load', () => {
  localStorage.clear();
});

const initialState = {
  utilisateurCourant: null,
  estAuthentifie: false,
  typeUtilisateur: null
};

const userSlice = createSlice({
  name: 'utilisateur',
  initialState,
  reducers: {
    // Définir l'utilisateur courant
    definirUtilisateur: (state, action) => {
      state.utilisateurCourant = action.payload;
      state.estAuthentifie = !!action.payload;
      state.typeUtilisateur = action.payload?.type || null;
      
      // Sauvegarder dans le localStorage
      if (action.payload) {
        const utilisateursStockes = JSON.parse(localStorage.getItem('utilisateursStockes') || '[]');
        const indexUtilisateur = utilisateursStockes.findIndex(u => u.username === action.payload.username);
        
        if (indexUtilisateur === -1) {
          // Ajouter le nouvel utilisateur
          utilisateursStockes.push(action.payload);
        } else {
          // Mettre à jour l'utilisateur existant
          utilisateursStockes[indexUtilisateur] = action.payload;
        }
        
        localStorage.setItem('utilisateursStockes', JSON.stringify(utilisateursStockes));
      }
    },

    // Mettre à jour l'utilisateur
    mettreAJourUtilisateur: (state, action) => {
      state.utilisateurCourant = { ...state.utilisateurCourant, ...action.payload };
      
      // Mettre à jour dans le localStorage
      const utilisateursStockes = JSON.parse(localStorage.getItem('utilisateursStockes') || '[]');
      const indexUtilisateur = utilisateursStockes.findIndex(u => u.username === state.utilisateurCourant.username);
      
      if (indexUtilisateur !== -1) {
        utilisateursStockes[indexUtilisateur] = state.utilisateurCourant;
        localStorage.setItem('utilisateursStockes', JSON.stringify(utilisateursStockes));
      }
    }
  }
});

export const { definirUtilisateur, mettreAJourUtilisateur } = userSlice.actions;

// Action de déconnexion simplifiée
export const deconnexion = () => (dispatch) => {
  dispatch(definirUtilisateur(null));
};

export default userSlice.reducer; 