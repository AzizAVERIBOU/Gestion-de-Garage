import { createSlice } from '@reduxjs/toolkit';

const initialState = { // on definit l'etat initial pour les rendez-vous
  rendezVous: [],
  loading: false, // pour gerer le chargement
  error: null // pour gerer les erreurs
};

const rendezVousSlice = createSlice({
  name: 'rendezVous',
  initialState,
  reducers: {
    // pour ajouter un nouveau rendez-vous
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

    // pour mettre a jour le statut d'un rendez-vous (accepté, refusé, etc.)
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

    // pour annuler un rendez-vous
    annulerRendezVous: (state, action) => {
      const rdv = state.rendezVous.find(r => r.id === action.payload);
      if (rdv) {
        rdv.status = 'annulé';
      }
    },

    // pour definir l'etat de chargement
    definirChargement: (state, action) => {
      state.loading = action.payload;
    },

    // pour definir une erreur
    definirErreur: (state, action) => {
      state.error = action.payload;
    }
  }
});

// on exporte toutes les actions
export const {
  ajouterRendezVous,
  mettreAJourStatutRendezVous,
  annulerRendezVous,
  definirChargement,
  definirErreur
} = rendezVousSlice.actions;

  // on selectionne tous les rendez-vous
export const selectionnerTousLesRendezVous = (state) => state.rendezVous.rendezVous;
// on selectionne les rendez-vous par utilisateur
export const selectionnerRendezVousParUtilisateur = (state, userId) => 
  state.rendezVous.rendezVous.filter(rdv => rdv.userId === userId);
// on selectionne le chargement
export const selectionnerChargement = (state) => state.rendezVous.loading;
// on selectionne les erreurs pour les rendez-vous
export const selectionnerErreur = (state) => state.rendezVous.error;

export default rendezVousSlice.reducer;  