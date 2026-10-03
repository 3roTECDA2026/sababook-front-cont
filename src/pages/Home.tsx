// src/pages/Home.tsx
import { Box, Typography, Button } from "@mui/material";
import RecommendationIcon from "@mui/icons-material/AutoAwesome";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

import AppHeader from '@/components/layout/AppHeader';
import BookCard from '@/components/ui/BookCard';
import FeaturedBookSection from '@/components/ui/FeaturedBookSection';
import FilterChips from '@/components/ui/FilterChips';
import SearchBar from '@/components/ui/SearchBar';
import type { SearchBarHandle } from '@/components/ui/SearchBar';
import SideMenu from '@/components/layout/SideMenu';
import WelcomeModal from '@/components/ui/WelcomeModal';
import { CrearListaModal } from '@/components/CrearListaModal';
import { searchBooks } from '@/services/apiService';
import { normalizeText } from '@/utils/normalize';

import { useAuth } from '@/hooks/useAuth';
import { useBookData } from '@/hooks/useBookData';
import { useFavorites } from '@/hooks/useFavorites';
import type { Book, BookFilters } from '@/types';
import { useReadingStatus } from '@/hooks/useReadingStatus';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(false);
  const [isCrearListaOpen, setCrearListaOpen] = useState<boolean>(false);

  const [featuredBookData, setFeaturedBookData] = useState<Book | undefined>(
    undefined,
  );

  const [currentFilters, setCurrentFilters] = useState<BookFilters>({});
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const searchBarRef = useRef<SearchBarHandle>(null);
  const location = useLocation();
  const { user } = useAuth();

  const { books, setBooks } = useBookData();
  const { toggleFavorite, isBookFavorite } = useFavorites();
  const { getReadingStatus, setReadingStatus } = useReadingStatus();

  const handleFavoriteToggle = async (bookId: number): Promise<boolean> => {
    const isFavorite = isBookFavorite(bookId);
    return toggleFavorite(bookId, isFavorite);
  };

  const getLatestRecommendation = useCallback(async () => {
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
        const lists = await res.json();

        const recommendation = lists.find(
          (l: any) => l.tipo === "RECOMENDACION" || l.tipo === "RECOMENDADA",
        );

        if (
          recommendation &&
          recommendation.libros &&
          recommendation.libros.length > 0
        ) {
          const rawBook = recommendation.libros[0];

          setFeaturedBookData({
            bookId: rawBook.bookId ?? rawBook.libro_id ?? rawBook.id,
            title: rawBook.title ?? rawBook.titulo ?? "Sin título",
            author: rawBook.author ?? rawBook.autor ?? "",
            genre: rawBook.genre ?? rawBook.genero ?? "Recomendado",
            coverUrl:
              rawBook.coverUrl ??
              rawBook.portada_url ??
              rawBook.portadaUrl ??
              "",
            averageRating:
              rawBook.averageRating ?? rawBook.calificacion_promedio ?? 5.0,
            description: rawBook.description ?? rawBook.descripcion ?? recommendation.descripcion,
          } as Book);
        }
      }
    } catch (error) {
      console.error("Error loading main recommendation:", error);
    }
  }, []);

  useEffect(() => {
    getLatestRecommendation();
  }, [getLatestRecommendation]);

  useEffect(() => {
    if (!featuredBookData && books.length > 0) {
      setFeaturedBookData(books[0]);
    }
  }, [books, featuredBookData]);

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
      const normalizedQuery = normalizeText(query);
      const combinedFilters: BookFilters = { ...currentFilters };
      if (normalizedQuery) combinedFilters.query = normalizedQuery;
      const results = await searchBooks(combinedFilters);
      setBooks(results);
    } catch {
      setBooks([]);
    }
  };

  const handleFilterChange = async (
    _results: Book[],
    filters: BookFilters,
  ) => {
    setCurrentFilters(filters);
    try {
      const combinedFilters: BookFilters = { ...filters };
      if (currentQuery) combinedFilters.query = normalizeText(currentQuery);
      const updatedResults = await searchBooks(combinedFilters);
      setBooks(updatedResults);
    } catch {
      setBooks([]);
    }
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
        title={`Hola, ${user?.name || (user as any)?.nombre || "Usuario"}`}
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
      <WelcomeModal
        open={isWelcomeModalOpen}
        onClose={handleCloseWelcomeModal}
        user={user}
      />

      <CrearListaModal
        open={isCrearListaOpen}
        onClose={() => setCrearListaOpen(false)}
        onListaCreada={() => {
          getLatestRecommendation();
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

      {Object.keys(currentFilters).length === 0 &&
        !currentQuery &&
        featuredBookData && (
          <FeaturedBookSection
            featuredBook={featuredBookData}
            handleFavoriteToggle={handleFavoriteToggle}
            isFavorite={isBookFavorite((featuredBookData.bookId || (featuredBookData as any).libro_id) ?? -1)}
            readingStatus={getReadingStatus((featuredBookData.bookId || (featuredBookData as any).libro_id) ?? -1)}
            onReadingStatusChange={(status) => {
              const bId = featuredBookData.bookId || (featuredBookData as any).libro_id;
              if (bId) setReadingStatus(bId, status);
            }}
            handleViewMore={() => {}}
          />
        )}

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

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {books.length === 0 ? (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            El libro que usted está buscando no se encuentra disponible
          </Typography>
        ) : (
          books.map((book) => {
            const currentBookId = (book.bookId || (book as any).libro_id) ?? 0;
            return (
              <BookCard
                key={currentBookId}
                image={book.coverUrl || (book as any).portada_url}
                author={book.author || (book as any).autor}
                genre={book.genre || (book as any).genero}
                title={book.title || (book as any).titulo}
                rating={book.averageRating || (book as any).calificacion_promedio}
                isFavorite={isBookFavorite(currentBookId)}
                bookId={currentBookId}
                onFavoriteToggle={() => handleFavoriteToggle(currentBookId)}
                readingStatus={getReadingStatus(currentBookId)}
                onReadingStatusChange={(status) =>
                  setReadingStatus(currentBookId, status)
                }
              />
            );
          })
        )}
      </Box>
    </Box>
  );
}
