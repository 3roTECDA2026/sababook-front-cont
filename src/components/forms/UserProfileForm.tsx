// src/components/UserProfileForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Paper,
  Divider,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EditIcon from '@mui/icons-material/Edit';

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(formData);
  };

  return (
    <Paper
      elevation={0}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: '480px',
        margin: '0 auto',
        p: { xs: 3, sm: 4 },
        borderRadius: '20px',
        border: '1px solid #f0ece9',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ENCABEZADO DEL PERFIL */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          mb: 2.5,
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
          <Avatar
            src={formData.avatar_url}
            alt={formData.nombre || userName || 'Avatar'}
            sx={{
              width: 100,
              height: 100,
              border: '3px solid #f25600',
              boxShadow: '0 4px 14px rgba(242, 86, 0, 0.25)',
              transition: 'transform 0.2s ease',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: '#f25600',
              color: '#ffffff',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              border: '2px solid #ffffff',
            }}
          >
            <EditIcon sx={{ fontSize: 15 }} />
          </Box>
        </Box>

        <Typography variant="h5" component="h2" fontWeight={700} color="primary.main">
          Editar Perfil
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Modificando los datos de{' '}
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {userName || 'tu cuenta'}
          </Box>
        </Typography>
      </Box>

      <Divider sx={{ my: 2.5, borderColor: '#f0ece9' }} />

      {/* SECCIÓN DE SELECCIÓN DE AVATAR */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: '0.75rem',
            textAlign: 'center',
            mb: 1.5,
          }}
        >
          Selecciona un Avatar
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {DEFAULT_AVATARS.map((url, index) => {
            const isSelected = url === formData.avatar_url;
            return (
              <Tooltip key={url} title={`Avatar ${index + 1}`} arrow>
                <IconButton
                  onClick={() => handleAvatarSelect(url)}
                  sx={{
                    padding: '2px',
                    border: isSelected ? '3px solid #f25600' : '3px solid transparent',
                    borderRadius: '50%',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: isSelected ? '0 4px 10px rgba(242, 86, 0, 0.3)' : 'none',
                    '&:hover': {
                      transform: 'scale(1.12)',
                      borderColor: isSelected ? '#f25600' : 'rgba(242, 86, 0, 0.4)',
                    },
                  }}
                >
                  <Avatar
                    src={url}
                    alt={`Avatar ${index + 1}`}
                    sx={{ width: 50, height: 50 }}
                  />
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* CAMPOS DEL FORMULARIO */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <TextField
          label="Nombre Completo"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          fullWidth
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Correo Electrónico"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          fullWidth
          type="email"
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* ACCIONES */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          fullWidth
          sx={{
            borderRadius: '24px',
            py: 1.2,
            fontWeight: 700,
            borderColor: '#f25600 !important',
            backgroundColor: 'transparent !important',
            color: '#f25600 !important',
            border: '1.5px solid #f25600 !important',
            '&:hover': {
              backgroundColor: 'rgba(242, 86, 0, 0.08) !important',
              borderColor: '#cc4800 !important',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            borderRadius: '24px',
            py: 1.2,
            fontWeight: 700,
            backgroundColor: '#f25600 !important',
            color: '#ffffff !important',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#cc4800 !important',
              boxShadow: '0 4px 12px rgba(242, 86, 0, 0.35)',
            },
          }}
        >
          Guardar Cambios
        </Button>
      </Box>
    </Paper>
  );
}