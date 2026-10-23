// src/components/Login.tsx
import React from 'react';
import { Box } from '@mui/material';
import { AppButton } from '@/components/atoms/AppButton';

interface LoginProps {
  imageUrl?: string;
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
}

const Login = ({ imageUrl, onRegisterClick, onLoginClick }: LoginProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '350px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Contenedor de Botones */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Botón para Iniciar Sesión */}
        <AppButton
          variant="primary"
          rounded
          onClick={onLoginClick}
          fullWidth
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          Iniciar sesión
        </AppButton>
      </Box>
    </Box>
  );
};

export default Login;