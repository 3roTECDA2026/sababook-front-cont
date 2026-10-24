// src/components/forms/LoginForm.tsx

import React, { useState, FormEvent } from 'react';
import { Alert, Box, TextField, Typography, styled, useTheme } from '@mui/material';
import type { TipoErrorLogin } from '@/contexts/AuthContextDefinition';
import { AppButton } from '@/components/atoms/AppButton';

// Estilos del contenedor del formulario (simplemente para dar un padding)
const FormContainer = styled(Box)({
  width: '100%',
  maxWidth: '350px',
  padding: '20px',
});

export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLoginSubmit: (credentials: LoginCredentials) => void;
  error?: string | null;
  errorType?: TipoErrorLogin | null;
}

const LoginForm = ({ onLoginSubmit, error, errorType }: LoginFormProps) => {
  const theme = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Usamos el color 'body.main' de tu tema para el texto del label
  const labelColor = theme.palette.body?.main || '#4A4C52';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLoginSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer>
        {/* Campo de Email */}
        <Box mb={2}>
          <Typography
            variant="body1"
            component="label"
            htmlFor="email"
            sx={{ color: labelColor, fontWeight: 'bold' }}
          >
            Email
          </Typography>
          <TextField
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            variant="outlined"
            fullWidth
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Box>

        {/* Campo de Contraseña */}
        <Box mb={2}>
          <Typography
            variant="body1"
            component="label"
            htmlFor="password"
            sx={{ color: labelColor, fontWeight: 'bold' }}
          >
            Contraseña
          </Typography>
          <TextField
            id="password"
            name="password"
            autoComplete="current-password"
            variant="outlined"
            type="password"
            fullWidth
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Box>

        {/* Error de conexión: cartel azul informativo */}
        {error && errorType === 'conexion' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Credenciales incorrectas: mensaje neutro, en tono suave */}
        {error && errorType !== 'conexion' && (
          <Typography
            variant="body2"
            align="center"
            aria-live="polite"
            sx={{ mb: 2, color: 'text.secondary' }}
          >
            {error}
          </Typography>
        )}

        {/* Botón de Ingresar */}
        <AppButton
          variant="primary"
          rounded
          type="submit"
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '1rem',
            mt: 3,
          }}
        >
          Ingresar
        </AppButton>
      </FormContainer>
    </form>
  );
};

export default LoginForm;