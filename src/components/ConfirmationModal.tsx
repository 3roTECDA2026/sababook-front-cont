// src/components/ConfirmationModal.tsx
import { Modal, Box, Typography, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

const style: SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <Box sx={style}>
        <Typography id="confirmation-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography id="confirmation-modal-description" sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
            Aceptar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}