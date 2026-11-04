// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, styled, Avatar, Typography } from '@mui/material';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import UserProfileForm from '@/components/forms/UserProfileForm';
import ReadingGoalsSection from '@/components/ReadingGoalsSection';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, updateUser, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewState>('menu');
  // SAB-136: estado del guardado y mensaje del back si falla
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
  const handleCancel = () => {
    setSaveError(null);
    setCurrentView('menu');
  };
  const handleSave = async (updatedData: { nombre: string; email: string; avatar_url: string }) => {
    // SAB-136: el email solo lo puede cambiar un administrador; para el resto no se envía
    const payload: ProfileSaveData = {
      nombre: updatedData.nombre,
      avatar_url: updatedData.avatar_url,
      ...(isAdmin ? { email: updatedData.email } : {}),
    };

    setIsSaving(true);
    setSaveError(null);
    const result = await updateUser(payload);
    setIsSaving(false);

    if (result.success) {
      handleCancel();
    } else {
      setSaveError(result.error || 'No se pudo guardar el perfil.');
    }
  };


  // -----------------------------------------------------
  // FUNCIÓN DE RENDERIZADO CONDICIONAL
  // -----------------------------------------------------

  const renderContent = () => {
    if (currentView === 'form') {
      // Muestra el formulario de edición
      return (
        <>
          {saveError && (
            <Alert
              severity="error"
              onClose={() => setSaveError(null)}
              sx={{ maxWidth: '480px', mx: 'auto', mb: 2 }}
            >
              {saveError}
            </Alert>
          )}
          <UserProfileForm
            userName={userName}
            userEmail={userEmail}
            onCancel={handleCancel}
            onSave={handleSave}
            onAvatarChange={handleChangeAvatar}
            currentAvatarUrl={avatarUrl}
            canEditEmail={isAdmin}
            isSaving={isSaving}
          />
        </>
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

        {/* SECCIÓN DE METAS DE LECTURA */}
         <Box sx={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
          <ReadingGoalsSection />
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