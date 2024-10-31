import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vehicules: [],
  vehiculeSelectionne: null,
  chargement: false,
  erreur: null
};

const vehiculeSlice = createSlice({
  name: 'vehicule',
  initialState,
  reducers: {
    // Ajouter un véhicule
    ajouterVehicule: (state, action) => {
      state.vehicules.push({
        ...action.payload,
        id: Date.now(), // Génère un ID unique
        dateAjout: new Date().toISOString()
      });
    },

    // Supprimer un véhicule
    supprimerVehicule: (state, action) => {
      state.vehicules = state.vehicules.filter(
        vehicule => vehicule.id !== action.payload
      );
    },

    // Mettre à jour un véhicule
    mettreAJourVehicule: (state, action) => {
      const index = state.vehicules.findIndex(
        vehicule => vehicule.id === action.payload.id
      );
      if (index !== -1) {
        state.vehicules[index] = {
          ...state.vehicules[index],
          ...action.payload
        };
      }
    },

    // Sélectionner un véhicule
    selectionnerVehicule: (state, action) => {
      state.vehiculeSelectionne = action.payload;
    },

    // Définir la liste des véhicules
    definirVehicules: (state, action) => {
      state.vehicules = action.payload;
    },

    // Gérer le chargement
    definirChargement: (state, action) => {
      state.chargement = action.payload;
    },

    // Gérer les erreurs
    definirErreur: (state, action) => {
      state.erreur = action.payload;
    },

    // Vider les véhicules lors de la déconnexion
    viderVehicules: (state) => {
      state.vehicules = [];
      state.vehiculeSelectionne = null;
    }
  }
});

// Export des actions
export const {
  ajouterVehicule,
  supprimerVehicule,
  mettreAJourVehicule,
  selectionnerVehicule,
  definirVehicules,
  definirChargement,
  definirErreur,
  viderVehicules
} = vehiculeSlice.actions;

// Sélecteurs modifiés pour filtrer par utilisateur
export const selectionnerTousLesVehicules = (state) => {
  const userId = state.utilisateur.utilisateurCourant?.id;
  return state.vehicule.vehicules.filter(v => v.userId === userId);
};

export const selectionnerVehiculeSelectionne = (state) => state.vehicule.vehiculeSelectionne;
export const selectionnerChargementVehicule = (state) => state.vehicule.chargement;
export const selectionnerErreurVehicule = (state) => state.vehicule.erreur;

export default vehiculeSlice.reducer; 