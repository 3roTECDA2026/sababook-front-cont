// src/components/BookCommentBox.tsx
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Alert, AlertColor, Box, Typography, Rating, Snackbar } from '@mui/material';
import type { Theme } from '@mui/material';
import NavButton from './ui/NavButton';
import { API_BASE_URL } from '@/environments/api';
import type { User, Opinion } from '@/types';

const ORANGE_COLOR = '#FF6633';

/** Mínimo que acepta el backend (SAB-039: opinion-content.service.ts). */
const MIN_COMENTARIO = 10;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface BookCommentBoxProps {
  theme: Theme;
  id: number | string | undefined;
  user: User;
  newRating: number;
  newComment: string;
  setNewRating: Dispatch<SetStateAction<number>>;
  setNewComment: Dispatch<SetStateAction<string>>;
  setShowCommentBox: Dispatch<SetStateAction<boolean>>;
  setOpinions: Dispatch<SetStateAction<Opinion[]>>;
}

const BookCommentBox = ({
  theme,
  id,
  user,
  newRating,
  newComment,
  setNewRating,
  setNewComment,
  setShowCommentBox,
  setOpinions,
}: BookCommentBoxProps) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'warning',
  });

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || newRating === 0) {
      setSnackbar({
        open: true,
        message: 'Por favor, escribe un comentario y selecciona una calificación.',
        severity: 'warning',
      });
      return;
    }

    if (newComment.trim().length < MIN_COMENTARIO) {
      setSnackbar({
        open: true,
        message: `Contá un poco más: la reseña necesita al menos ${MIN_COMENTARIO} caracteres.`,
        severity: 'warning',
      });
      return;
    }

    const payload = {
      libro_id: Number(id),
      usuario_id: user.usuario_id,
      calificacion: newRating,
      comentario: newComment,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado.');

      const res = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // El backend responde con el motivo del rechazo (SAB-039 y moderación).
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || body?.mensaje || 'No se pudo guardar el comentario.');
      }

      const savedOpinion = await res.json();

      // Aquí usamos el nombre real que devuelve la API
      const newOpinion: Opinion = {
        id: savedOpinion.opinion_id || Date.now(),
        comentario: savedOpinion.comentario || newComment,
        calificacion: savedOpinion.calificacion || newRating,
        usuario: {
          nombre: savedOpinion.usuario_nombre || 'Usuario',
          rol: 'Lector',
        },
        destacado: savedOpinion.destacado || false,
        fecha: savedOpinion.fecha || new Date().toISOString(),
      };

      setOpinions((prev) => [newOpinion, ...prev]);
      setNewComment('');
      setNewRating(0);
      setShowCommentBox(false);
      setSnackbar({ open: true, message: 'Tu reseña se publicó correctamente.', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'No se pudo guardar el comentario.',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: '12px',
        bgcolor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
        Escribe tu opinión
      </Typography>
      <Rating value={newRating} onChange={(e, newValue) => setNewRating(newValue ?? 0)} sx={{ mb: 1 }} />
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Escribe tu comentario..."
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          borderRadius: '8px',
          border: `1px solid ${theme.palette.grey[300]}`,
          resize: 'none',
        }}
      />
      <NavButton
        onClick={handleSubmit}
        sx={{
          mt: 2,
          width: '100%',
          bgcolor: ORANGE_COLOR + ' !important',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '8px !important',
          '&:hover': { bgcolor: '#cc4800 !important' },
        }}
      >
        Publicar comentario
      </NavButton>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookCommentBox;