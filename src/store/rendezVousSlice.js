import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rendezVous: [],
  loading: false,
  error: null
};

const rendezVousSlice = createSlice({
  name: 'rendezVous',
  initialState,
  reducers: {
    // Ajouter un nouveau rendez-vous
    ajouterRendezVous: (state, action) => {
      console.log('Action ajouterRendezVous:', action.payload);
      const nouveauRendezVous = {
        ...action.payload,
        id: Date.now(),
        status: 'planifié',
        dateCreation: new Date().toISOString()
      };
      console.log('Nouveau rendez-vous créé:', nouveauRendezVous);
      state.rendezVous.push(nouveauRendezVous);
    },

    // Mettre à jour le statut d'un rendez-vous (accepté, refusé, etc.)
    mettreAJourStatutRendezVous: (state, action) => {
      const { id, status, details, raisonRefus } = action.payload;
      const rdv = state.rendezVous.find(r => r.id === id);
      
      if (rdv) {
        rdv.status = status;
        if (status === 'accepté' && details) {
          rdv.details = {
            dureeEstimee: details.dureeEstimee,
            coutEstime: details.coutEstime
          };
        }
        if (status === 'refusé' && raisonRefus) {
          rdv.raisonRefus = raisonRefus;
        }
      }
    },

    // Annuler un rendez-vous
    annulerRendezVous: (state, action) => {
      const rdv = state.rendezVous.find(r => r.id === action.payload);
      if (rdv) {
        rdv.status = 'annulé';
      }
    },

    // Définir l'état de chargement
    definirChargement: (state, action) => {
      state.loading = action.payload;
    },

    // Définir une erreur
    definirErreur: (state, action) => {
      state.error = action.payload;
    }
  }
});

// Export des actions avec les nouveaux noms
export const {
  ajouterRendezVous,
  mettreAJourStatutRendezVous,
  annulerRendezVous,
  definirChargement,
  definirErreur
} = rendezVousSlice.actions;

// Sélecteurs pour accéder aux données
export const selectionnerTousLesRendezVous = (state) => state.rendezVous.rendezVous;
export const selectionnerRendezVousParUtilisateur = (state, userId) => 
  state.rendezVous.rendezVous.filter(rdv => rdv.userId === userId);
export const selectionnerChargement = (state) => state.rendezVous.loading;
export const selectionnerErreur = (state) => state.rendezVous.error;

export default rendezVousSlice.reducer; 