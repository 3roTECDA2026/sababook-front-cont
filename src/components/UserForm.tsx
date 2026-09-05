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
import type { User } from '../types';

// Opciones para los campos de selección
const roles = ['docente', 'alumno', 'administrador'];
const nivelesEducativos = ['Básico', 'Media', 'Superior'];

export interface UserFormData {
  nombre: string;
  email: string;
  password?: string;
  avatar_url: string;
  rol?: string;
  nivel_educativo: string;
  [key: string]: unknown;
}

interface UserFormProps {
  userToEdit?: (Partial<User> & { rol?: string | null }) | null;
  onSave: (formData: UserFormData) => void | Promise<void>;
  onCancel: () => void;
}

export default function UserForm({ userToEdit, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    email: '',
    password: '', // La contraseña se deja vacía por seguridad. Solo se actualiza si se escribe algo.
    avatar_url: '',
    rol: '',
    nivel_educativo: '',
  });

  // Cuando el componente recibe un usuario para editar, llenamos el formulario.
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        nombre: userToEdit.nombre || '',
        email: userToEdit.email || '',
        password: '', // Importante: no precargar la contraseña
        avatar_url: userToEdit.avatar_url || '',
        rol: userToEdit.rol || '', // Asegura que no sea null
        nivel_educativo: userToEdit.nivel_educativo || '', // Asegura que no sea null
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
            name="nombre"
            value={formData.nombre}
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
            // El email no se puede editar una vez creado (práctica común)
            disabled={!!userToEdit}
          />
          <TextField
            fullWidth
            type="password"
            label={userToEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            // La contraseña es obligatoria solo al crear
            required={!userToEdit}
            helperText={userToEdit ? 'Dejar en blanco para no cambiar la contraseña.' : ''}
          />
          <TextField
            fullWidth
            label="URL del Avatar"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select name="rol" value={formData.rol} label="Rol" onChange={handleChange}>
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
              name="nivel_educativo"
              value={formData.nivel_educativo}
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