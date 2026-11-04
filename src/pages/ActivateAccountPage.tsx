import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import logoImage from '@/assets/logo.png';
import { activarInvitacion, getInvitacion } from '@/services/invitationService';
import type { InvitacionValidada } from '@/types/invitation';

const ActivateAccountPage = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();

  const [invitacion, setInvitacion] = useState<InvitacionValidada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contrasena, setContrasena] = useState('');
  const [repetirContrasena, setRepetirContrasena] = useState('');
  const [saving, setSaving] = useState(false);
  const [activada, setActivada] = useState(false);

  useEffect(() => {
    let activo = true;

    getInvitacion(token)
      .then((data) => {
        if (activo) setInvitacion(data);
      })
      .catch((err: unknown) => {
        if (activo) {
          setError(err instanceof Error ? err.message : 'La invitación no es válida.');
        }
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== repetirContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSaving(true);

    try {
      await activarInvitacion(token, contrasena);
      setActivada(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo activar la cuenta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        px: 3,
        py: 4,
      }}
    >
      <Box
        component="img"
        src={logoImage}
        alt="La gran OCASIÓN Logo"
        sx={{ width: 350, maxWidth: '100%', height: 'auto', mb: 4 }}
      />

      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && !invitacion && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && invitacion && !activada && (
          <>
            <Typography variant="h5" fontWeight="bold" color="secondary.main" mb={1}>
              Definí tu contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Hola {invitacion.nombre}. Activá tu cuenta de {invitacion.email} para ingresar a la biblioteca.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="contrasena"
                name="contrasena"
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                required
                fullWidth
              />
              <TextField
                id="repetir-contrasena"
                name="repetir-contrasena"
                label="Repetir contraseña"
                type="password"
                autoComplete="new-password"
                value={repetirContrasena}
                onChange={(event) => setRepetirContrasena(event.target.value)}
                required
                fullWidth
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold' }}
              >
                {saving ? 'Activando...' : 'Activar cuenta'}
              </Button>
            </Box>
          </>
        )}

        {activada && (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Cuenta activada correctamente. Ya podés iniciar sesión.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/login?activada=1', { replace: true })}
              sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold' }}
            >
              Ir a iniciar sesión
            </Button>
          </>
        )}

        {!loading && !activada && (
          <Button
            fullWidth
            onClick={() => navigate('/login', { replace: true })}
            sx={{ mt: 2, textTransform: 'none' }}
          >
            Volver al login
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ActivateAccountPage;
