import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useNotification } from '@/contexts/NotificationContext';
import { AppButton } from '@/components/atoms/AppButton';

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
  const { showNotification } = useNotification();
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
      showNotification('Las contraseñas no coinciden', 'error');
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
        <AppButton
          variant="primary"
          rounded
          type="submit"
          fullWidth
          sx={{ py: 1.5, fontSize: '1rem', mt: 2 }}
        >
          Registrarse
        </AppButton>
        <AppButton
          variant="text"
          onClick={onBackToLogin}
          fullWidth
          sx={{ mt: 1 }}
        >
          Volver al Login
        </AppButton>
      </form>
    </Box>
  );
};

export default Register;