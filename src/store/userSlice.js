import { createSlice } from '@reduxjs/toolkit';

// on vide le localStorage au chargement de la page pour reprendre des nouvelles donnees charger de l'api
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
    // on definit l'utilisateur courant
    definirUtilisateur: (state, action) => {
      state.utilisateurCourant = action.payload;
      state.estAuthentifie = !!action.payload; 
      state.typeUtilisateur = action.payload?.type || null;
      
      // on sauvegarde dans le localStorage
      if (action.payload) {
        const utilisateursStockes = JSON.parse(localStorage.getItem('utilisateursStockes') || '[]');
        const indexUtilisateur = utilisateursStockes.findIndex(u => u.username === action.payload.username);
        
        if (indexUtilisateur === -1) {
          // on ajoute le nouvel utilisateur
          utilisateursStockes.push(action.payload);
        } else {
          // on met a jour l'utilisateur existant
          utilisateursStockes[indexUtilisateur] = action.payload;
        }
        
        localStorage.setItem('utilisateursStockes', JSON.stringify(utilisateursStockes));
      }
    },

    // on met a jour l'utilisateur
    mettreAJourUtilisateur: (state, action) => {
      state.utilisateurCourant = { ...state.utilisateurCourant, ...action.payload };
      
      // on met a jour dans le localStorage
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

// action de deconnexion simplifiee
export const deconnexion = () => (dispatch) => {
  dispatch(definirUtilisateur(null));
};

export default userSlice.reducer; 