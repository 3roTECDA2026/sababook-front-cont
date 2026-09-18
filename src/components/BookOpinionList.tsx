// src/components/BookOpinionList.tsx
import { Box, Typography, Rating } from '@mui/material';
import type { Theme } from '@mui/material';
import type { Opinion } from '../types';

const ORANGE_COLOR = '#FF6633';

interface BookOpinionListProps {
  opinions?: Opinion[];
  theme?: Theme;
}

const BookOpinionList = ({ opinions, theme }: BookOpinionListProps) => {
  return (
    <Box textAlign="left" mt={2}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Opiniones
      </Typography>

      {Array.isArray(opinions) && opinions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Aún no hay opiniones.
        </Typography>
      )}

      {opinions?.map((opinion) => (
        <Box
          key={opinion?.id ?? Math.random()}
          sx={{
            p: 1.5,
            my: 2,
            borderRadius: '12px',
            bgcolor: theme?.palette?.common?.white,
            border: `1px solid ${theme?.palette?.grey?.[300]}`,
          }}
        >
          {/* Autor y rating */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {opinion?.usuario?.nombre || 'Usuario'} {/* Aquí se muestra el autor */}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {opinion?.usuario?.rol || ''}
              </Typography>
            </Box>
            <Rating value={opinion?.calificacion || 0} readOnly size="small" />
          </Box>

          {/* Comentario */}
          <Typography
            variant="body2"
            mt={1}
            sx={{ fontStyle: 'italic', color: theme?.palette?.text?.primary }}
          >
            {opinion?.comentario || ''}
          </Typography>

          {/* Comentario destacado */}
          {opinion?.destacado && (
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  color: ORANGE_COLOR,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                }}
              >
                Comentario destacado
              </Typography>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default BookOpinionList;