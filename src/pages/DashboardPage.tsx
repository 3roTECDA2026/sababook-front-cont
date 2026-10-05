// src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';

const DashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const roleName = localStorage.getItem('roleName')?.trim().toLocaleLowerCase();
  const isAdmin =
    localStorage.getItem('rol') === '3' ||
    roleName === 'administrador' ||
    roleName === 'admin';
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

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