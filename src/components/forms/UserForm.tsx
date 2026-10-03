// src/components/UserForm.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { User } from '@/types';

// Opciones para los campos de selección
const roles = ['docente', 'alumno', 'administrador'];
const nivelesEducativos = ['Básico', 'Media', 'Superior'];

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  role?: string;
  educationalLevel: string;
  [key: string]: unknown;
}

interface UserFormProps {
  userToEdit?: (Partial<User> & { role?: string | null; rol?: string | null }) | null;
  onSave: (formData: UserFormData) => void | Promise<void>;
  onCancel: () => void;
}

export default function UserForm({ userToEdit, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    avatarUrl: '',
    role: '',
    educationalLevel: '',
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || userToEdit.nombre || '',
        email: userToEdit.email || '',
        password: '',
        avatarUrl: userToEdit.avatarUrl || userToEdit.avatar_url || '',
        role: userToEdit.role || userToEdit.rol || '',
        educationalLevel: userToEdit.educationalLevel || userToEdit.nivel_educativo || '',
      });
    }
  }, [userToEdit]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Pasamos los datos del formulario al componente padre para que los guarde.
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={{
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="secondary.main" mb={3}>
          {userToEdit ? 'Editar Usuario' : 'Crear Usuario'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={!!userToEdit}
          />
          <TextField
            fullWidth
            type="password"
            label={userToEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!userToEdit}
            helperText={userToEdit ? 'Dejar en blanco para no cambiar la contraseña.' : ''}
          />
          <TextField
            fullWidth
            label="URL del Avatar"
            name="avatarUrl"
            value={formData.avatarUrl}
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select name="role" value={formData.role} label="Rol" onChange={handleChange}>
              {roles.map((rol) => (
                <MenuItem key={rol} value={rol}>
                  {rol.charAt(0).toUpperCase() + rol.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Nivel Educativo</InputLabel>
            <Select
              name="educationalLevel"
              value={formData.educationalLevel}
              label="Nivel Educativo"
              onChange={handleChange}
            >
              {nivelesEducativos.map((nivel) => (
                <MenuItem key={nivel} value={nivel}>
                  {nivel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button onClick={onCancel} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" sx={{ backgroundColor: 'button.main' }}>
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </form>
  );
}