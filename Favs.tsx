import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { Book } from "./types.js";
import useFavorites from "./hooks/useFavorites.js";

import LibroImage from './assets/libro.jpg';
import AppHeader from "./components/AppHeader.jsx";
import BookCard from "./components/BookCard.jsx";
import SideMenu from "./components/SideMenu.jsx";


export default function Favs() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 2. Le indicamos ": any" al hook para que no tire error al desestructurar propiedades de un archivo JS
  const { favoriteBooks = [], loading, error, toggleFavorite }: any = useFavorites();

  // Para determinar si un libro es favorito (Tipamos el parámetro y la función .some)
  const isBookFavorite = (libro_id: number | string): boolean => 
    favoriteBooks.some((book: Book) => book.libro_id === libro_id);

  // Handler para toggle (Corregida la F mayúscula de toggleFavorite en la llamada interna)
  const handleFavoriteToggle = async (libro_id: number | string) => {
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
          Error al cargar favoritos: {error.message || error}
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
        {/* Mapear la lista de libros favoritos - Ya tipado con (book: Book) */}
        {favoriteBooks.map((book: Book) => (
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
