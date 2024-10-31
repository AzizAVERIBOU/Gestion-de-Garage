import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Créer un thème personnalisé

export const initializeTheme = createAsyncThunk(
  'theme/initialize',
  async () => {
    // Simuler une requête asynchrone pour charger les styles
    const theme = {
      colors: {
        primary: '#1a237e',
        secondary: '#455a64',
        success: '#1b5e20',
        
      },
      styles: `
        body {
          background-color: #f0f2f5;
          min-height: 100vh;
        }
        // ... autres styles
      `
    };
    
    
    const style = document.createElement('style');
    style.textContent = theme.styles;
    document.head.appendChild(style);
    
    return theme;
  }
);


const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    colors: {},
    loading: false,
    error: null
  },
  reducers: {
    
  },
  extraReducers: (builder) => {  // Redéfinir les états de chargement et d'erreur
    builder
      .addCase(initializeTheme.pending, (state) => {  // Gestion du chargement
        state.loading = true;
      })
      .addCase(initializeTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.colors = action.payload.colors;
      })
      .addCase(initializeTheme.rejected, (state, action) => {  // Gestion de l'erreur
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default themeSlice.reducer; 