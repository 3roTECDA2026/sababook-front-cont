// src/pages/Home.tsx
import { Box, Typography } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import BookCard from '../components/BookCard';
import FeaturedBookSection from '../components/FeaturedBookSection';
import FilterChips from '../components/FilterChips';
import SearchBar from '../components/SearchBar';
import type { SearchBarHandle } from '../components/SearchBar';
import SideMenu from '../components/SideMenu';
import WelcomeModal from '../components/WelcomeModal';

// Importaciones de Servicios
import { buscarLibros } from '../services/apiService';
import { normalizarTexto } from '../utils/normalize';

// Importaciones de Lógica (Custom Hooks)
import { useAuth } from '../hooks/useAuth';
import { useBookData } from '../hooks/useBookData'; // NUEVO: Lógica de carga de libros
import { useFavorites } from '../hooks/useFavorites'; // Lógica de manejo de favoritos
import type { Book, BookFilters } from '../types';

export default function Home() {
  // --- Estados de UI ---
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<BookFilters>({});
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const searchBarRef = useRef<SearchBarHandle>(null);
  const location = useLocation();
  const { user } = useAuth();

  // --- LÓGICA DE DATOS: Llamada a Custom Hooks ---
  // 1. Hook para cargar los datos y manejar sus estados
  const { books, setBooks, featuredBook } = useBookData();

  // 2. Hook para manejar la interacción de favoritos
  const { toggleFavorite, isBookFavorite } = useFavorites();

  // Handler para toggle de favoritos
  const handleFavoriteToggle = async (libro_id: number) => {
    const isFavorite = isBookFavorite(libro_id);
    await toggleFavorite(libro_id, isFavorite);
  };
  // -----------------------------------------------

  // --- Lógica de Modal de Bienvenida  ---
  useEffect(() => {
    const state = location.state as { fromLogin?: boolean } | null;
    if (state?.fromLogin && user) {
      setWelcomeModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);

  const handleCloseWelcomeModal = () => setWelcomeModalOpen(false);

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);
    try {
      const queryNormalizada = normalizarTexto(query);
      // Combina los filtros actuales y la búsqueda
      const filtrosCombinados: BookFilters = { ...currentFilters };
      if (queryNormalizada) filtrosCombinados.query = queryNormalizada;
      const resultados = await buscarLibros(filtrosCombinados);
      setBooks(resultados);
    } catch {
      setBooks([]);
    }
  };

  const handleFilterChange = async (_resultados: Book[], filtros: BookFilters) => {
    setCurrentFilters(filtros);
    try {
      // Combina los filtros nuevos y la búsqueda actual
      const filtrosCombinados: BookFilters = { ...filtros };
      if (currentQuery) filtrosCombinados.query = normalizarTexto(currentQuery);
      const resultadosActualizados = await buscarLibros(filtrosCombinados);
      setBooks(resultadosActualizados);
    } catch {
      setBooks([]);
    }
  };

  const recomendado: Book | undefined = books.find((book) => book.titulo === 'La gran ocasión');

  // --- RENDERIZADO ---
  return (
    <Box
      py={2}
      px={1}
      sx={{
        width: '90%',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title={`Hola, ${user?.nombre || 'Usuario'}`}
        subtitle={new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
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
          // TODO: Cambiar libro recomendado dinámicamente y no MOCKEADO
          featuredBook={recomendado || {}}
          handleFavoriteToggle={handleFavoriteToggle}
          isFavorite={isBookFavorite(recomendado?.libro_id ?? -1)}
          handleVerMas={() => {}}
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
          </Box>
        </>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {/* Mostrar mensaje si no hay libros */}
        {books.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            El libro que usted está buscando no se encuentra disponible
          </Typography>
        ) : (
          /*Mapear la lista de libros destacados */
          books.map((book) => (
            <BookCard
              key={book.libro_id}
              image={book.portada_url}
              autor={book.autor}
              gender={book.genero}
              title={book.titulo}
              // description={book.descripcion} // No se muestra en el home
              rating={book.calificacion_promedio}
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