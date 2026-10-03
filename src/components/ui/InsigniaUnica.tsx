// src/components/ui/InsigniaUnica.tsx
import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import type { Medal } from '@/types';

import lapizGif from '@/assets/lapiz.gif';
import chatGif from '@/assets/chat.gif';
import githubGif from '@/assets/github.gif';
import globosGif from '@/assets/globos.gif';
import libroPlumaGif from '@/assets/libro-pluma.gif';
import chatEstrellaGif from '@/assets/chat-estrella.gif';

interface InsigniaUnicaProps {
  insignia: Medal;
}

const InsigniaUnica = ({ insignia }: InsigniaUnicaProps) => {
  const getIcon = (name?: string) => {
    switch (name) {
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

  const isUnlocked = insignia.isUnlocked || (insignia as any).obtenida;

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
        opacity: isUnlocked ? 1 : 0.45,
        filter: isUnlocked ? 'none' : 'grayscale(100%)',
      }}
    >
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
        {getIcon(insignia.name || (insignia as any).nombre)}
      </Avatar>
      <Typography variant="body2" fontWeight="medium" textAlign="center" sx={{ mb: 0.5 }}>
        {insignia.name || (insignia as any).nombre}
      </Typography>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {insignia.description || (insignia as any).descripcion}
      </Typography>
    </Box>
  );
};

export default InsigniaUnica;