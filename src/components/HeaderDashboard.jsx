import React from 'react';
import { Box, Button, styled, Typography } from '@mui/material';

import NavButton from './NavButton'; 
import SearchBar from './SearchBar'; 

const titleMap = {
  users: 'Usuarios',
  books: 'Libros',
  forums: 'Foros',
  goals: 'Metas de Lectura',
};

// 1. Estilo para el botón de "Agregar"
const StyledAddButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  color: '#FFFFFF',
  fontWeight: 'bold',
  borderRadius: '8px', 
  padding: '10px 20px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#d44b00',
  }
}));

// Función auxiliar para el texto del botón
const getAddButtonText = (activeView) => {
  switch (activeView) {
    case 'users': return 'Agregar Usuario';
    case 'books': return 'Agregar Libro';
    case 'forums': return 'Agregar Foro';
    default: return 'Agregar';
  }
}

const HeaderDashboard = ({ 
  activeView = 'users',
  onNavigate = () => console.log('Navegación Desactivada'),
  onAddClick = () => console.log('Agregar Desactivado'),
}) => {
  const currentTitle = titleMap[activeView] || 'Título Desconocido';
  
  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', mb: 4 }}>
      
      {/* 1. BARRA DE NAVEGACIÓN */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 4 }}>
        <NavButton onClick={() => onNavigate('users')} isActive={activeView === 'users'}>Usuarios</NavButton>
        <NavButton onClick={() => onNavigate('books')} isActive={activeView === 'books'}>Libros</NavButton>
        <NavButton onClick={() => onNavigate('forums')} isActive={activeView === 'forums'}>Foros</NavButton>
        <NavButton onClick={() => onNavigate('goals')} isActive={activeView === 'goals'}>Metas</NavButton>
      </Box>

      {/* 2. BARRA DE ACCIONES */}
      <Box sx={{ 
        display: 'flex', 
        justify: 'space-between',
        alignItems: 'center', 
        marginBottom: 2, 
      }}>
        {/* <SearchBar /> */}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Título de la tabla actual */}
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#555555', mb: 2 }}>
          {currentTitle}
        </Typography>

        {/* Muestra el botón 'Agregar' solo para usuarios, libros y foros */}
        {activeView !== 'goals' && (
          <StyledAddButton onClick={onAddClick}>
            {getAddButtonText(activeView)}
          </StyledAddButton>
        )}
      </Box>
    </Box>
  );
};

export default HeaderDashboard;