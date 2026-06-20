import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useFavorites } from "../hooks/useFavorites";

import LibroImage from '../assets/libro.jpg';
import AppHeader from "../components/AppHeader";
import BookCard from "../components/BookCard";
import SideMenu from "../components/SideMenu";

export default function Favs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { favoriteBooks, loading, error, toggleFavorite } = useFavorites();

  // Para determinar si un libro es favorito
  const isBookFavorite = (libro_id) => favoriteBooks.some(book => book.libro_id === libro_id);

  // Handler para toggle
  const handleFavoriteToggle = async (libro_id) => {
    const currentlyFavorite = isBookFavorite(libro_id);
    await toggleFavorite(libro_id, currentlyFavorite);
  };

  if (loading) {
    return (
      <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: "0 auto" }}>
        <Typography variant="h6" color="text.secondary" textAlign="center" mt={5}>
          Cargando favoritos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: "0 auto" }}>
        <Typography variant="h6" color="error" textAlign="center" mt={5}>
          Error al cargar favoritos: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: "0 auto" }}>
      <AppHeader 
        onMenuClick={() => setMenuOpen(true)}
        title="Mis Favoritos" 
        subtitle={`Tienes ${favoriteBooks.length} libros favoritos`} 
      />

      {/* Drawer lateral */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Favoritos" /> 

      {/* Favs */}
      <Typography variant="h5" fontWeight="bold" color="secondary" mb={2}>
        Tu Colección Favorita
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {/* Mapear la lista de libros favoritos */}
        {favoriteBooks.map((book) => (
          <BookCard
            key={book.libro_id}
            image={book.portada_url || LibroImage}
            title={book.titulo}
            autor={book.autor}
            gender={book.genero}
            rating={book.calificacion_promedio}
            isFavorite={isBookFavorite(book.libro_id)}
            onFavoriteToggle={() => handleFavoriteToggle(book.libro_id)}
            libro_id={book.libro_id}
          />
        ))}

        {/* Mensaje si no hay favoritos */}
        {favoriteBooks.length === 0 && (
          <Typography variant="subtitle1" color="text.secondary" mt={3}>
            Aún no tienes libros marcados como favoritos.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
