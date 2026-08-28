import {
  Box,
  Typography,
  Button
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useRef } from "react";
import AppHeader from "../components/AppHeader";
import BookCard from "../components/BookCard";
import FeaturedBookSection from "../components/FeaturedBookSection";
import FilterChips from "../components/FilterChips";
import SearchBar from "../components/SearchBar";
import SideMenu from "../components/SideMenu";
import WelcomeModal from "../components/WelcomeModal";

// Importaciones de Servicios
import { buscarLibros, getCatalogoLibros } from "../services/apiService";
import { normalizarTexto } from "../utils/normalize";

// Importaciones de Lógica (Custom Hooks)
import { useAuth } from "../hooks/useAuth";
import { useBookData } from "../hooks/useBookData"; // NUEVO: Lógica de carga de libros
import { useFavorites } from "../hooks/useFavorites"; // Lógica de manejo de favoritos


export default function Home() {
  // --- Estados de UI ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentQuery, setCurrentQuery] = useState('');
  const searchBarRef = useRef();
  const location = useLocation();
  const { user } = useAuth();

  // --- LÓGICA DE DATOS: Llamada a Custom Hooks ---
  // 1. Hook para cargar los datos y manejar sus estados
  const { books, setBooks, featuredBook, setFeaturedBook } = useBookData();

  // 2. Hook para manejar la interacción de favoritos
  const { favoriteBooks, toggleFavorite, isBookFavorite } = useFavorites();

  // Handler para toggle de favoritos
  const handleFavoriteToggle = async (libro_id) => {
    const isFavorite = isBookFavorite(libro_id);
    await toggleFavorite(libro_id, isFavorite);
  };
  // -----------------------------------------------

  // --- Lógica de Modal de Bienvenida  ---
  useEffect(() => {
    if (location.state?.fromLogin && user) {
      setWelcomeModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);

  const handleCloseWelcomeModal = () => setWelcomeModalOpen(false);


  const handleSearch = async (query) => {
    setCurrentQuery(query);
    try {
      const queryNormalizada = normalizarTexto(query);
      // Combina los filtros actuales y la búsqueda
      const filtrosCombinados = { ...currentFilters };
      if (queryNormalizada) filtrosCombinados.query = queryNormalizada;
      const resultados = await buscarLibros(filtrosCombinados);
      setBooks(Array.isArray(resultados) ? resultados : []);
    } catch {
      setBooks([]);
    }
  };

  const handleFilterChange = async (_resultados, filtros) => {
    setCurrentFilters(filtros);
    try {
      // Combina los filtros nuevos y la búsqueda actual
      const filtrosCombinados = { ...filtros };
      if (currentQuery) filtrosCombinados.query = normalizarTexto(currentQuery);
      const resultadosActualizados = await buscarLibros(filtrosCombinados);
      setBooks(Array.isArray(resultadosActualizados) ? resultadosActualizados : []);
    } catch {
      setBooks([]);
    }
  };

  // NUEVO: Handler para volver al estado inicial (sin búsqueda ni filtros)
  const handleBackToHome = async () => {
    setCurrentQuery('');
    setCurrentFilters({});
    if (searchBarRef.current && typeof searchBarRef.current.clear === 'function') {
      searchBarRef.current.clear();
    }
    try {
      // Trae el listado completo de libros, sin filtros aplicados
      const resultados = await buscarLibros({});
      setBooks(Array.isArray(resultados) ? resultados : []);
    } catch {
      setBooks([]);
    }
  };

  // Asegurar que books sea siempre un array seguro
  const safeBooks = Array.isArray(books) ? books : [];
  const featuredTarget = safeBooks.find((book) => book.titulo === "La gran ocasión");

  // --- RENDERIZADO ---
  return (
    <Box
      py={2}
      px={1}
      sx={{
        width: '90%',
        maxWidth: 1000,
        margin: "0 auto"
      }}
    >
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title={`Hola, ${user?.nombre || 'Usuario'}`}
        subtitle={new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Inicio" />
      <WelcomeModal open={isWelcomeModalOpen} onClose={handleCloseWelcomeModal} user={user} />

      <Box mb={2}>
        <SearchBar ref={searchBarRef} onSearch={handleSearch} />
      </Box>

      {/* Chips de filtros - Siempre visibles */}
      <FilterChips
        onFilterChange={handleFilterChange}
        onClearSearch={() => {
          setCurrentQuery('');
          if (searchBarRef.current && typeof searchBarRef.current.clear === 'function') {
            searchBarRef.current.clear();
          }
        }}
      />

      {/* Recomendado semanal - Solo mostrar si no hay filtros aplicados */}
      {Object.keys(currentFilters).length === 0 && !currentQuery && (
        <FeaturedBookSection
          featuredBook={featuredTarget || {}}
          handleFavoriteToggle={handleFavoriteToggle}
          isFavorite={featuredTarget ? isBookFavorite(featuredTarget.libro_id) : false}
        />
      )}

      {/* Título para la lista de libros cuando no hay filtros */}
      {Object.keys(currentFilters).length === 0 && !currentQuery && (
        <Box mt={3} mb={3}>
          <Typography variant="h4" fontWeight="bold" color="secondary">
            Listado de libros
          </Typography>
        </Box>
      )}

      {/* Resultados de búsqueda/filtros - Mostrar si hay búsqueda o filtros aplicados */}
      {(currentQuery || Object.keys(currentFilters).length > 0) && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={1}>
            <Typography variant="h4" fontWeight="bold" color="secondary">
              {currentQuery ? 'Resultados de búsqueda' : 'Libros filtrados'}
            </Typography>
            {/* NUEVO: Botón para volver al estado inicial de Home */}
            <Button variant="outlined" color="secondary" onClick={handleBackToHome}>
              Volver a Inicio
            </Button>
          </Box>
        </>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {/* Mostrar mensaje si no hay libros */}
        {safeBooks.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            El libro que usted está buscando no se encuentra disponible
          </Typography>
        ) : (
          /* Mapear la lista de libros */
          safeBooks.map((book) => (
            <BookCard
              key={book.libro_id}
              image={book.portada_url}
              autor={book.autor}
              gender={book.genero}
              title={book.titulo}
              rating={book.calificacion_promedio}
              progress={book.progress}
              isFavorite={isBookFavorite(book.libro_id)}
              libro_id={book.libro_id}
              onFavoriteToggle={() => handleFavoriteToggle(book.libro_id)}
            />
          ))
        )}

      </Box>
    </Box>
  );
}