// src/components/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, useTheme } from '@mui/material/styles';
import { AppButton } from '@/components/atoms/AppButton';

// Estilo para el contenedor con borde redondeado y sombra
const MainContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(3),
  margin: theme.spacing(4),
}));

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ backgroundColor: '#F0F0F0', minHeight: '100vh', padding: theme.spacing(2) }}>
      {/* HEADER SUPERIOR */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ p: 1 }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Mockup del logo/perfil */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* El avatar de la imagen */}
            <Box
              component="img"
              src="/ruta-a-la-imagen-del-avatar.png"
              alt="Avatar"
              sx={{ width: 50, height: 50, borderRadius: '50%', mr: 1, objectFit: 'cover' }}
            />
            {/* Aquí iría el título si se necesitara, pero lo omitimos para ser fiel a la imagen */}
          </Box>
          {/* Botón de menú a la derecha */}
          <IconButton edge="end" aria-label="menu" sx={{ color: 'black' }}>
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <MainContentBox>
        {/* BOTONES DE NAVEGACIÓN PRINCIPAL */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {/* El botón 'Usuarios' está activo */}
          <AppButton variant="primary">Usuarios</AppButton>
          <AppButton variant="text" sx={{ color: 'black' }}>Libros</AppButton>
          <AppButton variant="text" sx={{ color: 'black' }}>Foros</AppButton>
        </Box>

        {/* CONTENIDO PRINCIPAL (Recibido como children) */}
        {children}
      </MainContentBox>
    </Box>
  );
};

export default DashboardLayout;