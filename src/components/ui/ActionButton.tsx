// src/components/ui/ActionButton.tsx
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import {
  BUTTON_ORANGE,
  BUTTON_ORANGE_DARK,
  DELETE_ORANGE,
  DELETE_ORANGE_DARK,
  DELETE_TEXT,
} from '@/theme/theme';

// Botón de acción con ícono (naranja de la marca)
export const ActionButton = styled(IconButton)({
  backgroundColor: BUTTON_ORANGE,
  color: '#FFFFFF',
  borderRadius: '8px',
  padding: '6px',
  '&:hover': {
    backgroundColor: BUTTON_ORANGE_DARK,
  },
});

// Variante clara para acciones destructivas (Eliminar)
export const DeleteButton = styled(IconButton)({
  backgroundColor: DELETE_ORANGE,
  color: DELETE_TEXT,
  borderRadius: '8px',
  padding: '6px',
  '&:hover': {
    backgroundColor: DELETE_ORANGE_DARK,
  },
});

export default ActionButton;
