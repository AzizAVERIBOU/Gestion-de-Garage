import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  methodesEnregistrees: {}, // on definit un objet pour les methodes de paiement qui contient l'id de l'utilisateur, le numero de carte, la date d'expiration et le nom de la carte
  chargement: false,
  erreur: null
};

const paiementSlice = createSlice({
  name: 'paiement',
  initialState,
  reducers: {
    // pour ajouter une nouvelle methode de paiement
    ajouterMethodePaiement: (state, action) => {
      const { userId, methodePaiement } = action.payload;
      if (!state.methodesEnregistrees[userId]) {
        state.methodesEnregistrees[userId] = [];
      }
      // on masque le numero de carte sauf les 4 derniers chiffres
      const carteMasquee = {
        ...methodePaiement,
        id: Date.now(),
        numeroCarte: `**** **** **** ${methodePaiement.numeroCarte.slice(-4)}`
      };
      state.methodesEnregistrees[userId].push(carteMasquee);
    },

    // pour supprimer une methode de paiement
    supprimerMethodePaiement: (state, action) => {
      const { userId, methodePaiementId } = action.payload;
      if (state.methodesEnregistrees[userId]) {
        state.methodesEnregistrees[userId] = state.methodesEnregistrees[userId]
          .filter(m => m.id !== methodePaiementId);
      }
    },

    // pour gerer le chargement
    definirChargement: (state, action) => {
      state.chargement = action.payload;
    },

    // pour gerer les erreurs
    definirErreur: (state, action) => {
      state.erreur = action.payload;
    }
  }
});

// on exporte toutes les actions
export const {
  ajouterMethodePaiement,
  supprimerMethodePaiement,
  definirChargement,
  definirErreur
} = paiementSlice.actions;

// on selectionne les methodes de paiement d'un utilisateur
export const selectionnerMethodesPaiementParUtilisateur = (state, userId) => 
  state.paiement.methodesEnregistrees[userId] || [];

export default paiementSlice.reducer; 