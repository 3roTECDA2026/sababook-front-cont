// src/components/FeedMuro.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Radio as RadioIcon,
  Forum as ForumIcon,
  MenuBook as BookIcon,
  Star as StarIcon,
  PushPin as PinIcon,
  ArrowBack as ArrowBackIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../environments/api';

type TipoActividad = 'RADIO_EPISODIO' | 'FORO_APL' | 'NUEVO_LIBRO' | 'NUEVA_OPINION' | 'RESEÑA' | 'AVISO' | string;

interface ActividadFeed {
  actividad_id: string | number;
  usuario_avatar?: string | null;
  usuario_nombre?: string | null;
  fecha: string;
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string | null;
  // Campos referenciales según el schema de Prisma / Backend
  entidad_id?: string | number | null;
  referencia_id?: string | number | null;
  lista_id?: string | number | null;
  libro_id?: string | number | null;
}

interface FeedResponse {
  actividades: ActividadFeed[];
  total: number;
}

const feedService = {
  async obtenerFeed(page: number, limit: number): Promise<FeedResponse> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/api/v1/feed?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor (${response.status})`);
    }

    return response.json() as Promise<FeedResponse>;
  },

  // Método para borrar o limpiar el feed en backend/vista
  async limpiarFeed(): Promise<boolean> {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/feed`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

const PAGE_LIMIT = 10;

export const FeedMuro: React.FC = () => {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState<ActividadFeed[]>([]);
  const [pagina, setPagina] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [cargandoInicial, setCargandoInicial] = useState<boolean>(true);
  const [cargandoMas, setCargandoMas] = useState<boolean>(false);
  const [limpiando, setLimpiando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed(1, true);
  }, []);

  const fetchFeed = async (page: number, isInitial: boolean = false) => {
    if (isInitial) {
      setCargandoInicial(true);
    } else {
      setCargandoMas(true);
    }
    setError(null);

    try {
      const data = await feedService.obtenerFeed(page, PAGE_LIMIT);

      if (isInitial) {
        setActividades(data.actividades || []);
      } else {
        setActividades((prev) => [...prev, ...(data.actividades || [])]);
      }

      setTotal(data.total || 0);
      setPagina(page);
    } catch (err) {
      console.error('Error al cargar el feed:', err);
      setError('No se pudo cargar la actividad reciente. Intentalo de nuevo.');
    } finally {
      setCargandoInicial(false);
      setCargandoMas(false);
    }
  };

  const handleCargarMas = () => {
    if (!cargandoMas && actividades.length < total) {
      fetchFeed(pagina + 1, false);
    }
  };

  // Función para vaciar / limpiar el muro de actividades
  const handleLimpiarMuro = async () => {
    if (window.confirm('¿Estás seguro de que querés limpiar las actividades del muro?')) {
      setLimpiando(true);
      const ok = await feedService.limpiarFeed();
      if (ok) {
        setActividades([]);
        setTotal(0);
      } else {
        // Si el backend no tiene un endpoint DELETE /feed, las limpiamos localmente en el estado
        setActividades([]);
        setTotal(0);
      }
      setLimpiando(false);
    }
  };

  // LÓGICA DE NAVEGACIÓN A LA ACTIVIDAD
  const handleItemClick = (actividad: ActividadFeed) => {
    const targetId =
      actividad.entidad_id ||
      actividad.referencia_id ||
      actividad.libro_id ||
      actividad.lista_id;

    switch (actividad.tipo) {
      case 'NUEVO_LIBRO':
      case 'NUEVA_OPINION':
      case 'RESEÑA':
        if (targetId) navigate(`/book/${targetId}`);
        else navigate('/home');
        break;

      case 'FORO_APL':
        if (targetId) navigate(`/foro/${targetId}`);
        else navigate('/foro');
        break;

      case 'RADIO_EPISODIO':
        if (targetId) navigate(`/radio/${targetId}`);
        else navigate('/radio');
        break;

      default:
        if (targetId) navigate(`/book/${targetId}`);
        else navigate('/home');
        break;
    }
  };

  const renderBadgeTipo = (tipo: TipoActividad) => {
    switch (tipo) {
      case 'RADIO_EPISODIO':
        return <Chip icon={<RadioIcon />} label="Radio Sábato" color="secondary" size="small" variant="outlined" />;
      case 'FORO_APL':
        return <Chip icon={<ForumIcon />} label="Foro APL" color="warning" size="small" variant="outlined" />;
      case 'NUEVO_LIBRO':
        return <Chip icon={<BookIcon />} label="Libro" color="info" size="small" variant="outlined" />;
      case 'NUEVA_OPINION':
      case 'RESEÑA':
        return <Chip icon={<StarIcon />} label="Opinión" color="success" size="small" variant="outlined" />;
      default:
        return <Chip icon={<PinIcon />} label="Novedad" color="default" size="small" variant="outlined" />;
    }
  };

  const hayMasPaginas = actividades.length < total;

  if (cargandoInicial) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8} gap={2}>
        <CircularProgress color="primary" size={32} />
        <Typography color="text.secondary">Cargando muro de actividades...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      {/* Encabezado con Botón de Volver y Limpiar Muro */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate(-1)} color="primary" aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Muro de Actividades
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="caption" color="text.secondary">
            {total} {total === 1 ? 'publicación' : 'publicaciones'}
          </Typography>

          {actividades.length > 0 && (
            <Tooltip title="Limpiar muro">
              <IconButton onClick={handleLimpiarMuro} color="error" disabled={limpiando} size="small">
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {actividades.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', backgroundColor: 'background.default' }}>
          <Typography color="text.secondary">No hay actividad reciente en la plataforma.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {actividades.map((actividad) => {
            const nombreUsuario = actividad.usuario_nombre || 'Comunidad Sábato';
            const inicial = nombreUsuario.charAt(0).toUpperCase();

            return (
              <Card
                key={actividad.actividad_id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  boxShadow: 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardActionArea onClick={() => handleItemClick(actividad)} sx={{ p: 2.5 }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    {/* Cabecera de la publicación */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          src={actividad.usuario_avatar || undefined}
                          alt={nombreUsuario}
                          sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}
                        >
                          {!actividad.usuario_avatar && inicial}
                        </Avatar>

                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.2}>
                            {nombreUsuario}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(actividad.fecha).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      {renderBadgeTipo(actividad.tipo)}
                    </Box>

                    {/* Contenido */}
                    <Typography variant="h6" component="h3" fontSize="1.05rem" fontWeight={600} gutterBottom color="text.primary">
                      {actividad.titulo}
                    </Typography>

                    {actividad.descripcion && (
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {actividad.descripcion}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Botón Cargar más */}
      {hayMasPaginas && (
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCargarMas}
            disabled={cargandoMas}
            startIcon={cargandoMas ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ px: 4, py: 1, borderRadius: 2 }}
          >
            {cargandoMas ? 'Cargando más...' : 'Cargar más actividades'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FeedMuro;