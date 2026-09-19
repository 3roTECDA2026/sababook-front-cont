// src/pages/Home.tsx
import { Box, Typography, Button } from '@mui/material';
import RecommendationIcon from '@mui/icons-material/AutoAwesome';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import BookCard from '../components/BookCard';
import FeaturedBookSection from '../components/FeaturedBookSection';
import FilterChips from '../components/FilterChips';
import SearchBar from '../components/SearchBar';
import type { SearchBarHandle } from '../components/SearchBar';
import SideMenu from '../components/SideMenu';
import WelcomeModal from '../components/WelcomeModal';
import { CrearListaModal } from '../components/CrearListaModal';

// Importaciones de Servicios
import { buscarLibros } from '../services/apiService';
import { normalizarTexto } from '../utils/normalize';

// Importaciones de Lógica (Custom Hooks)
import { useAuth } from '../hooks/useAuth';
import { useBookData } from '../hooks/useBookData';
import { useFavorites } from '../hooks/useFavorites';
import type { Book, BookFilters } from '../types';

export default function Home() {
  // --- Estados de UI ---
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(false);
  const [isCrearListaOpen, setCrearListaOpen] = useState<boolean>(false);
  
  // Estado para almacenar dinámicamente el libro recomendado
  const [libroRecomendado, setLibroRecomendado] = useState<Book | undefined>(undefined);

  const [currentFilters, setCurrentFilters] = useState<BookFilters>({});
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const searchBarRef = useRef<SearchBarHandle>(null);
  const location = useLocation();
  const { user } = useAuth();

  // --- LÓGICA DE DATOS ---
  const { books, setBooks } = useBookData();
  const { toggleFavorite, isBookFavorite } = useFavorites();

  const handleFavoriteToggle = async (libro_id: number) => {
    const isFavorite = isBookFavorite(libro_id);
    await toggleFavorite(libro_id, isFavorite);
  };

  // Función para obtener la última recomendación guardada desde la API
  const obtenerUltimaRecomendacion = useCallback(async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${baseUrl}/api/v1/lists`, { headers });
      if (res.ok) {
        const listas = await res.json();
        
        // Buscar la lista con tipo RECOMENDACION
        const recomendacion = listas.find(
          (l: any) => l.tipo === 'RECOMENDACION' || l.tipo === 'RECOMENDADA'
        );

        if (recomendacion && recomendacion.libros && recomendacion.libros.length > 0) {
          const rawBook = recomendacion.libros[0];
          
          // Mapear el libro al formato que espera FeaturedBookSection
          setLibroRecomendado({
            libro_id: rawBook.libro_id ?? rawBook.id,
            titulo: rawBook.titulo ?? rawBook.title ?? 'Sin título',
            autor: rawBook.autor ?? rawBook.author ?? '',
            genero: rawBook.genero ?? rawBook.genre ?? 'Recomendado',
            portada_url: rawBook.portada_url ?? rawBook.portadaUrl ?? rawBook.portada ?? '',
            calificacion_promedio: rawBook.calificacion_promedio ?? rawBook.rating ?? 5.0,
            descripcion: rawBook.descripcion ?? recomendacion.descripcion,
          } as Book);
        }
      }
    } catch (error) {
      console.error('Error al cargar la recomendación principal:', error);
    }
  }, []);

  useEffect(() => {
    obtenerUltimaRecomendacion();
  }, [obtenerUltimaRecomendacion]);

  // Fallback si no hay recomendación en BD
  useEffect(() => {
    if (!libroRecomendado && books.length > 0) {
      setLibroRecomendado(books[0]);
    }
  }, [books, libroRecomendado]);

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
      const filtrosCombinados: BookFilters = { ...filtros };
      if (currentQuery) filtrosCombinados.query = normalizarTexto(currentQuery);
      const resultadosActualizados = await buscarLibros(filtrosCombinados);
      setBooks(resultadosActualizados);
    } catch {
      setBooks([]);
    }
  };

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

      {/* Modal para Recomendar */}
      <CrearListaModal
        open={isCrearListaOpen}
        onClose={() => setCrearListaOpen(false)}
        onListaCreada={() => {
          obtenerUltimaRecomendacion(); // Recarga la portada del recomendado dinámicamente
        }}
      />

      <Box mb={2}>
        <SearchBar ref={searchBarRef} onSearch={handleSearch} />
      </Box>

      <FilterChips
        onFilterChange={handleFilterChange}
        onClearSearch={() => {
          setCurrentQuery('');
          if (searchBarRef.current && typeof searchBarRef.current.clear === 'function') {
            searchBarRef.current.clear();
          }
        }}
      />

      {/* Recomendado dinámico */}
      {Object.keys(currentFilters).length === 0 && !currentQuery && libroRecomendado && (
        <FeaturedBookSection
          featuredBook={libroRecomendado}
          handleFavoriteToggle={handleFavoriteToggle}
          isFavorite={isBookFavorite(libroRecomendado.libro_id ?? -1)}
          handleVerMas={() => {}}
        />
      )}

      {/* TÍTULO LISTADO DE LIBROS SOLO CON BOTÓN RECOMENDAR */}
      {Object.keys(currentFilters).length === 0 && !currentQuery && (
        <Box
          mt={4}
          mb={3}
          p={2.5}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="secondary">
            Listado de libros
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<RecommendationIcon />}
            onClick={() => setCrearListaOpen(true)}
            sx={{
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Recomendar
          </Button>
        </Box>
      )}

      {/* Resultados de búsqueda/filtros */}
      {(currentQuery || Object.keys(currentFilters).length > 0) && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
          <Typography variant="h4" fontWeight="bold" color="secondary">
            {currentQuery ? 'Resultados de búsqueda' : 'Libros filtrados'}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {books.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            El libro que usted está buscando no se encuentra disponible
          </Typography>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.libro_id}
              image={book.portada_url}
              autor={book.autor}
              gender={book.genero}
              title={book.titulo}
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