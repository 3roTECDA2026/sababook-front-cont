// src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import AppHeader from '../components/AppHeader';
import SideMenu from '../components/SideMenu';

const DashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: 1200, // Un ancho máximo para que no se estire demasiado en pantallas grandes
        margin: '0 auto',
        padding: { xs: 1, sm: 2, md: 3 }, // Padding responsivo
      }}
    >
      <AppHeader onMenuClick={() => setMenuOpen(true)} title="Dashboard" subtitle="Panel de Administración" />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Dashboard" />
      <Outlet />
      <Dashboard />
    </Box>
  );
};

export default DashboardPage;