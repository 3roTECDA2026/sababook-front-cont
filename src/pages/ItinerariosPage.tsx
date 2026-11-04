// src/pages/ItinerariosPage.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import BookCard from '@/components/ui/BookCard';
import { useItineraries } from '@/hooks/useItineraries';
import { Itinerary } from '@/services/itineraryService';

export default function ItinerariosPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItinerario, setSelectedItinerario] = useState<Itinerary | null>(null);
  const { itineraries, loading, error } = useItineraries();

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
            <Box sx={{ mb: 4, textAlign: 'center' }}>
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
              <Typography variant="body1" sx={{ color: 'body.main', maxWidth: 650, mx: 'auto' }}>
                Explora el catálogo a través de colecciones transversales y recorridos
                literarios sugeridos por el equipo docente de la Escuela Sábato.
              </Typography>
            </Box>

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
                          height: '100%',
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
                            mb: 2,
                            flexGrow: 1,
                          }}
                        >
                          {itinerario.descripcion || 'Colección temática de lectura para la APL.'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'button.main', fontWeight: 700 }}
                        >
                          Ver recorrido →
                        </Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
