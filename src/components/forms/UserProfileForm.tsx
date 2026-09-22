// src/components/UserProfileForm.tsx
import { Box, Typography, TextField, Button, Avatar, IconButton } from '@mui/material';
import React, { useState } from 'react';

// --- Constantes para generar los avatares predeterminados ---
// El estilo de DiceBear a utilizar (por ejemplo, 'adventurer', 'bottts', 'micah')
const DICEBEAR_STYLE = 'adventurer';

// Las "semillas" (seeds) para generar avatares únicos
const SEEDS = ['Ryker', 'Kimberly', 'Max', 'Mackenzie', 'Zoe', 'Leo'];

// Genera el array de URLs utilizando las constantes
const DEFAULT_AVATARS = SEEDS.map((seed) => `https://api.dicebear.com/7.x/${DICEBEAR_STYLE}/svg?seed=${seed}`);
// ------------------------------------------------------------

interface UserProfileFormData {
  nombre: string;
  email: string;
  avatar_url: string;
}

interface UserProfileFormProps {
  userName?: string;
  userEmail?: string;
  currentAvatarUrl?: string;
  onCancel: () => void;
  onSave: (formData: UserProfileFormData) => void;
  onAvatarChange?: (url: string) => void;
}

export default function UserProfileForm({
  userName,
  userEmail,
  currentAvatarUrl,
  onCancel,
  onSave,
  onAvatarChange,
}: UserProfileFormProps) {
  // Usamos el primer avatar por defecto si no se proporciona uno actual
  const [formData, setFormData] = useState<UserProfileFormData>({
    nombre: userName || '',
    email: userEmail || '',
    avatar_url: currentAvatarUrl || DEFAULT_AVATARS[0],
  });

  // Función para manejar el clic en un avatar predeterminado
  const handleAvatarSelect = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
    if (onAvatarChange) {
      onAvatarChange(url);
    }
  };

  const handleInputChange = (field: keyof UserProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Box sx={{ maxWidth: '400px', margin: '0 auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Editar Perfil de **{userName}**
      </Typography>

      {/* SECCIÓN DE SELECCIÓN DE AVATAR */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Selecciona un Avatar:
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center',
          mb: 3,
        }}
      >
        {/* Asegúrate de que DEFAULT_AVATARS esté declarado
          antes de usarlo aquí.
        */}
        {DEFAULT_AVATARS.map((url) => (
          <IconButton
            key={url}
            onClick={() => handleAvatarSelect(url)}
            sx={{
              border: url === formData.avatar_url ? '3px solid #f25600' : '3px solid transparent',
              padding: 0,
              borderRadius: '50%', // Para que el borde siga la forma del Avatar
            }}
          >
            <Avatar
              src={url}
              alt={`Avatar para ${url.split('seed=')[1]}`} // Alt text más descriptivo
              sx={{ width: 56, height: 56 }}
            />
          </IconButton>
        ))}
      </Box>

      {/* CAMPOS DEL FORMULARIO */}
      <TextField
        label="Nombre Completo"
        value={formData.nombre}
        onChange={(e) => handleInputChange('nombre', e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Correo Electrónico"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        fullWidth
        margin="normal"
        type="email"
      />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          fullWidth
          sx={{
            borderColor: '#f25600',
            color: '#f25600',
            '&:hover': {
              borderColor: '#f25600', // Mantener el color del borde en hover
              backgroundColor: 'rgba(242, 86, 0, 0.04)', // Efecto de hover ligero
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          sx={{
            backgroundColor: '#f25600',
            color: 'white',
            '&:hover': {
              backgroundColor: '#cc4800',
            },
          }}
        >
          Guardar Cambios
        </Button>
      </Box>
    </Box>
  );
}