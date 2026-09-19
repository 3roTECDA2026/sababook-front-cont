// src/pages/Favs.tsx
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { useFavorites } from '../hooks/useFavorites';

import LibroImage from '../assets/libro.jpg';
import AppHeader from '../components/AppHeader';
import BookCard from '../components/BookCard';
import SideMenu from '../components/SideMenu';
import { useReadingStatus, type ReadingStatus } from '../hooks/useReadingStatus';

export default function Favs() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus>('general');
  const { favoriteBooks, loading, error, toggleFavorite } = useFavorites();
  const { getReadingStatus, setReadingStatus } = useReadingStatus();

  // Para determinar si un libro es favorito (basado en la lista obtenida)
  const isBookFavorite = (libro_id: number) =>
    favoriteBooks.some((book) => book.libro_id === libro_id);

  // Handler para toggle
  const handleFavoriteToggle = async (libro_id: number) => {
    const currentlyFavorite = isBookFavorite(libro_id);
    await toggleFavorite(libro_id, currentlyFavorite);
  };

  const visibleBooks = favoriteBooks.filter(
    (book) => selectedStatus === 'general' || getReadingStatus(book.libro_id) === selectedStatus
  );

  if (loading) {
    return (
      <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
        <Typography variant="h6" color="text.secondary" textAlign="center" mt={5}>
          Cargando favoritos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
        <Typography variant="h6" color="error" textAlign="center" mt={5}>
          Error al cargar favoritos: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      py={2}
      px={1}
      sx={{
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title="Mi Biblioteca"
        subtitle={`Tienes ${favoriteBooks.length} libros favoritos`}
      />

      {/* Drawer lateral */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Favoritos" />

      <Tabs
        value={selectedStatus}
        onChange={(_, value: ReadingStatus) => setSelectedStatus(value)}
        variant="fullWidth"
        sx={{ mb: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: 3 }}
      >
        <Tab value="general" label="Favoritos (General)" />
        <Tab value="quiero-leer" label="Quiero leer" />
        <Tab value="leyendo" label="Leyendo" />
        <Tab value="leido" label="Leídos" />
      </Tabs>

      <Typography variant="h5" fontWeight="bold" color="secondary" mb={2}>
        {selectedStatus === 'general' ? 'Mis libros favoritos' : `Libros ${selectedStatus.replace('-', ' ')}`}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {/* Mapear la lista de libros favoritos y pasar las nuevas props */}
        {visibleBooks.map((book) => (
          <BookCard
            key={book.libro_id}
            image={book.portada_url || LibroImage}
            title={book.titulo}
            autor={book.autor}
            gender={book.genero}
            rating={book.calificacion_promedio}
            isFavorite={isBookFavorite(book.libro_id)} // Determina si está en favoritos
            onFavoriteToggle={() => handleFavoriteToggle(book.libro_id)} // Maneja el toggle
            libro_id={book.libro_id}
            readingStatus={getReadingStatus(book.libro_id)}
            onReadingStatusChange={(status) => setReadingStatus(book.libro_id, status)}
            showReadingStatusControl
            includeGeneralStatus
          />
        ))}

        {/* Mensaje si no hay favoritos */}
        {visibleBooks.length === 0 && (
          <Typography variant="subtitle1" color="text.secondary" mt={3}>
            Aún no tienes libros marcados como favoritos.
          </Typography>
        )}
      </Box>
    </Box>
  );
}