// src/components/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Button, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, useTheme } from '@mui/material/styles';

// --- Estilos personalizados (Styled Components) ---
interface NavButtonProps {
  active?: boolean;
}

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<NavButtonProps>(({ active }) => ({
  backgroundColor: active ? '#FF6600' : 'transparent',
  color: active ? 'white' : 'black',
  '&:hover': {
    backgroundColor: active ? '#E05C00' : 'rgba(0, 0, 0, 0.04)',
  },
  borderRadius: '4px',
  padding: '8px 32px', // theme.spacing(1, 4)
  marginRight: '4px',
  fontSize: '1rem',
  fontWeight: 'bold',
  textTransform: 'none',
}));

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
        <Box sx={{ display: 'flex', mb: 3 }}>
          {/* El botón 'Usuarios' está activo */}
          <NavButton active>Usuarios</NavButton>
          <NavButton>Libros</NavButton>
          <NavButton>Foros</NavButton>
        </Box>

        {/* CONTENIDO PRINCIPAL (Recibido como children) */}
        {children}
      </MainContentBox>
    </Box>
  );
};

export default DashboardLayout;