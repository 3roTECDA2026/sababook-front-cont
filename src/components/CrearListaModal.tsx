// src/components/CrearListaModal.tsx
// Este componente llegó incompleto desde la rama develop (solo tenía imports, sin cuerpo).
// Se dejó este stub temporal para no bloquear el merge. Falta la implementación real.
import { Modal, Box, Typography } from '@mui/material';

interface CrearListaModalProps {
  open: boolean;
  onClose: () => void;
  onListaCreada?: () => void;
}

export const CrearListaModal = ({ open, onClose }: CrearListaModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography>Funcionalidad en construcción.</Typography>
      </Box>
    </Modal>
  );
};