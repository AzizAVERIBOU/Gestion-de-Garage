import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  disponibilites: {
    // Structure: { 
    //   mecanicienId: {
    //     "2024-03-20": ["09:00", "09:30", ...],
    //     "2024-03-21": ["10:00", "10:30", ...]
    //   }
    // }
  },
  chargement: false,
  erreur: null
};

const disponibiliteSlice = createSlice({
  name: 'disponibilite',
  initialState,
  reducers: {
    // Initialiser les disponibilités d'un mécanicien pour une date
    definirDisponibilites: (state, action) => {
      const { mecanicienId, date, creneaux } = action.payload;
      if (!state.disponibilites[mecanicienId]) {
        state.disponibilites[mecanicienId] = {};
      }
      state.disponibilites[mecanicienId][date] = creneaux;
    },

    // Générer les créneaux disponibles pour un mécanicien et une date
    genererCreneaux: (state, action) => {
      const { mecanicienId, date } = action.payload;
      const creneaux = [];
      
      // Générer les créneaux de 8h à 18h par tranches de 30min
      for (let heure = 8; heure < 18; heure++) {
        creneaux.push(`${heure.toString().padStart(2, '0')}:00`);
        creneaux.push(`${heure.toString().padStart(2, '0')}:30`);
      }

      if (!state.disponibilites[mecanicienId]) {
        state.disponibilites[mecanicienId] = {};
      }
      state.disponibilites[mecanicienId][date] = creneaux;
    },

    // Réserver un créneau
    reserverCreneau: (state, action) => {
      const { mecanicienId, date, heure } = action.payload;
      if (state.disponibilites[mecanicienId]?.[date]) {
        state.disponibilites[mecanicienId][date] = state.disponibilites[mecanicienId][date]
          .filter(creneau => creneau !== heure);
      }
    },

    // Libérer un créneau (en cas d'annulation)
    libererCreneau: (state, action) => {
      const { mecanicienId, date, heure } = action.payload;
      if (state.disponibilites[mecanicienId]?.[date]) {
        if (!state.disponibilites[mecanicienId][date].includes(heure)) {
          state.disponibilites[mecanicienId][date].push(heure);
          state.disponibilites[mecanicienId][date].sort();
        }
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
  definirDisponibilites,
  genererCreneaux,
  reserverCreneau,
  libererCreneau,
  definirChargement,
  definirErreur
} = disponibiliteSlice.actions;

// Sélecteurs
export const selectionnerDisponibilitesMecanicien = (state, mecanicienId, date) => 
  state.disponibilite.disponibilites[mecanicienId]?.[date] || [];

export const selectionnerToutesLesDisponibilites = (state) => state.disponibilite.disponibilites;
export const selectionnerChargement = (state) => state.disponibilite.chargement;
export const selectionnerErreur = (state) => state.disponibilite.erreur;

// Vérifier si un créneau est disponible
export const estCreneauDisponible = (state, mecanicienId, date, heure) => {
  const disponibilites = state.disponibilite.disponibilites[mecanicienId]?.[date] || [];
  return disponibilites.includes(heure);
};

export default disponibiliteSlice.reducer; 