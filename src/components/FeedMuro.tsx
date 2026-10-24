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
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import {
  Radio as RadioIcon,
  Forum as ForumIcon,
  MenuBook as BookIcon,
  Star as StarIcon,
  PushPin as PinIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../environments/api';
import { useAuth } from '@/hooks/useAuth';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';

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

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
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

  // Vacía el muro en el back (solo administrador).
  // Si falla, lanza el mensaje de error que devuelve la API para mostrarlo en pantalla.
  async limpiarFeed(): Promise<void> {
    const token = localStorage.getItem('token');

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/feed`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      throw new Error('No pudimos conectar con el servidor. Inténtalo en un momento.');
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      // El back responde { error }, salvo los 401 del middleware, que responden { message }
      throw new Error(
        data?.error ?? data?.message ?? `No se pudo limpiar el muro (${response.status}).`
      );
    }
  },
};

const PAGE_LIMIT = 10;

export const FeedMuro: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [actividades, setActividades] = useState<ActividadFeed[]>([]);
  const [pagina, setPagina] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [cargandoInicial, setCargandoInicial] = useState<boolean>(true);
  const [cargandoMas, setCargandoMas] = useState<boolean>(false);
  const [limpiando, setLimpiando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  // Vacía el muro después de confirmar en el modal (solo administrador).
  // La lista se borra en pantalla recién cuando el back confirma el borrado.
  const handleConfirmClear = async () => {
    setIsClearConfirmOpen(false);
    setLimpiando(true);

    try {
      await feedService.limpiarFeed();
      setActividades([]);
      setTotal(0);
      setNotification({
        open: true,
        message: 'Se limpió el muro de actividades.',
        severity: 'success',
      });
    } catch (err) {
      // Si el back rechaza el borrado, las publicaciones siguen en pantalla
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : 'No se pudo limpiar el muro.',
        severity: 'error',
      });
    } finally {
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

  // Solo el administrador puede vaciar el muro (el back también lo valida)
  const canClearFeed = !authLoading && isAdmin && actividades.length > 0;

  // Subtítulo del encabezado: cantidad de publicaciones, armado en un solo texto
  const headerSubtitle = cargandoInicial
    ? 'Cargando publicaciones...'
    : `${total} ${total === 1 ? 'publicación' : 'publicaciones'}`;

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <AppHeader
        onMenuClick={() => setIsMenuOpen(true)}
        title="Muro de Actividades"
        subtitle={headerSubtitle}
      />
      <SideMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} active="Muro" />

      {cargandoInicial ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8} gap={2}>
          <CircularProgress color="primary" size={32} />
          <Typography color="text.secondary">Cargando muro de actividades...</Typography>
        </Box>
      ) : (
        <>
          {/* Acción del administrador: vaciar el muro */}
          {canClearFeed && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Tooltip title="Limpiar muro">
                <span>
                  <IconButton
                    onClick={() => setIsClearConfirmOpen(true)}
                    color="error"
                    disabled={limpiando}
                    size="small"
                    aria-label="Limpiar muro"
                  >
                    {limpiando ? <CircularProgress size={20} color="inherit" /> : <DeleteSweepIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}

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
        </>
      )}

      {/* Confirmación antes de vaciar el muro */}
      <ConfirmationModal
        open={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleConfirmClear}
        title="Limpiar el muro"
        message="¿Querés borrar todas las publicaciones del muro? Se borran para toda la escuela y no se puede deshacer."
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedMuro;