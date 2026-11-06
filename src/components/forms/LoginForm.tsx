// src/components/forms/LoginForm.tsx

import React, { useState, FormEvent } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography, styled, useTheme } from '@mui/material';
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
  loading?: boolean;
}

const LoginForm = ({
  onLoginSubmit,
  error,
  errorType,
  loading = false,
}: LoginFormProps) => {
  const theme = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // Mostrar u ocultar la contraseña con el botón del ojo (SAB-138)
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Usamos el color 'body.main' de tu tema para el texto del label
  const labelColor = theme.palette.body?.main || '#4A4C52';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Se vuelve a ocultar al enviar: si el login falla, no queda la contraseña a la vista
    setShowPassword(false);
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
            sx={{
              // Oculta el ojo propio de Edge para que no aparezcan dos
              '& input::-ms-reveal, & input::-ms-clear': { display: 'none' },
            }}
            slotProps={{
              // Con la contraseña visible, el teclado del celular no debe corregirla ni
              // ponerle mayúsculas, y el navegador no debe revisar su ortografía
              htmlInput: {
                spellCheck: false,
                autoCapitalize: 'none',
                autoCorrect: 'off',
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {/* onMouseDown evita que el campo pierda el foco y se cierre el teclado del celular */}
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
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
        {/* Deshabilitado mientras se procesa, para evitar envíos repetidos (SAB-143) */}
        <StyledIngresarButton
          variant="contained"
          type="submit"
          fullWidth
          disabled={loading}
        >
          {/* El spinner mide lo mismo que la línea de texto, así el botón no cambia de alto */}
          {loading ? (
            <CircularProgress size={28} color="inherit" aria-label="Ingresando" />
          ) : (
            'Ingresar'
          )}
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