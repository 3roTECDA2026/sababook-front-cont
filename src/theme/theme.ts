// src/theme/theme.ts
import { createTheme, type Components } from '@mui/material/styles';

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

// Color único de todos los botones (naranja de la marca)
export const BUTTON_ORANGE = '#f25600';
export const BUTTON_ORANGE_DARK = '#cc4800';

// Naranja más claro para acciones destructivas (Eliminar), así se distinguen
export const DELETE_ORANGE = '#ffb877';
export const DELETE_ORANGE_DARK = '#ff9e4d';
export const DELETE_TEXT = '#4b2c15';

// Estilo único: todos los botones son "contained" naranja,
// sin importar variante ni color declarados en cada componente.
const unifiedButton = {
  backgroundColor: BUTTON_ORANGE,
  color: '#FFFFFF',
  border: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: BUTTON_ORANGE_DARK,
    color: '#FFFFFF',
    boxShadow: 'none',
  },
  '&:active': {
    backgroundColor: BUTTON_ORANGE_DARK,
    color: '#FFFFFF',
  },
  '&:focus': {
    color: '#FFFFFF',
  },
  '&.Mui-focusVisible': {
    backgroundColor: BUTTON_ORANGE_DARK,
    color: '#FFFFFF',
  },
  '&.Mui-disabled': {
    backgroundColor: BUTTON_ORANGE,
    color: '#FFFFFF',
    opacity: 0.5,
  },
};

// Variante clara para botones destructivos (eliminar)
const destructiveButton = {
  backgroundColor: DELETE_ORANGE,
  color: DELETE_TEXT,
  border: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: DELETE_ORANGE_DARK,
    color: DELETE_TEXT,
    boxShadow: 'none',
  },
  '&:active': {
    backgroundColor: DELETE_ORANGE_DARK,
    color: DELETE_TEXT,
  },
  '&:focus': {
    color: DELETE_TEXT,
  },
  '&.Mui-focusVisible': {
    backgroundColor: DELETE_ORANGE_DARK,
    color: DELETE_TEXT,
  },
  '&.Mui-disabled': {
    backgroundColor: DELETE_ORANGE,
    color: DELETE_TEXT,
    opacity: 0.5,
  },
};

const unifiedButtonOverrides: Record<string, typeof unifiedButton | typeof destructiveButton> = {
  root: unifiedButton,
};

(['text', 'outlined', 'contained'] as const).forEach((variant) => {
  unifiedButtonOverrides[variant] = unifiedButton;
  (
    ['Primary', 'Secondary', 'Error', 'Success', 'Info', 'Warning', 'Inherit'] as const
  ).forEach((color) => {
    unifiedButtonOverrides[`${variant}${color}`] = unifiedButton;
  });
});

// Los botones con color="error" (eliminar) usan el naranja claro
unifiedButtonOverrides.textError = destructiveButton;
unifiedButtonOverrides.outlinedError = destructiveButton;
unifiedButtonOverrides.containedError = destructiveButton;

const theme = createTheme({
  palette: {
    primary: {
      main: '#653A1B',
    },
    secondary: {
      main: '#36332D', // etiqeutas
    },
    button: {
      main: BUTTON_ORANGE,
    },
    body: {
      main: '#4A4C52',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        disableElevation: true,
      },
      styleOverrides: unifiedButtonOverrides as NonNullable<
        Components['MuiButton']
      >['styleOverrides'],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: BUTTON_ORANGE,
          '&:hover': {
            backgroundColor: 'rgba(242, 86, 0, 0.08)',
          },
        },
        colorPrimary: { color: BUTTON_ORANGE },
        colorSecondary: { color: BUTTON_ORANGE },
        colorError: { color: DELETE_ORANGE },
        colorSuccess: { color: BUTTON_ORANGE },
        colorInfo: { color: BUTTON_ORANGE },
        colorWarning: { color: BUTTON_ORANGE },
      },
    },
  },
});

export default theme;
