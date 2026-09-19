// src/components/RadioPlayer.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Radio as RadioIcon,
  Language as LanguageIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  MusicNote as MusicIcon,
  Close as CloseIcon,
  Podcasts as PodcastsIcon,
  Sync as SyncIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { radioService, EpisodioRadio, CrearEpisodioPayload } from '../services/radio.service';

interface RadioPlayerProps {
  esDocenteOAdmin?: boolean;
}

// Datos de reserva offline por si falla la conexión y no hay caché previa en localStorage
const EPISODIOS_FALLBACK: EpisodioRadio[] = [
  {
    episodio_id: -1,
    titulo: 'Radio Sábato - Programa Especial (Modo Contingencia)',
    descripcion: 'Episodio predeterminado disponible cuando no hay conexión con el servidor.',
    audio_url: 'https://sites.google.com/sabato.unicen.edu.ar/radiosabato/programas',
    programa: 'Radio Sábato',
    fecha_emision: new Date().toISOString(),
  },
];

const formatearFecha = (fechaStr?: string, opciones?: Intl.DateTimeFormatOptions): string => {
  if (!fechaStr) return 'Sin fecha';
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return 'Sin fecha';

  return fecha.toLocaleDateString(
    'es-AR',
    opciones ?? {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  );
};

export const RadioPlayer: React.FC<RadioPlayerProps> = ({ esDocenteOAdmin = false }) => {
  const navigate = useNavigate();
  const [episodios, setEpisodios] = useState<EpisodioRadio[]>([]);
  const [episodioActual, setEpisodioActual] = useState<EpisodioRadio | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal para carga manual
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [nuevoEpisodio, setNuevoEpisodio] = useState<CrearEpisodioPayload>({
    titulo: '',
    audio_url: '',
    descripcion: '',
    programa: 'Radio Sábato',
  });

  useEffect(() => {
    cargarEpisodios();
  }, []);

  const cargarEpisodios = async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    setError(null);

    try {
      // 1. Petición a la API (Supabase)
      const data = await radioService.obtenerEpisodios();
      const listaValida = Array.isArray(data) && data.length > 0 ? data : null;

      if (listaValida) {
        setEpisodios(listaValida);
        if (!episodioActual) {
          setEpisodioActual(listaValida[0]);
        }
        // Guardamos copia de respaldo en el almacenamiento local del navegador
        localStorage.setItem('radio_sabato_cache', JSON.stringify(listaValida));
      } else {
        throw new Error('No se obtuvieron episodios de la base de datos.');
      }
    } catch (err) {
      console.warn('⚠️ Fallo en servidor/Supabase. Intentando recuperar caché local...', err);

      // 2. Recuperación desde localStorage
      const cacheLocal = localStorage.getItem('radio_sabato_cache');
      if (cacheLocal) {
        try {
          const episodiosReserva = JSON.parse(cacheLocal);
          setEpisodios(episodiosReserva);
          if (!episodioActual && episodiosReserva.length > 0) {
            setEpisodioActual(episodiosReserva[0]);
          }
          setError('Modo sin conexión: cargando episodios guardados en caché.');
        } catch (parseErr) {
          setEpisodios(EPISODIOS_FALLBACK);
          setEpisodioActual(EPISODIOS_FALLBACK[0]);
        }
      } else {
        // 3. Fallback de contingencia si no hay nada en caché
        setEpisodios(EPISODIOS_FALLBACK);
        setEpisodioActual(EPISODIOS_FALLBACK[0]);
        setError('No se pudo conectar con el servidor. Se cargó el programa de contingencia.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleSincronizar = async () => {
    setSincronizando(true);
    setError(null);
    try {
      const res = await radioService.sincronizarProgramas();
      await cargarEpisodios(true);
      alert(res.mensaje || `Sincronización finalizada. Nuevos episodios: ${res.agregados ?? 0}`);
    } catch (err) {
      console.error('Error al sincronizar:', err);
      setError('Ocurrió un error al intentar sincronizar los programas con Google Sites.');
    } finally {
      setSincronizando(false);
    }
  };

  const handleCrearEpisodio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEpisodio.titulo || !nuevoEpisodio.audio_url) return;

    setGuardando(true);
    try {
      const creado = await radioService.crearEpisodio(nuevoEpisodio);
      setEpisodios((prev) => [creado, ...prev]);
      setEpisodioActual(creado);
      setModalAbierto(false);
      setNuevoEpisodio({
        titulo: '',
        audio_url: '',
        descripcion: '',
        programa: 'Radio Sábato',
      });
    } catch (err) {
      console.error('Error al guardar episodio:', err);
      alert('Error al publicar el episodio. Verificá los campos o tus permisos.');
    } finally {
      setGuardando(false);
    }
  };

  const episodiosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return episodios;
    return episodios.filter(
      (ep) =>
        ep.titulo.toLowerCase().includes(q) ||
        ep.programa?.toLowerCase().includes(q) ||
        ep.descripcion?.toLowerCase().includes(q)
    );
  }, [episodios, busqueda]);

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={12} gap={2}>
        <CircularProgress color="secondary" size={32} />
        <Typography color="text.secondary">Cargando Radio Sábato...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header & Acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Tooltip title="Volver al Inicio">
            <IconButton
              onClick={() => navigate('/home')}
              color="primary"
              aria-label="Volver al inicio"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                mr: 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <RadioIcon color="secondary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Radio Sábato
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Escuchá los podcasts y transmisiones producidas por la comunidad escolar.
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="contained"
            color="secondary"
            startIcon={sincronizando ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
            onClick={handleSincronizar}
            disabled={sincronizando}
            sx={{ borderRadius: 2 }}
          >
            {sincronizando ? 'Sincronizando...' : 'Sincronizar Web'}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LanguageIcon />}
            href="https://sites.google.com/sabato.unicen.edu.ar/radiosabato/programas"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ borderRadius: 2 }}
          >
            Sitio Oficial ↗
          </Button>

          {esDocenteOAdmin && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setModalAbierto(true)}
              sx={{ borderRadius: 2 }}
            >
              Subir Episodio
            </Button>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Reproductor Destacado / Activo */}
      {episodioActual ? (
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4a148c 0%, #311b92 100%)',
            color: 'white',
            boxShadow: 4,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Chip
                label={episodioActual.programa || 'Radio Sábato'}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {formatearFecha(episodioActual.fecha_emision, {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Typography>
            </Box>

            <Typography variant="h5" component="h2" fontWeight="bold" mb={1}>
              {episodioActual.titulo}
            </Typography>

            {episodioActual.descripcion && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                {episodioActual.descripcion}
              </Typography>
            )}

            {/* Contenedor del reproductor */}
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                mt: 2,
                overflow: 'hidden',
              }}
            >
              {episodioActual.audio_url.includes('drive.google.com') ? (
                <iframe
                  key={episodioActual.episodio_id}
                  src={
                    episodioActual.audio_url.includes('/preview')
                      ? episodioActual.audio_url
                      : episodioActual.audio_url.replace(/\/view.*/, '/preview')
                  }
                  width="100%"
                  height="120"
                  style={{ border: 'none', borderRadius: '8px' }}
                  allow="autoplay"
                />
              ) : (
                <audio
                  key={episodioActual.episodio_id}
                  controls
                  preload="metadata"
                  style={{ width: '100%', display: 'block' }}
                >
                  <source src={episodioActual.audio_url} type="audio/mpeg" />
                  Tu navegador no soporta el reproductor de audio.
                </audio>
              )}
            </Paper>
          </CardContent>
        </Card>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 5,
            textAlign: 'center',
            backgroundColor: 'background.default',
            borderRadius: 2,
            borderStyle: 'dashed',
            mb: 4,
          }}
        >
          <PodcastsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
          <Typography color="text.secondary" mb={2}>
            No hay episodios guardados en el sistema.
          </Typography>
          <Button variant="outlined" color="secondary" startIcon={<SyncIcon />} onClick={handleSincronizar}>
            Sincronizar con Google Sites
          </Button>
        </Paper>
      )}

      {/* Buscador */}
      <TextField
        fullWidth
        placeholder="Buscar programa por título o palabra clave..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ my: 3 }} />

      {/* Lista de Episodios */}
      <Typography variant="h6" component="h3" fontWeight="bold" mb={2}>
        Lista de Episodios ({episodiosFiltrados.length})
      </Typography>

      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {episodiosFiltrados.length > 0 ? (
          episodiosFiltrados.map((ep) => {
            const esSeleccionado = episodioActual?.episodio_id === ep.episodio_id;
            return (
              <Paper key={ep.episodio_id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <ListItemButton
                  selected={esSeleccionado}
                  onClick={() => setEpisodioActual(ep)}
                  sx={{
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'secondary.50',
                    },
                  }}
                >
                  <ListItemIcon>
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: esSeleccionado ? 'secondary.main' : 'action.selected',
                        color: esSeleccionado ? 'white' : 'action.active',
                        '&:hover': {
                          bgcolor: esSeleccionado ? 'secondary.dark' : 'action.focus',
                        },
                      }}
                    >
                      {esSeleccionado ? <PlayIcon fontSize="small" /> : <MusicIcon fontSize="small" />}
                    </IconButton>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={esSeleccionado ? 'bold' : 'normal'}>
                        {ep.titulo}
                      </Typography>
                    }
                    secondary={`${ep.programa || 'Radio Sábato'} • ${formatearFecha(ep.fecha_emision)}`}
                  />

                  {esSeleccionado && (
                    <Chip label="Reproduciendo" size="small" color="secondary" variant="outlined" />
                  )}
                </ListItemButton>
              </Paper>
            );
          })
        ) : (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">
              No se encontraron episodios que coincidan con "{busqueda}".
            </Typography>
          </Paper>
        )}
      </List>

      {/* Modal Formulario de Carga Manual */}
      <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          Nuevo Episodio de Radio
          <IconButton onClick={() => setModalAbierto(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCrearEpisodio}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="Título del Episodio"
                required
                fullWidth
                placeholder="Ej: Entrevista sobre 'El Túnel' de Ernesto Sábato"
                value={nuevoEpisodio.titulo}
                onChange={(e) => setNuevoEpisodio({ ...nuevoEpisodio, titulo: e.target.value })}
              />

              <TextField
                label="URL del Archivo de Audio (MP3/Podcast)"
                type="url"
                required
                fullWidth
                placeholder="https://servidor.com/audio/episodio1.mp3"
                value={nuevoEpisodio.audio_url}
                onChange={(e) => setNuevoEpisodio({ ...nuevoEpisodio, audio_url: e.target.value })}
              />

              <TextField
                label="Programa / Sección"
                fullWidth
                placeholder="Ej: Radio Sábato - Especiales APL"
                value={nuevoEpisodio.programa}
                onChange={(e) => setNuevoEpisodio({ ...nuevoEpisodio, programa: e.target.value })}
              />

              <TextField
                label="Descripción o Notas del Episodio"
                fullWidth
                multiline
                rows={3}
                placeholder="Resumen del episodio y temas debatidos..."
                value={nuevoEpisodio.descripcion}
                onChange={(e) => setNuevoEpisodio({ ...nuevoEpisodio, descripcion: e.target.value })}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setModalAbierto(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={guardando}
              startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {guardando ? 'Publicando...' : 'Publicar Episodio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default RadioPlayer;