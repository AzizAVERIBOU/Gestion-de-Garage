import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk pour récupérer les marques
export const fetchMarques = createAsyncThunk(
  'vehicule/fetchMarques',
  async (searchTerm) => {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json`);
    const data = await response.json();
    if (data.Results) {
      return data.Results
        .filter(make => make.Make_Name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 8)
        .map(item => item.Make_Name);
    }
    return [];
  }
);

// Thunk pour récupérer les modèles
export const fetchModeles = createAsyncThunk(
  'vehicule/fetchModeles',
  async (marque) => {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(marque)}?format=json`);
    const data = await response.json();
    if (data.Results) {
      return data.Results.map(item => item.Model_Name);
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
      .addCase(fetchMarques.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMarques.fulfilled, (state, action) => {
        state.marques = action.payload;
        state.loading = false;
      })
      .addCase(fetchMarques.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchModeles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModeles.fulfilled, (state, action) => {
        state.modeles = action.payload;
        state.loading = false;
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

export const selectionnerVehiculeSelectionne = (state) => state.vehicule.vehiculeSelectionne;
export const selectionnerChargementVehicule = (state) => state.vehicule.chargement;
export const selectionnerErreurVehicule = (state) => state.vehicule.erreur;

export default vehiculeSlice.reducer; 