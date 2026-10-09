// src/components/HeaderDashboard.tsx
import React from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import NavButton from '@/components/ui/NavButton';
import ReadingStreak from './ReadingStreak';

export type DashboardView = 'users' | 'books' | 'forums' | 'goals' | 'forumCommentsAdmin' | 'moderation';

const titleMap: Partial<Record<DashboardView, string>> = {
  users: 'Usuarios',
  books: 'Libros',
  forums: 'Foros',
  goals: 'Metas de Lectura',
  moderation: 'Moderación IA',
};

// 1. Estilo para el botón de "Agregar"
const StyledAddButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  // ... (restos de estilos)
  color: '#FFFFFF',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 20px',
  textTransform: 'none',
}));

// Función auxiliar para el texto del botón
const getAddButtonText = (activeView: DashboardView): string => {
  switch (activeView) {
    case 'users':
      return 'Agregar Usuario';
    case 'books':
      return 'Agregar Libro';
    case 'forums':
      return 'Agregar Foro';
    default:
      return 'Agregar';
  }
};

interface HeaderDashboardProps {
  activeView?: DashboardView;
  onNavigate?: (view: DashboardView) => void;
  onAddClick?: () => void;
  onRecommendClick?: () => void;
  isLoading?: boolean;
  rachaActual?: number;
  recordRacha?: number;
  mostrarRacha?: boolean;
}


// 🛑 AÑADIMOS VALORES POR DEFECTO PARA QUE NO FALLE SI SE LLAMA SIN PROPS 🛑
const HeaderDashboard = ({
  activeView = 'users', // Valor por defecto
  onNavigate = () => console.log('Navegación Desactivada'), // Función vacía
  onAddClick = () => console.log('Agregar Desactivado'),
  onRecommendClick = () => {}, // Función vacía
  rachaActual = 3,
  recordRacha = 7,
  mostrarRacha = true,
}: HeaderDashboardProps) => {
  const currentTitle = titleMap[activeView] || 'Título Desconocido';
  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', mb: 4 }}>
      {/* 1. BARRA DE NAVEGACIÓN (Llamada a NavButton) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 4 }}>
        <NavButton onClick={() => onNavigate('users')} isActive={activeView === 'users'}>
          Usuarios
        </NavButton>
        <NavButton onClick={() => onNavigate('books')} isActive={activeView === 'books'}>
          Libros
        </NavButton>
        <NavButton onClick={() => onNavigate('forums')} isActive={activeView === 'forums'}>
          Foros
        </NavButton>
        <NavButton onClick={() => onNavigate('moderation')} isActive={activeView === 'moderation'}>
          Moderación IA
        </NavButton>
      </Box>

      {/* 2. BARRA DE ACCIONES (SearchBar y Botón Agregar) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        {/* <SearchBar />  */}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          {/* Título de la tabla actual */}
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#555555', mb: 2 }}>
            {currentTitle}
          </Typography>
          {activeView !== 'moderation' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <StyledAddButton onClick={onAddClick}>
                {getAddButtonText(activeView)}
              </StyledAddButton>
              {activeView === 'books' && (
                <StyledAddButton onClick={onRecommendClick}>
                  Recomendar Libro
                </StyledAddButton>
              )}
            </Box>
          )}
        </Box>
        
        {mostrarRacha && (
          <ReadingStreak rachaActual={rachaActual} recordRacha={recordRacha} />
        )}
      </Box>
    </Box>
  );
};

export default HeaderDashboard;