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
import libroPlumaGif from '../assets/libro-pluma.gif';
import chatEstrellaGif from '../assets/chat-estrella.gif';

interface InsigniaUnicaProps {
  insignia: Medal;
}

const InsigniaUnica = ({ insignia }: InsigniaUnicaProps) => {
    // ícono según el nombre de la insignia
  const getIcon = (nombre: string) => {
    switch (nombre) {
      case 'Comentador':
        return <img src={lapizGif} alt="Comentador" style={{ width: 40, height: 40 }} />;
      case 'Comentador Activo':
        return <img src={globosGif} alt="Comentador Activo" style={{ width: 40, height: 40 }} />;
      case 'Super Comentador':
        return <img src={chatEstrellaGif} alt="Super Comentador" style={{ width: 40, height: 40 }} />;
      case 'Opinador':
        return <img src={chatGif} alt="Opinador" style={{ width: 40, height: 40 }} />;
      case 'Debatiente':
        return <img src={githubGif} alt="Debatiente" style={{ width: 40, height: 40 }} />;
      case 'Master de la lectura':
        return <img src={libroPlumaGif} alt="Master de la lectura" style={{ width: 40, height: 40 }} />;
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
        opacity: insignia.obtenida ? 1 : 0.45,
        filter: insignia.obtenida ? 'none' : 'grayscale(100%)',
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