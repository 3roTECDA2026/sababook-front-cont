// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// Extendemos los tipos de MUI para incluir los colores custom del proyecto
declare module '@mui/material/styles' {
  interface Palette {
    button: Palette['primary'];
    body: Palette['primary'];
  }
  interface PaletteOptions {
    button?: PaletteOptions['primary'];
    body?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#653A1B',
    },
    secondary: {
      main: '#36332D', // etiqeutas
    },
    button: {
      main: '#f25600',
    },
    body: {
      main: '#4A4C52',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;