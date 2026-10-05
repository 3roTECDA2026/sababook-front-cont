// src/components/BookCommentBox.tsx
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Box, Typography, Rating, CircularProgress } from '@mui/material';
import type { Theme } from '@mui/material';
import NavButton from './ui/NavButton';
import { API_BASE_URL } from '@/environments/api';
import type { User, Opinion } from '@/types';

const ORANGE_COLOR = '#FF6633';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!newComment.trim() || newRating === 0) {
      alert('Por favor, escribe un comentario y selecciona una calificación.');
      return;
    }

    const payload = {
      libro_id: Number(id),
      usuario_id: user.usuario_id,
      calificacion: newRating,
      comentario: newComment,
    };

    setIsSubmitting(true);
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

      const data = await res.json().catch(() => null);

      if (res.status === 202 || data?.error === 'EN_REVISION') {
        alert(data?.mensaje || 'Tu reseña quedó en revisión por un responsable antes de publicarse.');
        setNewComment('');
        setNewRating(0);
        setShowCommentBox(false);
        return;
      }

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.mensaje || data?.error || 'Error al guardar el comentario.');
      }

      const savedOpinion = data;

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
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'No se pudo guardar el comentario.';
      alert(message);
    } finally {
      setIsSubmitting(false);
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
        disabled={isSubmitting}
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
        disabled={isSubmitting || !newComment.trim() || newRating === 0}
        sx={{
          mt: 2,
          width: '100%',
          bgcolor: isSubmitting ? theme.palette.grey[400] : ORANGE_COLOR + ' !important',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '8px !important',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          '&:hover': { bgcolor: isSubmitting ? theme.palette.grey[400] : '#cc4800 !important' },
          '&:disabled': {
            bgcolor: theme.palette.grey[400] + ' !important',
            color: 'white !important',
            cursor: 'not-allowed',
          },
        }}
      >
        {isSubmitting ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress size={18} color="inherit" />
            <span>Analizando y publicando...</span>
          </Box>
        ) : (
          'Publicar comentario'
        )}
      </NavButton>
    </Box>
  );
};

export default BookCommentBox;