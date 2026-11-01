import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { useNotification } from '@/contexts/NotificationContext';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  onRegisterSubmit: (formData: RegisterFormData) => void | Promise<void>;
  onBackToLogin: () => void;
  loading?: boolean;
  error?: string | null;
}

const Register = ({
  onRegisterSubmit,
  onBackToLogin,
  loading = false,
  error = null,
}: RegisterProps) => {
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
    void onRegisterSubmit(formData);
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
          required
        />
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
        <Button type="submit" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
        <Button
          onClick={onBackToLogin}
          fullWidth
          sx={{ mt: 1 }}
          disabled={loading}
        >
          Volver al Login
        </Button>
      </form>
    </Box>
  );
};

export default Register;