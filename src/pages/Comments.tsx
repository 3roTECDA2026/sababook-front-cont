// src/pages/Comments.tsx
import { Box, Button, createTheme, DialogActions, Rating, TextField, Typography } from '@mui/material';
import { useState } from 'react';

// Iconos de MUI
import StarIcon from '@mui/icons-material/Star';

import AppHeader from '../components/AppHeader';
import RatingAndCommentForm from '../components/RatingAndCommentForm';
import type { RatingSubmitData } from '../components/RatingAndCommentForm';
import SideMenu from '../components/SideMenu';

// --- CONFIGURACIÓN DE TEMA ---
const theme = createTheme({
  palette: {
    // Color principal basado en el mockup de Figma (naranja fuerte)
    primary: {
      main: '#f25600',
    },
    // Color secundario para el fondo de la interfaz
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

interface CommentEntry {
  id: number;
  name: string;
  rating: number;
  text: string;
}

// --- DATOS SIMULADOS ---
const INITIAL_COMMENTS: CommentEntry[] = [];

// --- COMPONENTES ---

interface CommentItemMUIProps {
  comment: CommentEntry;
}

// Componente para un comentario individual (estilizado con MUI)
const CommentItemMUI = ({ comment }: CommentItemMUIProps) => (
  <Box
    sx={{
      bgcolor: 'white',
      p: 2,
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
      <Typography variant="subtitle2" fontWeight="bold" color="primary">
        {comment.name}
      </Typography>
      <Rating value={comment.rating} readOnly size="small" />
    </Box>
    <Typography variant="body2" color="text.secondary">
      {comment.text}
    </Typography>
  </Box>
);

interface CommentInputFormMUIProps {
  onCommentSubmit: (data: { rating: number; text: string }) => void;
  onCancel: () => void;
}

// Componente para la entrada de futuros comentarios (Formulario)
const CommentInputFormMUI = ({ onCommentSubmit, onCancel }: CommentInputFormMUIProps) => {
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [commentText, setCommentText] = useState<string>('');

  const handleSubmit = () => {
    if (commentText.trim() && ratingValue > 0) {
      onCommentSubmit({ rating: ratingValue, text: commentText.trim() });
      setRatingValue(0);
      setCommentText('');
    } else {
      console.error('Debes seleccionar un rating y escribir un comentario.');
    }
  };

  return (
    <Box sx={{ bgcolor: '#f0f0f0', p: 2, borderRadius: 2, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', mt: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Deja tu opinión
      </Typography>

      {/* Selector de Rating */}
      <Box mb={2}>
        <Rating
          name="simple-controlled"
          value={ratingValue}
          onChange={(event, newValue) => {
            setRatingValue(newValue ?? 0);
          }}
          icon={<StarIcon fontSize="inherit" color="primary" />}
          emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.55 }} />}
          sx={{ color: theme.palette.primary.main }}
        />
      </Box>

      {/* Área de Texto */}
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        label="Escribe tu comentario aquí..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Botones de Acción */}
      <DialogActions sx={{ p: 0 }}>
        <Button onClick={onCancel} color="inherit" sx={{ color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!commentText.trim() || ratingValue === 0}
        >
          Publicar
        </Button>
      </DialogActions>
    </Box>
  );
};

// --- PÁGINA PRINCIPAL: BookDetailsPage (simula el mockup) ---
function BookDetailsPageMUI() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isCommenting, setIsCommenting] = useState<boolean>(false);
  const [isRating, setIsRating] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentEntry[]>(INITIAL_COMMENTS);

  // Calcular Rating y Conteo Promedio. Se maneja el caso de división por cero.
  const commentsCount = comments.length;
  const totalRating = comments.reduce((sum, c) => sum + c.rating, 0);
  const averageRating = commentsCount > 0 ? totalRating / commentsCount : 0;

  const handleCommentSubmit = (newComment: { rating: number; text: string }) => {
    const submittedComment: CommentEntry = {
      ...newComment,
      id: Date.now(),
      name: 'Usuario Actual',
    };
    setComments([submittedComment, ...comments]); // Agrega el nuevo al inicio
    setIsCommenting(false);
    console.log('Comentario publicado:', submittedComment);
  };

  const handleRatingSubmit = async (ratingData: RatingSubmitData) => {
    // Verificar si el usuario ya ha comentado
    const userHasCommented = comments.some((comment) => comment.name === 'Usuario Actual');

    if (userHasCommented) {
      alert('Ya has enviado una calificación para este libro. Solo puedes enviar una por usuario.');
      setIsRating(false);
      return;
    }

    const submittedRating: CommentEntry = {
      id: Date.now(),
      name: 'Usuario Actual',
      rating: ratingData.rating,
      text: ratingData.text,
    };
    setComments([submittedRating, ...comments]); // Agrega el nuevo al inicio
    setIsRating(false);
    console.log('Calificación enviada:', submittedRating);
  };

  return (
    <Box
      py={2}
      px={1}
      sx={{
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <AppHeader onMenuClick={() => setMenuOpen(true)} title="Comentarios" subtitle="Bienvenida, Lucía" />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Comentarios" />

      {/* ------------------------------------------- */}
      {/* BOTÓN COMENTAR O FORMULARIO */}
      {/* ------------------------------------------- */}
      <Box sx={{ borderTop: '1px solid #eee', pt: 3, maxWidth: 600, margin: '0 auto' }}>
        {!isCommenting && !isRating ? (
          <Box>
            {' '}
            {/* Contenedor para el botón y el texto de puntuación */}
            {/* 1. Botón "Comentar" (tal cual el mockup de Figma) */}
            <Button
              onClick={() => setIsCommenting(true)}
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{
                backgroundColor: '#f25600 !important',
                borderRadius: '25px !important',
                color: 'white !important',
                fontWeight: 'bold !important',
                padding: '12px 24px !important',
                boxShadow: '0 4px 10px rgba(242, 86, 0, 0.4) !important',
                transition: 'transform 0.2s !important',
                '&:hover': {
                  backgroundColor: '#d64500 !important',
                  transform: 'scale(1.02) !important',
                },
                '&:active': {
                  transform: 'scale(0.98) !important',
                },
              }}
            >
              Comentar
            </Button>
            {/* 2. Texto "¿Cómo puntuamos?" a la derecha */}
            <Typography
              variant="caption"
              color="text.secondary"
              onClick={() => setIsRating(true)}
              sx={{
                display: 'block',
                textAlign: 'right',
                mt: 1,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              ¿Cómo puntuamos?
            </Typography>
          </Box>
        ) : isCommenting ? (
          // 2. Componente para futuros comentarios (Formulario)
          <CommentInputFormMUI onCommentSubmit={handleCommentSubmit} onCancel={() => setIsCommenting(false)} />
        ) : (
          // 3. Componente para calificación y comentario
          <RatingAndCommentForm
            onSubmit={handleRatingSubmit}
            onBack={() => setIsRating(false)}
            hasUserCommented={comments.some((comment) => comment.name === 'Usuario Actual')}
          />
        )}
      </Box>

      {/* ------------------------------------------- */}
      {/* LISTA DE COMENTARIOS ACTUALES */}
      {/* ------------------------------------------- */}
      <Typography
        variant="h6"
        fontWeight="bold"
        color="text.primary"
        mt={5}
        mb={2}
        sx={{ maxWidth: 600, margin: '0 auto' }}
      >
        Comentarios ({commentsCount})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, margin: '0 auto' }}>
        {/* Mensaje si no hay comentarios */}
        {commentsCount === 0 && (
          <Typography variant="body1" color="text.secondary" textAlign="center" p={2}>
            Sé el primero en comentar este libro.
          </Typography>
        )}
        {comments.map((item) => (
          <CommentItemMUI key={item.id} comment={item} />
        ))}
      </Box>
    </Box>
  );
}

// Exportar el componente principal
export default function Comments() {
  return <BookDetailsPageMUI />;
}