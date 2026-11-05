// src/components/forms/LoginForm.tsx

import React, { useState, FormEvent } from 'react';
import { Alert, Box, Button, IconButton, InputAdornment, TextField, Typography, styled, useTheme } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { TipoErrorLogin } from '@/contexts/AuthContextDefinition';

// Estilos del contenedor del formulario (simplemente para dar un padding)
const FormContainer = styled(Box)({
  width: '100%',
  maxWidth: '350px',
  padding: '20px',
});

// Estilos para el botón de Ingresar (usando el mismo estilo del tema)
const StyledIngresarButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
  color: '#FFFFFF',
  padding: '12px 0',
  fontSize: '1rem',
  fontWeight: 'bold',
  borderRadius: '20px', // Mantenemos el border-radius de 20px
  marginTop: theme.spacing(3), // Espacio superior
}));

export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLoginSubmit: (credentials: LoginCredentials) => void;
  error?: string | null;
  errorType?: TipoErrorLogin | null;
}

const LoginForm = ({
  onLoginSubmit,
  error,
  errorType,
}: LoginFormProps) => {
  const theme = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
 const [showPassword, setShowPassword] = useState<boolean>(false);
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
  type={showPassword ? 'text' : 'password'}
  fullWidth
  margin="dense"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((prev) => !prev)}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
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
        <StyledIngresarButton variant="contained" type="submit" fullWidth>
          Ingresar
        </StyledIngresarButton>

        {/* No hay registro público: las cuentas las crea el administrador (SAB-079) */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: 'text.secondary' }}
        >
          ¿No tenés cuenta? Pedísela a la biblioteca de la escuela
        </Typography>
      </FormContainer>
    </form>
  );
};

export default LoginForm;