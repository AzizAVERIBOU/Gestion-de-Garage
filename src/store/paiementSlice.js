import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  methodesEnregistrees: {}, // { userId: [{ id, numeroCarte, dateExpiration, nomCarte }] }
  chargement: false,
  erreur: null
};

const paiementSlice = createSlice({
  name: 'paiement',
  initialState,
  reducers: {
    // Ajouter une nouvelle méthode de paiement
    ajouterMethodePaiement: (state, action) => {
      const { userId, methodePaiement } = action.payload;
      if (!state.methodesEnregistrees[userId]) {
        state.methodesEnregistrees[userId] = [];
      }
      // Masquer le numéro de carte sauf les 4 derniers chiffres
      const carteMasquee = {
        ...methodePaiement,
        id: Date.now(),
        numeroCarte: `**** **** **** ${methodePaiement.numeroCarte.slice(-4)}`
      };
      state.methodesEnregistrees[userId].push(carteMasquee);
    },

    // Supprimer une méthode de paiement
    supprimerMethodePaiement: (state, action) => {
      const { userId, methodePaiementId } = action.payload;
      if (state.methodesEnregistrees[userId]) {
        state.methodesEnregistrees[userId] = state.methodesEnregistrees[userId]
          .filter(m => m.id !== methodePaiementId);
      }
    },

    // Gérer le chargement
    definirChargement: (state, action) => {
      state.chargement = action.payload;
    },

    // Gérer les erreurs
    definirErreur: (state, action) => {
      state.erreur = action.payload;
    }
  }
});

// Export des actions
export const {
  ajouterMethodePaiement,
  supprimerMethodePaiement,
  definirChargement,
  definirErreur
} = paiementSlice.actions;

// Sélecteur pour récupérer les méthodes de paiement d'un utilisateur
export const selectionnerMethodesPaiementParUtilisateur = (state, userId) => 
  state.paiement.methodesEnregistrees[userId] || [];

export default paiementSlice.reducer; 