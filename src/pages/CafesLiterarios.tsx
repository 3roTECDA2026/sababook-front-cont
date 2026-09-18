// src/pages/CafesLiterarios.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Stack,
  Divider,
} from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ForumIcon from '@mui/icons-material/Forum';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import SideMenu from '../components/SideMenu';
import AsistenciaToggle from '../components/AsistenciaToggle';
import theme from '../theme/theme';
import { useAuth } from '../hooks/useAuth';
import type { CafeLiterario, Book, NuevoCafe } from '../types';

import {
  getCafesLiterarios,
  crearCafeLiterario,
  toggleAsistenciaCafe,
  votarCafeLiterario,
  getCatalogoLibros,
} from '../services/apiService';

export default function CafesLiterarios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [cafes, setCafes] = useState<CafeLiterario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para modal de nuevo Café (para Docentes/Admins)
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [libros, setLibros] = useState<Book[]>([]);
  const [nuevoCafe, setNuevoCafe] = useState<NuevoCafe>({
    titulo: '',
    descripcion: '',
    libro_id: '',
    fecha_evento: '',
    lugar: 'Biblioteca Ernesto Sábato',
  });
  const [creando, setCreando] = useState<boolean>(false);

  // Estado para marcar cuál Café está procesando el toggle de asistencia
  const [cargandoAsistencia, setCargandoAsistencia] = useState<number | null>(null);

  // Cargar lista de cafés literarios
  const cargarCafes = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await getCafesLiterarios(user?.usuario_id ?? null, signal);
      setCafes(data);
      setError(null);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      console.error('Error al cargar Cafés Literarios:', err);
      setError('No se pudieron cargar los Cafés Literarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    cargarCafes(controller.signal);
    return () => controller.abort();
  }, [user?.usuario_id]);

  // Cargar catálogo de libros para el selector de creación
  const handleOpenModal = async () => {
    setOpenModal(true);
    if (libros.length === 0) {
      try {
        const cat = await getCatalogoLibros();
        setLibros(cat);
      } catch (err) {
        console.error('Error al cargar libros para el selector:', err);
      }
    }
  };

  // Manejar creación de un nuevo Café
  const handleCrearCafe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCafe.titulo || !nuevoCafe.fecha_evento || !nuevoCafe.libro_id) {
      alert('Por favor completa el título, fecha y libro propuesto.');
      return;
    }

    try {
      setCreando(true);
      await crearCafeLiterario({
        ...nuevoCafe,
        libro_id: Number(nuevoCafe.libro_id),
        docente_id: user?.usuario_id as number,
      });
      setOpenModal(false);
      setNuevoCafe({
        titulo: '',
        descripcion: '',
        libro_id: '',
        fecha_evento: '',
        lugar: 'Biblioteca Ernesto Sábato',
      });
      cargarCafes();
    } catch (err) {
      console.error('Error al crear Café Literario:', err);
      alert('Error al crear el Café Literario');
    } finally {
      setCreando(false);
    }
  };

  // Confirmar o cancelar (Toggle) asistencia con lógica optimista
  const handleAsistencia = async (cafeId: number, confirmar: boolean) => {
    if (!user?.usuario_id) {
      alert('Debes iniciar sesión para confirmar tu asistencia.');
      return;
    }

    setCargandoAsistencia(cafeId);

    // Actualización optimista del estado local
    setCafes((prevCafes) =>
      prevCafes.map((c) => {
        if (c.cafe_id === cafeId) {
          return {
            ...c,
            asistencia_usuario: confirmar ? 'confirmado' : null,
            total_asistentes: confirmar
              ? Number(c.total_asistentes) + 1
              : Math.max(0, Number(c.total_asistentes) - 1),
          };
        }
        return c;
      })
    );

    try {
      await toggleAsistenciaCafe(cafeId, user.usuario_id, 'confirmado');
    } catch (err) {
      console.error('Error al registrar asistencia:', err);
      cargarCafes();
    } finally {
      setCargandoAsistencia(null);
    }
  };

  // Votar "Me gustó" o "No me gustó"
  const handleVoto = async (cafeId: number, votoPositivo: boolean) => {
    if (!user?.usuario_id) {
      alert('Debes iniciar sesión para votar.');
      return;
    }

    try {
      await votarCafeLiterario(cafeId, user.usuario_id, votoPositivo);
      cargarCafes();
    } catch (err) {
      console.error('Error al registrar voto:', err);
    }
  };

  // Es docente o admin? (rol_id 2 o 3)
  const esDocenteOAdmin =
    user?.rol_id === 2 ||
    user?.rol_id === 3 ||
    user?.rol === 'docente' ||
    user?.rol === 'administrador';

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title="Cafés Literarios"
        subtitle="Encuentros de lectura, debates y valoraciones comunitarias."
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Café Literario" />

      {/* Encabezado y botón de crear */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="text.primary"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <LocalCafeIcon sx={{ color: theme.palette.button.main }} /> Próximos Cafés Literarios
        </Typography>

        {esDocenteOAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              bgcolor: theme.palette.button.main,
              color: '#fff',
              '&:hover': { bgcolor: '#cc4800' },
              borderRadius: 2,
            }}
          >
            Nuevo Café
          </Button>
        )}
      </Box>

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Typography color="error" textAlign="center" my={3}>
          {error}
        </Typography>
      )}

      {/* Lista vacía */}
      {!loading && !error && cafes.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
          <LocalCafeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No hay Cafés Literarios programados por el momento.
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            ¡Pronto los docentes publicarán el próximo libro a debatir!
          </Typography>
        </Card>
      )}

      {/* Renderizado de Cafés Literarios */}
      <Stack spacing={3}>
        {!loading &&
          cafes.map((cafe) => {
            const totalVotos = Number(cafe.total_votos || 0);
            const votosPos = Number(cafe.votos_positivos || 0);
            const porcentajePositivo = totalVotos > 0 ? Math.round((votosPos / totalVotos) * 100) : 0;
            const fechaFormateada = cafe.fecha_evento
              ? new Date(cafe.fecha_evento).toLocaleString('es-AR', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })
              : 'Fecha a confirmar';

            return (
              <Card
                key={cafe.cafe_id}
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  border: '1px solid #eaeaea',
                }}
              >
                {/* Cabecera del Café */}
                <Box
                  sx={{
                    bgcolor: theme.palette.button.main,
                    color: '#fff',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {cafe.titulo}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EventIcon fontSize="inherit" /> {fechaFormateada} | <LocationOnIcon fontSize="inherit" />{' '}
                      {cafe.lugar}
                    </Typography>
                  </Box>

                  <Chip
                    label={cafe.estado === 'programado' ? 'Próximo Encuentro' : 'Finalizado'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Descripción del evento */}
                  {cafe.descripcion && (
                    <Typography variant="body2" color="text.secondary" mb={2.5}>
                      {cafe.descripcion}
                    </Typography>
                  )}

                  {/* Ficha del Libro Propuesto por el Docente */}
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.primary"
                    mb={1}
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                  >
                    📖 Libro propuesto para la lectura:
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      bgcolor: '#f8f9fa',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #eee',
                      gap: 2,
                      alignItems: 'center',
                      mb: 3,
                    }}
                  >
                    {cafe.libro_portada ? (
                      <CardMedia
                        component="img"
                        image={cafe.libro_portada}
                        alt={cafe.libro_titulo ?? 'Portada del libro'}
                        sx={{ width: 70, height: 100, borderRadius: 1.5, objectFit: 'cover' }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 70, height: 100, bgcolor: '#e0e0e0', color: '#666' }}>
                        📖
                      </Avatar>
                    )}

                    <Box flexGrow={1}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {cafe.libro_titulo || 'Título no especificado'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        Autor: <strong>{cafe.libro_autor || 'Desconocido'}</strong>
                      </Typography>
                      {cafe.docente_nombre && (
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                          <PersonIcon fontSize="inherit" /> Organizado por: Prof. {cafe.docente_nombre}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Acciones: Asistencia, Votación Post-Lectura y Foro */}
                  <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between" alignItems="center">
                    {/* Toggle de Asistencia (RSVP) */}
                    <AsistenciaToggle
                      asistencia={cafe.asistencia_usuario}
                      totalAsistentes={cafe.total_asistentes}
                      cargando={cargandoAsistencia === cafe.cafe_id}
                      onToggle={(confirmar) => handleAsistencia(cafe.cafe_id, confirmar)}
                    />

                    {/* Botón de acceso al Foro de Debate */}
                    {cafe.foro_id && (
                      <Button
                        variant="outlined"
                        startIcon={<ForumIcon />}
                        onClick={() => navigate(`/foro/detalle/${cafe.foro_id}`)}
                        sx={{
                          borderColor: theme.palette.button.main,
                          color: theme.palette.button.main,
                          borderRadius: 2,
                          textTransform: 'none',
                        }}
                      >
                        Foro de Debate
                      </Button>
                    )}
                  </Box>

                  {/* Sección de Votación Post-Lectura ("¿Te gustó el libro?") */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#fff9f5', borderRadius: 2, border: '1px solid #ffe8d6' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary" mb={1}>
                      🗣️ Votación de Lectura: ¿Te gustó la propuesta de este libro?
                    </Typography>

                    <Box display="flex" alignItems="center" gap={2} my={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleVoto(cafe.cafe_id, true)}
                        sx={{ textTransform: 'none' }}
                      >
                        Me gustó ({cafe.votos_positivos || 0})
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => handleVoto(cafe.cafe_id, false)}
                        sx={{ textTransform: 'none' }}
                      >
                        No me gustó ({cafe.votos_negativos || 0})
                      </Button>
                    </Box>

                    {totalVotos > 0 && (
                      <Box mt={1.5}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary">
                            Aceptación del libro
                          </Typography>
                          <Typography variant="caption" fontWeight="bold" color="success.main">
                            {porcentajePositivo}% Positivo ({totalVotos} votos en total)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={porcentajePositivo}
                          color="success"
                          sx={{ height: 8, borderRadius: 4, bgcolor: '#ffe0d0' }}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
      </Stack>

      {/* Modal de Creación de nuevo Café (solo Docentes/Admins) */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Crear Nuevo Café Literario</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Título del Encuentro"
              fullWidth
              value={nuevoCafe.titulo}
              onChange={(e) => setNuevoCafe({ ...nuevoCafe, titulo: e.target.value })}
              placeholder="Ej: Café Literario de Primavera"
            />

            <TextField
              label="Libro Propuesto para la lectura"
              select
              fullWidth
              value={nuevoCafe.libro_id}
              onChange={(e) => setNuevoCafe({ ...nuevoCafe, libro_id: e.target.value })}
            >
              {libros.map((l) => (
                <MenuItem key={l.libro_id} value={l.libro_id}>
                  {l.titulo} ({l.autor})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha y Hora del Evento"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={nuevoCafe.fecha_evento}
              onChange={(e) => setNuevoCafe({ ...nuevoCafe, fecha_evento: e.target.value })}
            />

            <TextField
              label="Lugar o Modalidad"
              fullWidth
              value={nuevoCafe.lugar}
              onChange={(e) => setNuevoCafe({ ...nuevoCafe, lugar: e.target.value })}
              placeholder="Ej: Biblioteca Ernesto Sábato o Aula Magna"
            />

            <TextField
              label="Descripción o consignas de lectura"
              multiline
              rows={3}
              fullWidth
              value={nuevoCafe.descripcion}
              onChange={(e) => setNuevoCafe({ ...nuevoCafe, descripcion: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleCrearCafe}
            variant="contained"
            disabled={creando}
            sx={{ bgcolor: theme.palette.button.main, color: '#fff' }}
          >
            {creando ? 'Publicando...' : 'Publicar Café Literario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}