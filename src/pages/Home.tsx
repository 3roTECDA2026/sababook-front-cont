
import { Box, Typography, Button } from "@mui/material";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";

import AppHeader from "@/components/layout/AppHeader";
import BookCard from "@/components/ui/BookCard";
import FeaturedBookSection from "@/components/ui/FeaturedBookSection";
import FilterChips from "@/components/ui/FilterChips";
import SearchBar from "@/components/ui/SearchBar";
import type { SearchBarHandle } from "@/components/ui/SearchBar";
import SideMenu from "@/components/layout/SideMenu";

import { normalizarTexto } from "@/utils/normalize";
import { buscarLibrosPaginado } from "@/services/apiService";
import { API_BASE_URL } from "@/environments/api";
import { usePagination } from "@/hooks/usePagination";
import InfiniteScroll from "@/components/ui/InfiniteScroll";

import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingStatus } from "@/hooks/useReadingStatus";

import type { Book, BookFilters } from "@/types";
import type { LibroDestacado } from "@/components/ui/FeaturedBookSection";

// --------------------------------------------------
// TIPOS DE DATOS RECIBIDOS DESDE LA API
// --------------------------------------------------

interface LibroRecomendadoAPI {
  libro_id?: number;
  id?: number;
  titulo?: string;
  title?: string;
  autor?: string;
  author?: string;
  genero?: string;
  genre?: string;
  portada_url?: string;
  portadaUrl?: string;
  portada?: string;
  calificacion_promedio?: number;
  rating?: number;
  descripcion?: string;
  explicacion?: string | null;
  libro?: LibroRecomendadoAPI;
}

interface RecomendacionAPI {
  id?: number;
  lista_id?: number;
  tipo?: string;
  descripcion?: string;
  createdAt?: string;
  created_at?: string;
  fecha_creacion?: string;
  libros?: LibroRecomendadoAPI[];
  lista_libro?: LibroRecomendadoAPI[];
}

// --------------------------------------------------
// COMPONENTE HOME
// --------------------------------------------------

export default function Home() {
  // --------------------------------------------------
  // ESTADOS DE INTERFAZ
  // --------------------------------------------------

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [librosRecomendados, setLibrosRecomendados] =
    useState<LibroDestacado[]>([]);

  const [currentFilters, setCurrentFilters] =
    useState<BookFilters>({});

  const [currentQuery, setCurrentQuery] =
    useState<string>("");

  const searchBarRef = useRef<SearchBarHandle>(null);

  const { user } = useAuth();

  // --------------------------------------------------
  // PAGINACIÓN Y CARGA DE LIBROS
  // --------------------------------------------------

  const fetchBooks = useCallback(
    (page: number, limit: number, signal?: AbortSignal) => {
      const filtros: BookFilters = { ...currentFilters };

      const q = normalizarTexto(currentQuery);

      if (q) {
        filtros.query = q;
      }

      return buscarLibrosPaginado(
        filtros,
        page,
        limit,
        signal
      );
    },
    [currentFilters, currentQuery]
  );

  const resetKey = useMemo(
    () =>
      JSON.stringify({
        q: normalizarTexto(currentQuery),
        ...currentFilters,
      }),
    [currentQuery, currentFilters]
  );

  const {
    items: books,
    loading,
    error,
    hasMore,
    loadMore,
    reload,
  } = usePagination<Book>({
    fetchPage: fetchBooks,
    limit: 6,
    mode: "append",
    resetKey,
  });

  // --------------------------------------------------
  // FAVORITOS Y ESTADO DE LECTURA
  // --------------------------------------------------

  const {
    toggleFavorite,
    isBookFavorite,
  } = useFavorites();

  const {
    getReadingStatus,
    setReadingStatus,
  } = useReadingStatus();

  const handleFavoriteToggle = async (
    libro_id: number
  ): Promise<boolean> => {
    const isFavorite = isBookFavorite(libro_id);

    return toggleFavorite(libro_id, isFavorite);
  };

  // --------------------------------------------------
  // NORMALIZAR LIBROS RECOMENDADOS
  // --------------------------------------------------

  const normalizarLibroRecomendado = (
    item: LibroRecomendadoAPI
  ): LibroDestacado | null => {
    const rawBook = item.libro ?? item;

    const idLibro = rawBook.libro_id ?? rawBook.id;

    if (idLibro == null) {
      return null;
    }

    return {
      libro_id: idLibro,

      titulo:
        rawBook.titulo ??
        rawBook.title ??
        "Sin título",

      autor:
        rawBook.autor ??
        rawBook.author ??
        "",

      genero:
        rawBook.genero ??
        rawBook.genre ??
        "Recomendado",

      portada_url:
        rawBook.portada_url ??
        rawBook.portadaUrl ??
        rawBook.portada ??
        "",

      calificacion_promedio:
        rawBook.calificacion_promedio ??
        rawBook.rating ??
        0,

      descripcion: rawBook.descripcion ?? "",

      explicacion:
        item.explicacion ??
        rawBook.explicacion ??
        "",
    } as LibroDestacado;
  };

  // --------------------------------------------------
  // OBTENER ÚLTIMA RECOMENDACIÓN DESDE LA API
  // --------------------------------------------------

  const obtenerUltimaRecomendacion = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/lists`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(
          `Error al cargar recomendaciones: ${response.status}`
        );
      }

      const respuesta = await response.json();

      const listas: RecomendacionAPI[] = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
          ? respuesta.data
          : Array.isArray(respuesta?.listas)
            ? respuesta.listas
            : [];

      // Seleccionar recomendaciones que contienen libros.

      const recomendaciones = listas.filter((lista) => {
        const libros = lista.libros ?? lista.lista_libro;

        return (
          (lista.tipo === "RECOMENDACION" ||
            lista.tipo === "RECOMENDADA") &&
          Array.isArray(libros) &&
          libros.length > 0
        );
      });

      if (recomendaciones.length === 0) {
        setLibrosRecomendados([]);
        return;
      }

      // Obtener fecha de cada recomendación.

      const obtenerFecha = (
        lista: RecomendacionAPI
      ): number | null => {
        const valor =
          lista.createdAt ??
          lista.created_at ??
          lista.fecha_creacion;

        if (!valor) {
          return null;
        }

        const fecha = new Date(valor).getTime();

        return Number.isFinite(fecha) ? fecha : null;
      };

      // Ordenar por fecha y por ID de lista.

      const recomendacionesOrdenadas = [
        ...recomendaciones,
      ].sort((a, b) => {
        const fechaA = obtenerFecha(a);
        const fechaB = obtenerFecha(b);

        if (fechaA !== null && fechaB !== null) {
          if (fechaA !== fechaB) {
            return fechaB - fechaA;
          }
        } else if (fechaA !== null) {
          return -1;
        } else if (fechaB !== null) {
          return 1;
        }

        const idA = a.lista_id ?? a.id ?? 0;
        const idB = b.lista_id ?? b.id ?? 0;

        return idB - idA;
      });

      const recomendacion = recomendacionesOrdenadas[0];

      const librosAPI =
        recomendacion.libros ??
        recomendacion.lista_libro ??
        [];

      // Mostrar hasta dos libros de la misma lista.

      const libros = librosAPI
        .slice(0, 2)
        .map(normalizarLibroRecomendado)
        .filter(
          (libro): libro is LibroDestacado =>
            libro !== null
        );

      setLibrosRecomendados(libros);
    } catch (error) {
      console.error(
        "Error al cargar la recomendación principal:",
        error
      );
    }
  }, []);

  // --------------------------------------------------
  // CARGAR RECOMENDACIONES AL ENTRAR AL HOME
  // --------------------------------------------------

  useEffect(() => {
    void obtenerUltimaRecomendacion();
  }, [obtenerUltimaRecomendacion]);

  // --------------------------------------------------
  // BÚSQUEDA
  // --------------------------------------------------

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
  };

  // --------------------------------------------------
  // FILTROS
  // --------------------------------------------------

  const handleFilterChange = (
    _resultados: Book[],
    filtros: BookFilters
  ) => {
    setCurrentFilters(filtros);
  };

  // --------------------------------------------------
  // RENDERIZADO
  // --------------------------------------------------

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
      {/* CABECERA */}

      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title={`Hola, ${user?.nombre || "Usuario"}`}
        subtitle={new Date().toLocaleDateString(
          "es-ES",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}
      />

      {/* MENÚ LATERAL */}

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="Inicio"
      />

      {/* BUSCADOR */}

      <Box mb={2}>
        <SearchBar
          ref={searchBarRef}
          onSearch={handleSearch}
        />
      </Box>

      {/* FILTROS */}

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

      {/* NUESTRO RECOMENDADO */}

      {Object.keys(currentFilters).length === 0 &&
        !currentQuery &&
        librosRecomendados.length > 0 && (
          <FeaturedBookSection
            featuredBooks={librosRecomendados}
            handleFavoriteToggle={
              handleFavoriteToggle
            }
            isBookFavorite={isBookFavorite}
            getReadingStatus={getReadingStatus}
            setReadingStatus={setReadingStatus}
            handleVerMas={() => {}}
          />
        )}

      {/* TÍTULO LISTADO DE LIBROS */}

      {Object.keys(currentFilters).length === 0 &&
        !currentQuery && (
          <Box
            mt={4}
            mb={3}
            p={2.5}
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
              gap: 2,
              backgroundColor: "background.paper",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                "0px 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="secondary"
            >
              Listado de libros
            </Typography>
          </Box>
        )}

      {/* TÍTULO RESULTADOS DE BÚSQUEDA */}

      {(currentQuery ||
        Object.keys(currentFilters).length > 0) && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
          mb={2}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="secondary"
          >
            {currentQuery
              ? "Resultados de búsqueda"
              : "Libros filtrados"}
          </Typography>
        </Box>
      )}

      {/* LISTADO DE LIBROS CON SCROLL INFINITO */}

      <InfiniteScroll
        hasMore={hasMore}
        loading={loading}
        error={!!error}
        onLoadMore={loadMore}
        endMessage={
          books.length > 0 ? (
            <Typography
              color="text.secondary"
              sx={{
                textAlign: "center",
                py: 3,
              }}
            >
              Llegaste al final del catálogo
            </Typography>
          ) : undefined
        }
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 4,
          }}
        >
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
              onFavoriteToggle={() =>
                handleFavoriteToggle(book.libro_id)
              }
              readingStatus={getReadingStatus(book.libro_id)}
              onReadingStatusChange={(status) =>
                setReadingStatus(book.libro_id, status)
              }
            />
          ))}
        </Box>
      </InfiniteScroll>

      {/* SIN RESULTADOS */}

      {!loading && !error && books.length === 0 && (
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            textAlign: "center",
            py: 4,
          }}
        >
          El libro que usted está buscando no se encuentra disponible
        </Typography>
      )}

      {/* ERROR DE CARGA */}

      {error && (
        <Box
          sx={{
            textAlign: "center",
            py: 3,
          }}
        >
          <Typography color="error" mb={1}>
            {error}
          </Typography>

          <Button
            variant="outlined"
            onClick={reload}
          >
            Reintentar
          </Button>
        </Box>
      )}
    </Box>
  );
}
