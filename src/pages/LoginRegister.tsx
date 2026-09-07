// src/pages/LoginRegister.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import Login from '../components/Login';
import logoImage from '../assets/logo.png';
import LoginForm from '../components/LoginForm';
import type { LoginCredentials } from '../components/LoginForm';
import Register from '../components/auth/Register';
import { useAuth } from '../hooks/useAuth';

const StyledPageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#FFFFFF',
  padding: theme.spacing(3),
}));

type ViewState = 'presentation' | 'login' | 'register';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('presentation');
  const logoUrl = logoImage;

  const handleRegistroClick = () => {
    setView('register');
    console.log('Cambiando a vista de Registro');
  };
  const handleLoginClick = () => {
    setView('login');
    console.log('Cambiando a vista de formulario de Login');
  };

  const handleLoginSubmit = async ({ email, password }: LoginCredentials) => {
    setError(null); // Limpia errores previos

    try {
      const result = await login(email, password);

      if (result.success) {
        // Navegar a Home
        navigate('/home', { state: { fromLogin: true } });
      } else {
        setError(result.error ?? 'Error al iniciar sesión');
      }
    } catch {
      setError('Error inesperado al iniciar sesión');
    }
  };

  const handleRegisterSubmit = (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log('Datos de registro enviados:', formData);
  };

  const handleBackToLogin = () => {
    setView('presentation');
    console.log('Volviendo a la vista de presentación');
  };

  return (
    <StyledPageContainer>
      <img
        src={logoUrl}
        alt="La gran OCASIÓN Logo"
        style={{
          maxWidth: '100%',
          height: 'auto',
          marginBottom: '40px',
          display: 'block',
          width: '350px',
        }}
      />
      {view === 'presentation' ? (
        <Login imageUrl={logoUrl} onRegisterClick={handleRegistroClick} onLoginClick={handleLoginClick} />
      ) : view === 'login' ? (
        <LoginForm onLoginSubmit={handleLoginSubmit} error={error} />
      ) : view === 'register' ? (
        <Register onRegisterSubmit={handleRegisterSubmit} onBackToLogin={handleBackToLogin} />
      ) : null}
    </StyledPageContainer>
  );
};

export default LoginPage;