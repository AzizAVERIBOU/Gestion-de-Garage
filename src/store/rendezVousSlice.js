import { createSlice } from '@reduxjs/toolkit';

const initialState = { // on definit l'etat initial pour les rendez-vous
  rendezVous: [],
  loading: false, // pour gerer le chargement
  error: null 
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
    },
    
    // pour mettre a jour les informations d'un rendez vous
    mettreAJourRendezVous: (state, action) => {
      console.log('15. Reducer mettreAJourRendezVous - Payload reçu:', action.payload);
      const index = state.rendezVous.findIndex(rdv => rdv.id === action.payload.id);
      console.log('16. Index du rendez-vous trouvé:', index);
      
      if (index !== -1) {
        state.rendezVous[index] = action.payload;
        console.log('17. Rendez-vous mis à jour dans le state');
      } else {
        console.log('18. ERREUR: Rendez-vous non trouvé dans le state');
      }
      
      console.log('19. État final des rendez-vous:', state.rendezVous);
    },

    // pour demander une modification d'un rendez vous
    demanderModificationRendezVous: (state, action) => {
      const { id, modifications } = action.payload;
      const rdv = state.rendezVous.find(r => r.id === id);
      
      if (rdv) {
        rdv.status = 'modification_en_attente';
        rdv.modifications = modifications;
        rdv.dateDemandeModification = new Date().toISOString();
      }
    },

    // pour approuver une modification d'un rendez vous
    approuverModificationRendezVous: (state, action) => {
      const { id } = action.payload;
      const rdv = state.rendezVous.find(r => r.id === id);
      
      if (rdv && rdv.modifications) {
        Object.assign(rdv, rdv.modifications);
        rdv.status = 'accepté';
        delete rdv.modifications;
        delete rdv.dateDemandeModification;
      }
    },

    // pour refuser une modification d'un rendez vous
    refuserModificationRendezVous: (state, action) => {
      const { id, raisonRefus } = action.payload;
      const rdv = state.rendezVous.find(r => r.id === id);
      
      if (rdv) {
        rdv.status = 'accepté'; // Retour au statut précédent
        rdv.raisonRefusModification = raisonRefus;
        delete rdv.modifications;
        delete rdv.dateDemandeModification;
      }
    }
  }
});

// on exporte toutes les actions
export const {
  ajouterRendezVous,
  mettreAJourStatutRendezVous,
  annulerRendezVous,
  definirChargement,
  definirErreur,
  mettreAJourRendezVous,
  demanderModificationRendezVous,
  approuverModificationRendezVous,
  refuserModificationRendezVous
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