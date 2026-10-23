
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Slider,
} from '@mui/material';
import { AppButton } from '@/components/atoms/AppButton';

import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Radio as RadioIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Sync as SyncIcon,
  CalendarMonth as CalendarIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';

import SideMenu from './layout/SideMenu';

import {
  radioService,
  type EpisodioRadio,
} from '../services/radio.service';

const ORANGE = '#ff5a00';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${String(remaining).padStart(2, '0')}`;
};

const isGoogleDrive = (url: string) =>
  url.includes('drive.google.com');

const getDriveId = (url: string) => {
  const match = url.match(/\/file\/d\/([^/?]+)/);

  if (match) return match[1];

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('drive.google.com')) {
      return parsed.searchParams.get('id');
    }
  } catch {
    return null;
  }

  return null;
};

const getDriveUrl = (url: string) => {
  const id = getDriveId(url);

  return id
    ? `https://drive.google.com/file/d/${id}/view`
    : url;
};

const getPreviewUrl = (url: string) => {
  const id = getDriveId(url);

  return id
    ? `https://drive.google.com/file/d/${id}/preview`
    : url;
};

interface AudioPlayerProps {
  url: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error('No se pudo reproducir el audio:', error);
      }
    } else {
      audio.pause();
    }
  };

  const changeProgress = (
    _: Event,
    value: number | number[]
  ) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const nextTime = Number(value);

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const changeVolume = (
    _: Event,
    value: number | number[]
  ) => {
    setVolume(Number(value));
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fff7f2',
        borderRadius: '16px',
        p: { xs: 2, md: 3 },
      }}
    >
      <Box
        component="audio"
        ref={audioRef}
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
        }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        spacing={3}
      >
        <IconButton
          onClick={() => void togglePlay()}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          sx={{
            backgroundColor: ORANGE,
            color: '#fff',
            width: 64,
            height: 64,
            flexShrink: 0,
            '&:hover': {
              backgroundColor: '#e65100',
            },
          }}
        >
          {playing ? (
            <PauseIcon sx={{ fontSize: 34 }} />
          ) : (
            <PlayIcon sx={{ fontSize: 38 }} />
          )}
        </IconButton>

        <Box sx={{ flex: 1, width: '100%' }}>
          <Slider
            value={Math.min(
              currentTime,
              Number.isFinite(duration) ? duration : 0
            )}
            min={0}
            max={
              Number.isFinite(duration) && duration > 0
                ? duration
                : 1
            }
            onChange={changeProgress}
            disabled={!Number.isFinite(duration) || duration <= 0}
            aria-label="Progreso del audio"
            sx={{
              color: ORANGE,
              '& .MuiSlider-thumb': {
                width: 13,
                height: 13,
              },
            }}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ width: 160 }}
            >
              <VolumeIcon sx={{ color: '#777' }} />

              <Slider
                value={volume}
                onChange={changeVolume}
                min={0}
                max={100}
                aria-label="Volumen"
                sx={{ color: ORANGE }}
              />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export const RadioPlayer: React.FC = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        py: 3,
        backgroundColor: '#fff',
      }}
    >
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="Radio"
      />

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: 4 }}
      >
        <Tooltip title="Volver">
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Volver"
            sx={{
              color: ORANGE,
              width: 36,
              height: 36,
              p: 0.5,
              '&:hover': {
                backgroundColor: '#fff3e8',
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Abrir menú">
          <IconButton
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú lateral"
            sx={{
              color: ORANGE,
              width: 36,
              height: 36,
              p: 0.5,
              '&:hover': {
                backgroundColor: '#fff3e8',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 26 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ ml: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: '#4b3028' }}
          >
            Radio Sábato
          </Typography>

          <Typography color="text.secondary">
            Escuchá los programas y episodios de nuestra comunidad.
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <AppButton
          variant="primary"
          startIcon={<RefreshIcon />}
          onClick={() => void cargarEpisodios()}
          disabled={cargando || sincronizando}
        >
          Actualizar episodios
        </AppButton>

        <AppButton
          variant="primary"
          startIcon={<SyncIcon />}
          onClick={() => void sincronizar()}
          disabled={cargando || sincronizando}
        >
          {sincronizando
            ? 'Sincronizando...'
            : 'Sincronizar radio'}
        </AppButton>
      </Stack>

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

      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ mb: 3, color: '#20212a' }}
      >
        Episodios disponibles ({episodios.length})
      </Typography>

      {cargando ? (
        <Box
          display="flex"
          justifyContent="center"
          py={6}
        >
          <CircularProgress sx={{ color: ORANGE }} />
        </Box>
      ) : episodios.length === 0 ? (
        <Alert severity="info">
          Todavía no hay episodios disponibles.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {episodios.map((episodio) => (
            <Card
              key={episodio.episodio_id}
              sx={{
                borderRadius: '14px',
                border: '1px solid #f2e4da',
                boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
                backgroundColor: '#fff',
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, md: 3 },
                  '&:last-child': {
                    pb: 3,
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{
                      xs: 'flex-start',
                      sm: 'center',
                    }}
                    spacing={2}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: '#20212a' }}
                    >
                      {episodio.titulo}
                    </Typography>

                    <Chip
                      icon={<RadioIcon />}
                      label={episodio.programa || 'Radio Sábato'}
                      sx={{
                        backgroundColor: '#f0eaff',
                        color: '#5130a0',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: '#5130a0',
                        },
                      }}
                    />
                  </Stack>

                  {episodio.descripcion && (
                    <Typography color="text.secondary">
                      {episodio.descripcion}
                    </Typography>
                  )}

                  {episodio.fecha_emision && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <CalendarIcon
                        sx={{
                          fontSize: 18,
                          color: '#777',
                        }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Publicado:{' '}
                        {new Date(
                          episodio.fecha_emision
                        ).toLocaleDateString('es-AR')}
                      </Typography>
                    </Stack>
                  )}

                  {isGoogleDrive(episodio.audio_url) ? (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          backgroundColor: '#fff7f2',
                          borderRadius: '14px',
                          p: 1.5,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          component="iframe"
                          title={`Reproductor de ${episodio.titulo}`}
                          src={getPreviewUrl(episodio.audio_url)}
                          allow="autoplay"
                          sx={{
                            display: 'block',
                            width: '100%',
                            height: 180,
                            border: 0,
                            borderRadius: '10px',
                            backgroundColor: '#fff',
                          }}
                        />
                      </Box>

                      <AppButton
                        variant="primary"
                        startIcon={<OpenInNewIcon />}
                        component="a"
                        href={getDriveUrl(episodio.audio_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Abrir episodio en Google Drive
                      </AppButton>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Si el reproductor no carga, abrí el episodio
                        directamente en Google Drive.
                      </Typography>
                    </Stack>
                  ) : (
                    <AudioPlayer url={episodio.audio_url} />
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
