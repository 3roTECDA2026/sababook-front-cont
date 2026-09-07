// src/components/WelcomeModal.tsx
import { Modal, Box, Typography, Button, Avatar } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { User } from '../types';

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
  textAlign: 'center',
};

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export default function WelcomeModal({ open, onClose, user }: WelcomeModalProps) {
  if (!user) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="welcome-modal-title">
      <Box sx={style}>
        <Avatar
          alt={user.nombre}
          src={user.avatar_url ?? undefined}
          sx={{ width: 80, height: 80, margin: '0 auto 16px' }}
        >
          {user.nombre ? user.nombre[0].toUpperCase() : '?'}
        </Avatar>
        <Typography id="welcome-modal-title" variant="h5" component="h2" fontWeight="bold">
          ¡Bienvenido/a de nuevo!
        </Typography>
        <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>
          {user.nombre}
        </Typography>
        <Typography sx={{ mt: 2, color: 'body.main' }}>Nos alegra verte por aquí.</Typography>
        <Button onClick={onClose} variant="contained" sx={{ mt: 3, backgroundColor: 'button.main' }}>
          Comenzar
        </Button>
      </Box>
    </Modal>
  );
}