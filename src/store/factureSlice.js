import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  factures: [],
  chargement: false,
  erreur: null
};

// on utilise cette fonction pour générer un numéro de facture unique qu'on a trouver sur internet
// on genere un numero de facture unique avec l'annee, le mois et un numero sequentiel
// par exemple FAC-2403-0001 correspond a la facture numero 1 generée en 2024 au mois de mars
const genererNumeroFacture = () => {
  const date = new Date();
  const annee = date.getFullYear().toString().slice(-2); // Prend les 2 derniers chiffres de l'année
  const mois = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois sur 2 chiffres
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // Numéro séquentiel sur 4 chiffres
  
  return `FAC-${annee}${mois}-${sequence}`;
};

const factureSlice = createSlice({ // on cree un slice pour les factures
  name: 'facture',
  initialState,
  reducers: {
    ajouterFacture: (state, action) => { // on ajoute une facture
      const nouvelleFacture = {
        ...action.payload,
        id: genererNumeroFacture(), 
        dateCreation: new Date().toISOString()
      };
      state.factures.push(nouvelleFacture);
    },
    definirFactures: (state, action) => { // on definit les factures
      state.factures = action.payload;
    },
    definirChargement: (state, action) => { // on definit le chargement
      state.chargement = action.payload;
    },
    definirErreur: (state, action) => { // on definit les erreurs
      state.erreur = action.payload;
    }
  }
});

export const {  // on exporte toutes les actions
  ajouterFacture,
  definirFactures,
  definirChargement,
  definirErreur
} = factureSlice.actions;

export const selectionnerToutesLesFactures = (state) => state.facture.factures;
export const selectionnerFacturesParUtilisateur = (state, userId) =>  // on selectionne les factures par utilisateur
  state.facture.factures.filter(f => f.userId === userId);

export default factureSlice.reducer; 