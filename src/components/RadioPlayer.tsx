
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Radio as RadioIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

import {
  radioService,
  type EpisodioRadio,
} from '../services/radio.service';

export const RadioPlayer: React.FC = () => {
  const navigate = useNavigate();

  const [episodios, setEpisodios] = useState<EpisodioRadio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarEpisodios = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await radioService.obtenerEpisodios();
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar episodios:', err);
      setError('No se pudieron cargar los episodios de Radio Sábato.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarEpisodios();
  }, [cargarEpisodios]);

  const sincronizar = async () => {
    try {
      setSincronizando(true);
      setError(null);
      setMensaje(null);

      const resultado = await radioService.sincronizarProgramas();

      setMensaje(
        `Sincronización completada. Episodios nuevos: ${resultado.agregados}.`
      );

      await cargarEpisodios();
    } catch (err) {
      console.error('Error al sincronizar:', err);
      setError('No se pudieron sincronizar los programas.');
    } finally {
      setSincronizando(false);
    }
  };

  const esGoogleDrive = (url: string) =>
    url.includes('drive.google.com');

  const obtenerUrlDrive = (url: string) => {
    const match = url.match(/\/file\/d\/([^/]+)/);

    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/view`;
    }

    return url;
  };

  const obtenerUrlPreview = (url: string) => {
    const match = url.match(/\/file\/d\/([^/]+)/);

    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }

    return url;
  };

  return (
    <Box maxWidth="lg" mx="auto" px={3} py={4}>
      {/* BOTÓN VOLVER */}
      <Button
        variant="outlined"
        color="primary"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/home')}
        sx={{
          mb: 3,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'bold',
        }}
      >
        Volver al inicio
      </Button>

      {/* ENCABEZADO */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #283593, #673ab7)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <RadioIcon sx={{ fontSize: 44 }} />

          <Box>
            <Typography variant="h4" fontWeight="bold">
              Radio Sábato
            </Typography>

            <Typography variant="body1">
              Escuchá los programas y episodios de nuestra comunidad.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ACCIONES */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        mb={3}
      >
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => void cargarEpisodios()}
          disabled={cargando || sincronizando}
        >
          Actualizar episodios
        </Button>

        <Button
          variant="outlined"
          startIcon={<SyncIcon />}
          onClick={() => void sincronizar()}
          disabled={sincronizando || cargando}
        >
          {sincronizando ? 'Sincronizando...' : 'Sincronizar Radio'}
        </Button>
      </Stack>

      {/* MENSAJES */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {mensaje && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {mensaje}
        </Alert>
      )}

      {/* CARGA */}
      {cargando ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : episodios.length === 0 ? (
        <Alert severity="info">
          Todavía no hay episodios disponibles.
        </Alert>
      ) : (
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight="bold">
            Episodios disponibles ({episodios.length})
          </Typography>

          {episodios.map((episodio) => (
            <Card
              key={episodio.episodio_id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {episodio.titulo}
                    </Typography>

                    <Chip
                      icon={<RadioIcon />}
                      label={episodio.programa || 'Radio Sábato'}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  {episodio.descripcion && (
                    <Typography color="text.secondary">
                      {episodio.descripcion}
                    </Typography>
                  )}

                  {episodio.fecha_emision && (
                    <Typography variant="caption" color="text.secondary">
                      Publicado:{' '}
                      {new Date(
                        episodio.fecha_emision
                      ).toLocaleDateString('es-AR')}
                    </Typography>
                  )}

                  <Divider />

                  {esGoogleDrive(episodio.audio_url) ? (
                    <Stack spacing={2}>
                      <Box
                        component="iframe"
                        title={`Reproductor de ${episodio.titulo}`}
                        src={obtenerUrlPreview(episodio.audio_url)}
                        sx={{
                          width: '100%',
                          height: 180,
                          border: 0,
                          borderRadius: 2,
                          backgroundColor: '#f5f5f5',
                        }}
                        allow="autoplay"
                      />

                      <Button
                        variant="outlined"
                        startIcon={<OpenInNewIcon />}
                        component="a"
                        href={obtenerUrlDrive(episodio.audio_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Abrir episodio en Google Drive
                      </Button>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Si el reproductor no carga, abrí el episodio
                        directamente en Google Drive.
                      </Typography>
                    </Stack>
                  ) : (
                    <Box
                      component="audio"
                      controls
                      src={episodio.audio_url}
                      sx={{ width: '100%' }}
                    >
                      Tu navegador no admite audio HTML5.
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default RadioPlayer;
