import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  factures: [],
  chargement: false,
  erreur: null
};

// Fonction pour générer un numéro de facture unique
const genererNumeroFacture = () => {
  const date = new Date();
  const annee = date.getFullYear().toString().slice(-2); // Prend les 2 derniers chiffres de l'année
  const mois = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois sur 2 chiffres
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // Numéro séquentiel sur 4 chiffres
  
  return `FAC-${annee}${mois}-${sequence}`;
};

const factureSlice = createSlice({
  name: 'facture',
  initialState,
  reducers: {
    ajouterFacture: (state, action) => {
      const nouvelleFacture = {
        ...action.payload,
        id: genererNumeroFacture(), // Utilise le nouveau format de numéro de facture
        dateCreation: new Date().toISOString()
      };
      state.factures.push(nouvelleFacture);
    },
    definirFactures: (state, action) => {
      state.factures = action.payload;
    },
    definirChargement: (state, action) => {
      state.chargement = action.payload;
    },
    definirErreur: (state, action) => {
      state.erreur = action.payload;
    }
  }
});

export const {
  ajouterFacture,
  definirFactures,
  definirChargement,
  definirErreur
} = factureSlice.actions;

export const selectionnerToutesLesFactures = (state) => state.facture.factures;
export const selectionnerFacturesParUtilisateur = (state, userId) => 
  state.facture.factures.filter(f => f.userId === userId);

export default factureSlice.reducer; 