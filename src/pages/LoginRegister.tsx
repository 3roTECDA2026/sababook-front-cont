
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

import logoImage from '@/assets/logo.png';
import LoginForm from '@/components/forms/LoginForm';
import type { LoginCredentials } from '@/components/forms/LoginForm';
import Register from '@/components/auth/Register';
import { useAuth } from '@/hooks/useAuth';

const StyledPageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#FFFFFF',
  padding: theme.spacing(3),
}));

type ViewState = 'login' | 'register';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState<string | null>(null);

  // Mostrar directamente el formulario de login
  const [view, setView] = useState<ViewState>('login');

  const handleRegistroClick = () => {
    setError(null);
    setView('register');
  };

  const handleBackToLogin = () => {
    setError(null);
    setView('login');
  };

  const handleLoginSubmit = async ({
    email,
    password,
  }: LoginCredentials) => {
    setError(null);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/home', {
          replace: true,
          state: { fromLogin: true },
        });
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

  return (
    <StyledPageContainer>
      <img
        src={logoImage}
        alt="Logo de Sababook"
        style={{
          maxWidth: '100%',
          height: 'auto',
          marginBottom: '40px',
          display: 'block',
          width: '350px',
        }}
      />

      {view === 'login' && (
        <>
          <LoginForm
            onLoginSubmit={handleLoginSubmit}
            error={error}
          />

          <Box sx={{ mt: 3 }}>
            <button
              type="button"
              onClick={handleRegistroClick}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1976d2',
                color: '#FFFFFF',
              }}
            >
              ¿No tenés cuenta? Registrate
            </button>
          </Box>
        </>
      )}

      {view === 'register' && (
        <Register
          onRegisterSubmit={handleRegisterSubmit}
          onBackToLogin={handleBackToLogin}
        />
      )}
    </StyledPageContainer>
  );
};

export default LoginPage;
