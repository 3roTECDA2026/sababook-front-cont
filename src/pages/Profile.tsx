// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, styled, Avatar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import SideMenu from '../components/SideMenu';
import UserProfileForm from '../components/UserProfileForm';
import { useAuth } from '../hooks/useAuth';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
  color: '#FFFFFF',
  padding: '12px 0',
  fontSize: '1rem',
  fontWeight: 'bold',
  borderRadius: '30px',
}));

type ViewState = 'menu' | 'form';

interface UserData {
  userName: string;
  userEmail: string;
  avatarUrl: string;
}

interface ProfileSaveData {
  nombre?: string;
  email?: string;
  avatar_url?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewState>('menu');

  const [userData, setUserData] = useState<UserData>({
    userName: '',
    userEmail: '',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
  });

  // Sincronizar userData con el usuario del contexto
  useEffect(() => {
    if (user) {
      setUserData({
        userName: user.nombre || '',
        userEmail: user.email || '',
        avatarUrl: user.avatar_url || 'https://i.pravatar.cc/150?img=1',
      });
    }
  }, [user]);

  const { userName, userEmail, avatarUrl } = userData;

  const handleChangeAvatar = (newUrl: string) => {
    setUserData((prevData) => ({
      ...prevData,
      avatarUrl: newUrl,
    }));
  };

  // Funciones para cambiar de vista
  const handleModifyProfileClick = () => setCurrentView('form');
  const handleCancel = () => setCurrentView('menu');
  const handleSave = async (updatedData: { nombre: string; email: string; avatar_url: string }) => {
    // Enviar userData actualizado a la API
    const result = await updateUser(updatedData as ProfileSaveData);

    if (result.success) {
      console.log('Datos guardados exitosamente');
      handleCancel();
    } else {
      console.error('Error al guardar:', result.error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleMyCommentsClick = () => {
    navigate('/mis-comentarios');
  };

  // -----------------------------------------------------
  // FUNCIÓN DE RENDERIZADO CONDICIONAL
  // -----------------------------------------------------

  const renderContent = () => {
    if (currentView === 'form') {
      // Muestra el formulario de edición
      return (
        <UserProfileForm
          userName={userName}
          userEmail={userEmail}
          onCancel={handleCancel}
          onSave={handleSave}
          onAvatarChange={handleChangeAvatar}
          currentAvatarUrl={avatarUrl}
        />
      );
    }
    return (
      <>
        {/* AVATAR Y DATOS DEL USUARIO */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
            mt: 2,
          }}
        >
          <Avatar alt={userName} src={avatarUrl} sx={{ width: 240, height: 240, mb: 1.5 }} />
          <Typography variant="h5" fontWeight="bold">
            {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userEmail}
          </Typography>
        </Box>

        {/* CONTENEDOR DE BOTONES */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '350px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <StyledButton variant="contained" onClick={handleModifyProfileClick} fullWidth>
            Modificar Perfil
          </StyledButton>

          {/*  <StyledButton
            variant="contained"
            onClick={handleMyCommentsClick} 
            fullWidth
          >
            Mis Comentarios
          </StyledButton>*/}
        </Box>
      </>
    );
  };

  // -----------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // -----------------------------------------------------

  return (
    <Box
      py={2}
      px={1}
      sx={{
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title={currentView === 'menu' ? 'Mi Perfil' : 'Modificar Perfil'}
        subtitle={currentView === 'menu' ? `Hola, ${userName}` : 'Edita tus datos personales'}
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Perfil" />

      {/* Renderiza el contenido según el estado currentView */}
      {renderContent()}
    </Box>
  );
};

export default Profile;