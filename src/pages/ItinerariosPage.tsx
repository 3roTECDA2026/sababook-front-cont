// src/pages/ItinerariosPage.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import BookCard from '@/components/ui/BookCard';
import CreateItineraryDialog from '@/components/forms/CreateItineraryDialog';
import { useItineraries } from '@/hooks/useItineraries';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Itinerary } from '@/services/itineraryService';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function ItinerariosPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedItinerario, setSelectedItinerario] = useState<Itinerary | null>(null);
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { itineraries, loading, error, createItinerary, deleteItinerary } = useItineraries();
  const { user, isTeacher, isAdmin } = useAuth();
  const { isBookFavorite, toggleFavorite } = useFavorites();
  const canManage = isTeacher || isAdmin;

  const canDelete = (itinerario: Itinerary) => {
    if (isAdmin) return true;
    if (isTeacher && itinerario.creador_id && user?.usuario_id === itinerario.creador_id) {
      return true;
    }
    return false;
  };

  const handleDeleteConfirm = async () => {
    if (!itineraryToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteItinerary(itineraryToDelete.lista_id);
      if (selectedItinerario?.lista_id === itineraryToDelete.lista_id) {
        setSelectedItinerario(null);
      }
      setItineraryToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'No se pudo eliminar el itinerario.';
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        onBack={selectedItinerario ? () => setSelectedItinerario(null) : undefined}
      />
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="Itinerarios APL"
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {selectedItinerario ? (
          // Vista Detalle del Itinerario seleccionado
          <Box>
            <Box
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: 2,
                borderLeft: (theme) => `6px solid ${theme.palette.button.main}`,
              }}
            >
              <Chip
                icon={<CollectionsBookmarkIcon />}
                label="Itinerario Pedagógico APL"
                size="small"
                sx={{
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                  mb: 1,
                  fontWeight: 600,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {selectedItinerario.nombre}
              </Typography>
              <Typography variant="body1" sx={{ color: 'body.main', maxWidth: 800 }}>
                {selectedItinerario.descripcion || 'Sin descripción disponible.'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                {`Total de lecturas sugeridas: ${selectedItinerario.libros.length}`}
              </Typography>
            </Box>

            {selectedItinerario.libros.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Este itinerario aún no tiene libros asignados.
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'space-between' },
                  gap: 3,
                }}
              >
                {selectedItinerario.libros.map((libro) => (
                  <Box
                    key={libro.libro_id}
                    sx={{
                      width: { xs: '100%', md: '48%' },
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ width: '100%', '& > .MuiCard-root': { width: '100%', minWidth: '100%' } }}>
                      <BookCard
                        libro_id={libro.libro_id}
                        title={libro.titulo}
                        autor={libro.autor}
                        image={libro.portada_url}
                        gender={libro.genero}
                        description={libro.descripcion}
                        rating={libro.calificacion_promedio}
                        isFavorite={isBookFavorite(libro.libro_id)}
                        onFavoriteToggle={() =>
                          toggleFavorite(
                            libro.libro_id,
                            isBookFavorite(libro.libro_id),
                          )
                        }
                      />
                    </Box>
                    {libro.explicacion && (
                      <Box
                        sx={{
                          mt: -1,
                          mb: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          border: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}
                        >
                          Eje / Enfoque pedagógico:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'body.main', fontSize: '0.85rem' }}>
                          {libro.explicacion}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          // Vista Principal: Listado de Colecciones e Itinerarios
          <Box>
            <Box
              sx={{
                mb: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    mb: 1,
                  }}
                >
                  Itinerarios de Lectura APL
                </Typography>
                <Typography variant="body1" sx={{ color: 'body.main', maxWidth: 650 }}>
                  Explorá el catálogo a través de colecciones transversales y recorridos
                  literarios sugeridos por el equipo docente de la Escuela Sábato.
                </Typography>
              </Box>

              {canManage && (
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setCreateOpen(true)}
                  sx={{ flexShrink: 0 }}
                >
                  Crear Itinerario
                </Button>
              )}
            </Box>

            {deleteError && (
              <Alert severity="error" onClose={() => setDeleteError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                {deleteError}
              </Alert>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && itineraries.length === 0 && (
              <Box
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: 1,
                }}
              >
                <MenuBookIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Aún no hay itinerarios publicados
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Los docentes y administradores cargarán nuevos recorridos literarios a la brevedad.
                </Typography>
              </Box>
            )}

            {!loading && !error && itineraries.length > 0 && (
              <Grid container spacing={3}>
                {itineraries.map((itinerario) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={itinerario.lista_id}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => setSelectedItinerario(itinerario)}
                        sx={{
                          flexGrow: 1,
                          p: 2.5,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Chip
                          icon={<CollectionsBookmarkIcon />}
                          label={`${itinerario.libros?.length || 0} libros`}
                          size="small"
                          sx={{
                            mb: 2,
                            bgcolor: 'action.hover',
                            color: 'primary.main',
                            fontWeight: 600,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: 'primary.main', mb: 1, minHeight: 56 }}
                        >
                          {itinerario.nombre}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'body.main',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {itinerario.descripcion || 'Colección temática de lectura para la APL.'}
                        </Typography>
                      </CardActionArea>
                      <CardActions
                        sx={{
                          px: 2.5,
                          pb: 2,
                          pt: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 'auto',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'button.main', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setSelectedItinerario(itinerario)}
                        >
                          Ver recorrido →
                        </Typography>
                        {canDelete(itinerario) && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setItineraryToDelete(itinerario)}
                            sx={{ py: 0.2, px: 1, minWidth: 0, fontSize: '0.75rem' }}
                          >
                            Eliminar
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>

      {/* Diálogo para crear itinerario (Solo Docentes y Administradores) */}
      <CreateItineraryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createItinerary}
      />

      {/* Modal de confirmación para eliminar itinerario */}
      <ConfirmationModal
        open={!!itineraryToDelete}
        onClose={() => setItineraryToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Itinerario APL"
        message={`¿Estás seguro de que deseas eliminar el itinerario "${itineraryToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        loading={deleting}
      />
    </Box>
  );
}
