// src/components/auth/Register.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Box, Button, TextField, Typography, styled } from '@mui/material';

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

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  onRegisterSubmit: (formData: RegisterFormData) => void;
  onBackToLogin: () => void;
}

const Register = ({ onRegisterSubmit, onBackToLogin }: RegisterProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    onRegisterSubmit(formData);
  };

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
      <Typography variant="h5" sx={{ mb: 2 }}>
        Registro
      </Typography>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextField
          fullWidth
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Confirmar Contraseña"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          margin="normal"
          required
        />
        <StyledButton type="submit" fullWidth sx={{ mt: 2 }}>
          Registrarse
        </StyledButton>
        <Button onClick={onBackToLogin} fullWidth sx={{ mt: 1 }}>
          Volver al Login
        </Button>
      </form>
    </Box>
  );
};

export default Register;