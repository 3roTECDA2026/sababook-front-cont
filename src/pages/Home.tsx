
import { Box, Typography } from "@mui/material";
import { useEffect, useState, useRef, useCallback } from "react";

import AppHeader from "@/components/layout/AppHeader";
import BookCard from "@/components/ui/BookCard";
import FeaturedBookSection from "@/components/ui/FeaturedBookSection";
import FilterChips from "@/components/ui/FilterChips";
import SearchBar from "@/components/ui/SearchBar";
import type { SearchBarHandle } from "@/components/ui/SearchBar";
import SideMenu from "@/components/layout/SideMenu";

import { buscarLibros } from "@/services/apiService";
import { normalizarTexto } from "@/utils/normalize";
import { API_BASE_URL } from "@/environments/api";

import { useAuth } from "@/hooks/useAuth";
import { useBookData } from "@/hooks/useBookData";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingStatus } from "@/hooks/useReadingStatus";

import type { Book, BookFilters } from "@/types";

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
}

export default function Home() {
  // --------------------------------------------------
  // ESTADOS DE INTERFAZ
  // --------------------------------------------------

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [libroRecomendado, setLibroRecomendado] = useState<
    Book | undefined
  >(undefined);

  const [
    comentarioRecomendacion,
    setComentarioRecomendacion,
  ] = useState<string>("");

  const [currentFilters, setCurrentFilters] =
    useState<BookFilters>({});

  const [currentQuery, setCurrentQuery] =
    useState<string>("");

  const searchBarRef = useRef<SearchBarHandle>(null);

  const { user } = useAuth();

  // --------------------------------------------------
  // DATOS Y HOOKS
  // --------------------------------------------------

  const { books, setBooks } = useBookData();

  const {
    toggleFavorite,
    isBookFavorite,
  } = useFavorites();

  const {
    getReadingStatus,
    setReadingStatus,
  } = useReadingStatus();

  // --------------------------------------------------
  // FAVORITOS
  // --------------------------------------------------

  const handleFavoriteToggle = async (
    libro_id: number
  ): Promise<boolean> => {
    const isFavorite = isBookFavorite(libro_id);

    return toggleFavorite(libro_id, isFavorite);
  };

  // --------------------------------------------------
  // RECOMENDACIÓN DESDE BASE DE DATOS
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

      const recomendaciones = listas.filter(
        (lista) =>
          (lista.tipo === "RECOMENDACION" ||
            lista.tipo === "RECOMENDADA") &&
          Array.isArray(lista.libros) &&
          lista.libros.length > 0
      );

      if (recomendaciones.length === 0) {
        setComentarioRecomendacion("");
        return;
      }

      // Si la API incluye fecha, utilizar la más reciente.
      // Si no incluye fecha, conservar el orden recibido.

      const obtenerFecha = (
        lista: RecomendacionAPI
      ): number | null => {
        const valor =
          lista.createdAt ??
          lista.created_at ??
          lista.fecha_creacion;

        if (!valor) return null;

        const fecha = new Date(valor).getTime();

        return Number.isFinite(fecha) ? fecha : null;
      };

      const recomendacionesConFecha =
        recomendaciones.filter(
          (lista) => obtenerFecha(lista) !== null
        );

      const recomendacion =
        recomendacionesConFecha.length > 0
          ? [...recomendacionesConFecha].sort(
              (a, b) =>
                (obtenerFecha(b) ?? 0) -
                (obtenerFecha(a) ?? 0)
            )[0]
          : recomendaciones[0];

      const rawBook = recomendacion.libros?.[0];

      if (!rawBook) return;

      // El comentario de la recomendación es diferente
      // de la sinopsis original del libro.

      setComentarioRecomendacion(
        typeof recomendacion.descripcion === "string"
          ? recomendacion.descripcion
          : ""
      );

      const idLibro = rawBook.libro_id ?? rawBook.id;

      if (idLibro == null) return;

      const libro: Book = {
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
      } as Book;

      setLibroRecomendado(libro);
    } catch (error) {
      console.error(
        "Error al cargar la recomendación principal:",
        error
      );
    }
  }, []);

  // --------------------------------------------------
  // CARGAR RECOMENDACIÓN AL ENTRAR A HOME
  // --------------------------------------------------

  useEffect(() => {
    void obtenerUltimaRecomendacion();
  }, [obtenerUltimaRecomendacion]);

  // --------------------------------------------------
  // LIBRO POR DEFECTO
  // --------------------------------------------------

  useEffect(() => {
    if (!libroRecomendado && books.length > 0) {
      setLibroRecomendado(books[0]);
    }
  }, [books, libroRecomendado]);

  // --------------------------------------------------
  // BÚSQUEDA
  // --------------------------------------------------

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);

    try {
      const queryNormalizada =
        normalizarTexto(query);

      const filtrosCombinados: BookFilters = {
        ...currentFilters,
      };

      if (queryNormalizada) {
        filtrosCombinados.query = queryNormalizada;
      }

      const resultados = await buscarLibros(
        filtrosCombinados
      );

      setBooks(resultados);
    } catch (error) {
      console.error(
        "Error al buscar libros:",
        error
      );

      setBooks([]);
    }
  };

  // --------------------------------------------------
  // FILTROS
  // --------------------------------------------------

  const handleFilterChange = async (
    _resultados: Book[],
    filtros: BookFilters
  ) => {
    setCurrentFilters(filtros);

    try {
      const filtrosCombinados: BookFilters = {
        ...filtros,
      };

      if (currentQuery) {
        filtrosCombinados.query =
          normalizarTexto(currentQuery);
      }

      const resultadosActualizados =
        await buscarLibros(filtrosCombinados);

      setBooks(resultadosActualizados);
    } catch (error) {
      console.error(
        "Error al filtrar libros:",
        error
      );

      setBooks([]);
    }
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
            typeof searchBarRef.current.clear ===
              "function"
          ) {
            searchBarRef.current.clear();
          }
        }}
      />

      {/* NUESTRO RECOMENDADO */}

      {Object.keys(currentFilters).length === 0 &&
        !currentQuery &&
        libroRecomendado && (
          <FeaturedBookSection
            featuredBook={libroRecomendado}
            comentarioRecomendacion={
              comentarioRecomendacion
            }
            handleFavoriteToggle={
              handleFavoriteToggle
            }
            isFavorite={isBookFavorite(
              libroRecomendado.libro_id ?? -1
            )}
            readingStatus={getReadingStatus(
              libroRecomendado.libro_id ?? -1
            )}
            onReadingStatusChange={(status) => {
              if (libroRecomendado.libro_id) {
                setReadingStatus(
                  libroRecomendado.libro_id,
                  status
                );
              }
            }}
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

      {/* LISTADO DE LIBROS */}

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
            sx={{
              textAlign: "center",
              py: 4,
            }}
          >
            El libro que usted está buscando no
            se encuentra disponible
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
              isFavorite={isBookFavorite(
                book.libro_id
              )}
              libro_id={book.libro_id}
              onFavoriteToggle={() =>
                handleFavoriteToggle(
                  book.libro_id
                )
              }
              readingStatus={getReadingStatus(
                book.libro_id
              )}
              onReadingStatusChange={(status) =>
                setReadingStatus(
                  book.libro_id,
                  status
                )
              }
            />
          ))
        )}
      </Box>
    </Box>
  );
}
