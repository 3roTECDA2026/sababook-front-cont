// src/components/InsigniaUnica.tsx
import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import StarIcon from '@mui/icons-material/Star'; // Ícono de ejemplo
import type { Medal } from '../types';

// Importar los GIFs
import lapizGif from '../assets/lapiz.gif';
import chatGif from '../assets/chat.gif';
import githubGif from '../assets/github.gif';
import globosGif from '../assets/globos.gif';

interface InsigniaUnicaProps {
  insignia: Medal;
}

const InsigniaUnica = ({ insignia }: InsigniaUnicaProps) => {
  // icono según tipo_accion
  const getIcon = (tipo: string) => {
    switch (tipo) {
      // Comentador --> al menos  libro
      case 'Comentador':
        return <img src={lapizGif} alt="Opinar" style={{ width: 40, height: 40 }} />; // GIF de lápiz para opiniones
      // Opinador --> comento en un foro
      case 'Opinador':
        return <img src={chatGif} alt="Foro" style={{ width: 40, height: 40 }} />; // GIF de chat para foros
      // mas de 10 foros
      case 'Debatiente':
        return <img src={githubGif} alt="Lectura" style={{ width: 40, height: 40 }} />; // GIF de github para lectura
      case 'Comentador Activo':
        return <img src={globosGif} alt="Club" style={{ width: 40, height: 40 }} />; // GIF de globos para clubes
      default:
        return <StarIcon />;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f7f7f7ff',
        padding: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        width: { xs: 120, sm: 150 },
        height: { xs: 120, sm: 150 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
      }}
    >
      {/* Ícono de la Insignia */}
      <Avatar
        sx={{
          bgcolor: 'transparent',
          color: 'text.primary',
          width: 40,
          height: 40,
          fontSize: '1.5rem',
          mb: 1,
        }}
      >
        {getIcon(insignia.nombre)}
      </Avatar>
      {/* Nombre de la Insignia */}
      <Typography variant="body2" fontWeight="medium" textAlign="center" sx={{ mb: 0.5 }}>
        {insignia.nombre}
      </Typography>
      {/* Descripción de la Insignia */}
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {insignia.descripcion}
      </Typography>
    </Box>
  );
};

export default InsigniaUnica;