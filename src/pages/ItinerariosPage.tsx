import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import BookCard from '@/components/ui/BookCard';
import { itinerarioService, Itinerario } from '@/services/itinerarioService';

export default function ItinerariosPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [selectedItinerario, setSelectedItinerario] = useState<Itinerario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    itinerarioService
      .obtenerItinerarios(controller.signal)
      .then((data) => {
        setItinerarios(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'No se pudieron cargar los itinerarios APL.');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fbf9f6', pb: 6 }}>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="Itinerarios APL"
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {selectedItinerario ? (
          // Vista Detalle del Itinerario seleccionado
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setSelectedItinerario(null)}
              sx={{ mb: 3, color: '#4b2c15', fontWeight: 600 }}
            >
              Volver a colecciones
            </Button>

            <Box
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                bgcolor: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                borderLeft: '6px solid #ff8a00',
              }}
            >
              <Chip
                icon={<CollectionsBookmarkIcon />}
                label="Itinerario Pedagógico APL"
                size="small"
                sx={{ bgcolor: '#ffe8cc', color: '#b25900', mb: 1, fontWeight: 600 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4b2c15', mb: 1 }}>
                {selectedItinerario.nombre}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6d5a4d', maxWidth: 800 }}>
                {selectedItinerario.descripcion || 'Sin descripción disponible.'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#a08e82', mt: 1, display: 'block' }}>
                Total de lecturas sugeridas: {selectedItinerario.libros.length}
              </Typography>
            </Box>

            {selectedItinerario.libros.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Este itinerario aún no tiene libros asignados.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {selectedItinerario.libros.map((libro) => (
                  <Grid item xs={12} sm={6} md={4} key={libro.libro_id}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <BookCard
                        id={libro.libro_id}
                        title={libro.titulo}
                        autor={libro.autor}
                        image={libro.portada_url}
                        gender={libro.genero}
                        description={libro.descripcion}
                        rating={libro.calificacion_promedio}
                      />
                      {libro.explicacion && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#f4ede6',
                            border: '1px dashed #d1c1b3',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#7a4b27', display: 'block' }}>
                            Eje / Enfoque pedagógico:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4b2c15', fontSize: '0.85rem' }}>
                            {libro.explicacion}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
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
                  color: '#4b2c15',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  mb: 1,
                }}
              >
                Itinerarios de Lectura APL
              </Typography>
              <Typography variant="body1" sx={{ color: '#7a6759', maxWidth: 650, mx: 'auto' }}>
                Explora el catálogo a través de colecciones transversales y recorridos
                literarios sugeridos por el equipo docente de la Escuela Sábato.
              </Typography>
            </Box>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#ff8a00' }} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && itinerarios.length === 0 && (
              <Box
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: '#fff',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <MenuBookIcon sx={{ fontSize: 60, color: '#d0c2b5', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6d5a4d', fontWeight: 600 }}>
                  Aún no hay itinerarios publicados
                </Typography>
                <Typography variant="body2" sx={{ color: '#9f8d80', mt: 0.5 }}>
                  Los docentes y administradores cargarán nuevos recorridos literarios a la brevedad.
                </Typography>
              </Box>
            )}

            {!loading && !error && itinerarios.length > 0 && (
              <Grid container spacing={3}>
                {itinerarios.map((itinerario) => (
                  <Grid item xs={12} sm={6} md={4} key={itinerario.lista_id}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => setSelectedItinerario(itinerario)}
                        sx={{ height: '100%', p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                      >
                        <Chip
                          icon={<CollectionsBookmarkIcon />}
                          label={`${itinerario.libros?.length || 0} libros`}
                          size="small"
                          sx={{ mb: 2, bgcolor: '#ffe8cc', color: '#b25900', fontWeight: 600 }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: '#4b2c15', mb: 1, minHeight: 56 }}
                        >
                          {itinerario.nombre}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#7a6759',
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
                        <Typography variant="caption" sx={{ color: '#ff8a00', fontWeight: 700 }}>
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
