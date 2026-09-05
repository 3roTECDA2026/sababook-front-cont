// src/pages/MyForums.tsx
import { Avatar, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useForums } from '../hooks/useForum';
import theme from '../theme/theme';
import { useNavigate } from 'react-router-dom';

import ForumIcon from '@mui/icons-material/Forum';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import AppHeader from '../components/AppHeader';
import SideMenu from '../components/SideMenu';
import type { Forum } from '../types';

interface ForoItemProps {
  foro: Forum;
}

export default function MyForum() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  // Usar el hook useForums
  const { forums: foros, loading, error } = useForums();

  // 🔹 Funciones de acciones
  const handleViewForo = (id: number) => {
    navigate(`/foro/detalle/${id}`);
  };

  // 🔹 Componente para cada foro
  const ForoItem = ({ foro }: ForoItemProps) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: 2,
        borderBottom: '1px solid #eee',
      }}
    >
      <Box display="flex" alignItems="center" flexGrow={1}>
        <Avatar
          variant="rounded"
          sx={{
            width: 45,
            height: 45,
            mr: 2,
            border: '1px solid #ddd',
            bgcolor: theme.palette.button?.main,
          }}
        >
          <ForumIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {foro.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {foro.descripcion}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" gap={1}>
        <IconButton
          onClick={() => handleViewForo(foro.foro_id)}
          sx={{ bgcolor: theme.palette.button?.main, color: '#fff', '&:hover': { bgcolor: '#cc4800' } }}
        >
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title="Foros"
        subtitle="Tu espacio para debatir, compartir y aprender."
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Foro" />

      <Typography variant="h5" fontWeight="bold" color="text.primary" mt={3} mb={2}>
        Foros
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && foros.length === 0 && <Typography>No hay foros disponibles</Typography>}

      <Box sx={{ bgcolor: '#ffffff', borderRadius: 2, boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
        {foros.map((foro) => (
          <ForoItem key={foro.foro_id} foro={foro} />
        ))}
      </Box>
    </Box>
  );
}