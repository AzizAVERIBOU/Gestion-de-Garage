import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk pour récupérer et mettre en cache les marques
export const fetchMarques = createAsyncThunk(
  'vehicule/fetchMarques',
  async (searchTerm) => {
    // Vérifier si on a déjà ces résultats en cache
    const cachedResults = localStorage.getItem(`marques_${searchTerm}`);
    if (cachedResults) {
      return JSON.parse(cachedResults);
    }

    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json`);
    const data = await response.json();
    
    if (data.Results) {
      const filteredResults = data.Results
        .filter(make => make.Make_Name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 8)
        .map(item => item.Make_Name);
      
      // Mettre en cache les résultats
      localStorage.setItem(`marques_${searchTerm}`, JSON.stringify(filteredResults));
      return filteredResults;
    }
    return [];
  }
);

// Thunk pour récupérer et mettre en cache les modèles
export const fetchModeles = createAsyncThunk(
  'vehicule/fetchModeles',
  async (marque) => {
    // Vérifier si on a déjà ces résultats en cache
    // on va verifier si on a deja des resultats en cache pour la marque selectionnée
    //pour ne pas faire des requetes inutiles a l'api et aumenter la rapidite de l'autocompletion
    const cachedResults = localStorage.getItem(`modeles_${marque}`);
    if (cachedResults) {
      return JSON.parse(cachedResults);
    }

    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(marque)}?format=json`);
    const data = await response.json();
    
    if (data.Results) {
      const modeles = data.Results.map(item => item.Model_Name);
      // Mettre en cache les résultats
      localStorage.setItem(`modeles_${marque}`, JSON.stringify(modeles));
      return modeles;
    }
    return [];
  }
);

const initialState = {
  vehicules: [],
  vehiculeSelectionne: null,
  chargement: false,
  erreur: null,
  marques: [],
  modeles: []
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
  },
  extraReducers: (builder) => {
    builder
      // Gestion des états pour fetchMarques
      .addCase(fetchMarques.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarques.fulfilled, (state, action) => {
        state.loading = false;
        state.marques = action.payload;
      })
      .addCase(fetchMarques.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Gestion des états pour fetchModeles
      .addCase(fetchModeles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModeles.fulfilled, (state, action) => {
        state.loading = false;
        state.modeles = action.payload;
      })
      .addCase(fetchModeles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
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
// pour selectionner le vehicule selectionne  
export const selectionnerVehiculeSelectionne = (state) => state.vehicule.vehiculeSelectionne;
// pour selectionner le chargement
export const selectionnerChargementVehicule = (state) => state.vehicule.chargement;
// pour selectionner l'erreur
export const selectionnerErreurVehicule = (state) => state.vehicule.erreur;

export default vehiculeSlice.reducer; 