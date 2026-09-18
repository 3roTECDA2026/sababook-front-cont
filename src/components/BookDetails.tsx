// src/components/BookDetails.tsx
import React from 'react';
import { Box, Typography, Rating, Divider, Chip, Paper, useTheme } from '@mui/material';

import AppHeader from './AppHeader';
import NavButton from './NavButton';

interface MockBookData {
  title: string;
  author: string;
  rating: number;
  status: string;
  coverImage: string;
  description: string;
}

const MOCK_BOOK_DATA: MockBookData = {
  title: 'La Campana de Cristal',
  author: 'Sylvia Plath',
  rating: 3.9,
  status: '78%',

  coverImage: 'https://via.placeholder.com/100x150/D32F2F/FFFFFF?text=PORTADA',
  description:
    'La campana de cristal es una novela de carácter semiautobiográfico. A través de la joven Esther Greenwood, la experiencia de una joven brillante que enfrenta una profunda crisis existencial y emocional.',
};

const BookDetails = () => {
  const theme = useTheme();
  const book = MOCK_BOOK_DATA;

  const handleCommentClick = () => console.log('Navegar a comentarios');
  const handleMenuToggle = () => console.log('Abrir SideMenu');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[50],
        p: { xs: 2, md: 4 },
        maxWidth: '450px',
        margin: '0 auto',
      }}
    >
      <AppHeader onMenuClick={handleMenuToggle} title="LIBRO - VER MÁS" subtitle="¡Bienvenida, Lucía!" />

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', mb: 4 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box
            component="img"
            src={book.coverImage}
            alt={`Cubierta de ${book.title}`}
            sx={{
              width: '100px',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '2px solid #D32F2F',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
          />

          <Box flexGrow={1} textAlign="left">
            <Typography variant="body1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
              {book.author}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={1}>
              {book.title}
            </Typography>
            <Chip
              label={`${book.status}`}
              color="default"
              size="small"
              sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[200] }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 2. SECCIÓN DE CALIFICACIÓN Y BOTÓN COMENTAR */}
        <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
          {/* Calificación */}
          <Box textAlign="left">
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: theme.palette.body?.main }}>
              {book.rating.toFixed(1)} Calificación Promedio
            </Typography>
            <Rating value={book.rating} precision={0.1} readOnly size="small" />
            <Typography variant="caption" color="text.secondary" display="block">
              ¿Cómo puntuamos?
            </Typography>
          </Box>

          <NavButton
            onClick={handleCommentClick}
            sx={{ width: '150px', height: '40px', padding: '8px 16px' }}
          >
            Comentar
          </NavButton>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box textAlign="left" mt={2}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Descripción
          </Typography>
          <Typography variant="body2" paragraph>
            {book.description}...
          </Typography>

          <Paper variant="outlined" sx={{ p: 1.5, my: 2, borderRadius: '10px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight="bold">
                Pablo
              </Typography>
              <Rating value={5} readOnly size="small" />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Docente
            </Typography>
            <Typography variant="body2" mt={1}>
              "Un libro sensible, para pensar..."
            </Typography>
          </Paper>

          <NavButton
            onClick={() => console.log('Ver todos los comentarios')}
            sx={{
              width: '100%',
              mt: 3,
              bgcolor: theme.palette.grey[100] + ' !important',
              '&:hover': { bgcolor: theme.palette.grey[200] + ' !important' },
              color: theme.palette.body?.main + ' !important',
            }}
          >
            Ver todos los comentarios
          </NavButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default BookDetails;