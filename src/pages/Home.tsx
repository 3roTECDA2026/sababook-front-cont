// src/pages/Home.tsx
import { Box, Typography, Button } from "@mui/material";
import RecommendationIcon from "@mui/icons-material/AutoAwesome";
import { useEffect, useState, useRef, useCallback, useMemo} from "react";
import { useLocation } from "react-router-dom";

import AppHeader from '@/components/layout/AppHeader';
import BookCard from '@/components/ui/BookCard';
import FeaturedBookSection from '@/components/ui/FeaturedBookSection';
import FilterChips from '@/components/ui/FilterChips';
import SearchBar from '@/components/ui/SearchBar';
import type { SearchBarHandle } from '@/components/ui/SearchBar';
import SideMenu from '@/components/layout/SideMenu';
import { CrearListaModal } from '@/components/CrearListaModal';
import { normalizarTexto } from '@/utils/normalize';
import { buscarLibrosPaginado } from '@/services/apiService';
import { usePagination } from '@/hooks/usePagination';
import InfiniteScroll from '@/components/ui/InfiniteScroll';

// Importaciones de Lógica (Custom Hooks)
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites'; // Lógica de manejo de favoritos
import type { Book, BookFilters } from '@/types';
import { useReadingStatus } from '@/hooks/useReadingStatus';

export default function Home() {
  // --- Estados de UI ---
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isCrearListaOpen, setCrearListaOpen] = useState<boolean>(false);

  // Estado para almacenar dinámicamente el libro recomendado
  const [libroRecomendado, setLibroRecomendado] = useState<Book | undefined>(
    undefined,
  );

  const [currentFilters, setCurrentFilters] = useState<BookFilters>({});
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const searchBarRef = useRef<SearchBarHandle>(null);
  const location = useLocation();
  const { user } = useAuth();

  // --- LÓGICA DE DATOS ---
  const fetchBooks = useCallback(
  (page: number, limit: number, signal?: AbortSignal) => {
    const filtros: BookFilters = { ...currentFilters };
    const q = normalizarTexto(currentQuery);
    if (q) filtros.query = q;
    return buscarLibrosPaginado(filtros, page, limit, signal);
  },
  [currentFilters, currentQuery]
);

const resetKey = useMemo(
  () => JSON.stringify({ q: normalizarTexto(currentQuery), ...currentFilters }),
  [currentQuery, currentFilters]
);

const {
  items: books,
  loading,
  error,
  hasMore,
  loadMore,
  reload,
} = usePagination<Book>({ fetchPage: fetchBooks, limit: 6, mode: 'append', resetKey });
  const { toggleFavorite, isBookFavorite } = useFavorites();
  const { getReadingStatus, setReadingStatus } = useReadingStatus();

  // Handler para toggle de favoritos
  const handleFavoriteToggle = async (libro_id: number): Promise<boolean> => {
    const isFavorite = isBookFavorite(libro_id);
    return toggleFavorite(libro_id, isFavorite);
  };

  // Función para obtener la última recomendación guardada desde la API
  const obtenerUltimaRecomendacion = useCallback(async () => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${baseUrl}/api/v1/lists`, { headers });
      if (res.ok) {
        const listas = await res.json();

        // Buscar la lista con tipo RECOMENDACION
        const recomendacion = listas.find(
          (l: any) => l.tipo === "RECOMENDACION" || l.tipo === "RECOMENDADA",
        );

        if (
          recomendacion &&
          recomendacion.libros &&
          recomendacion.libros.length > 0
        ) {
          const rawBook = recomendacion.libros[0];

          // Mapear el libro al formato que espera FeaturedBookSection
          setLibroRecomendado({
            libro_id: rawBook.libro_id ?? rawBook.id,
            titulo: rawBook.titulo ?? rawBook.title ?? "Sin título",
            autor: rawBook.autor ?? rawBook.author ?? "",
            genero: rawBook.genero ?? rawBook.genre ?? "Recomendado",
            portada_url:
              rawBook.portada_url ??
              rawBook.portadaUrl ??
              rawBook.portada ??
              "",
            calificacion_promedio:
              rawBook.calificacion_promedio ?? rawBook.rating ?? 5.0,
            descripcion: rawBook.descripcion ?? recomendacion.descripcion,
          } as Book);
        }
      }
    } catch (error) {
      console.error("Error al cargar la recomendación principal:", error);
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

  const handleSearch = (query: string) => {
  setCurrentQuery(query);
  };

  const handleFilterChange = (_resultados: Book[], filtros: BookFilters) => {
  setCurrentFilters(filtros);
  };

  return (
    <Box
      py={2}
      px={1}
      sx={{
        width: "90%",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title={`Hola, ${user?.nombre || "Usuario"}`}
        subtitle={new Date().toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="Inicio"
      />

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
          setCurrentQuery("");
          if (
            searchBarRef.current &&
            typeof searchBarRef.current.clear === "function"
          ) {
            searchBarRef.current.clear();
          }
        }}
      />

      {/* Recomendado dinámico */}
      {Object.keys(currentFilters).length === 0 &&
        !currentQuery &&
        libroRecomendado && (
          <FeaturedBookSection
            featuredBook={libroRecomendado}
            handleFavoriteToggle={handleFavoriteToggle}
            isFavorite={isBookFavorite(libroRecomendado.libro_id ?? -1)}
            readingStatus={getReadingStatus(libroRecomendado.libro_id ?? -1)}
            onReadingStatusChange={(status) => {
              if (libroRecomendado.libro_id)
                setReadingStatus(libroRecomendado.libro_id, status);
            }}
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
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            backgroundColor: "background.paper",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
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
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Recomendar
          </Button>
        </Box>
      )}

      {/* Resultados de búsqueda/filtros */}
      {(currentQuery || Object.keys(currentFilters).length > 0) && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
          mb={2}
        >
          <Typography variant="h4" fontWeight="bold" color="secondary">
            {currentQuery ? "Resultados de búsqueda" : "Libros filtrados"}
          </Typography>
        </Box>
      )}

      <InfiniteScroll
  hasMore={hasMore}
  loading={loading}
  error={!!error}
  onLoadMore={loadMore}
  endMessage={
    books.length > 0 ? (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        Llegaste al final del catálogo
      </Typography>
    ) : undefined
  }
>
  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
    {books.map((book) => (
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
        readingStatus={getReadingStatus(book.libro_id)}
        onReadingStatusChange={(status) => setReadingStatus(book.libro_id, status)}
      />
    ))}
  </Box>
</InfiniteScroll>

{!loading && !error && books.length === 0 && (
  <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
    El libro que usted está buscando no se encuentra disponible
  </Typography>
)}

{error && (
  <Box sx={{ textAlign: 'center', py: 3 }}>
    <Typography color="error" mb={1}>{error}</Typography>
    <Button variant="outlined" onClick={reload}>Reintentar</Button>
  </Box>
)}
    </Box>
  );
}
