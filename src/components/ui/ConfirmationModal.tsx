// src/components/ConfirmationModal.tsx
import { Modal, Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { AppButton } from '@/components/atoms/AppButton';

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
  loading?: boolean;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
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
          <AppButton onClick={onClose} variant="outlined" disabled={loading}>
            Cancelar
          </AppButton>
          <AppButton
            onClick={onConfirm}
            variant="destructive"
            loading={loading}
            autoFocus
          >
            Aceptar
          </AppButton>
        </Box>
      </Box>
    </Modal>
  );
}