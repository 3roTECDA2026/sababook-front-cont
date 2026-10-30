
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

import AppHeader from "@/components/layout/AppHeader";
import BookCard from "@/components/ui/BookCard";
import FeaturedBookSection from "@/components/ui/FeaturedBookSection";
import FilterChips from "@/components/ui/FilterChips";
import type { FilterChipsHandle } from "@/components/ui/FilterChips";
import SearchBar from "@/components/ui/SearchBar";
import type { SearchBarHandle } from "@/components/ui/SearchBar";
import SideMenu from "@/components/layout/SideMenu";

import { normalizarTexto } from "@/utils/normalize";
import { buscarLibrosPaginado } from "@/services/apiService";
import { recomendacionService } from "@/services/recomendacionService";
import { usePagination } from "@/hooks/usePagination";
import InfiniteScroll from "@/components/ui/InfiniteScroll";

import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingStatus } from "@/hooks/useReadingStatus";

import type { Book, BookFilters } from "@/types";
import type { LibroDestacado } from "@/components/ui/FeaturedBookSection";

import type { AlertColor } from "@mui/material";

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

interface RecomendacionNuevaAPI {
  recomendacion_id: number;
  libro_id: number;
  usuario_id: number;
  explicacion?: string | null;
  libro: LibroRecomendadoAPI;
}

interface UsuarioConRol {
  rol?: string;
  role?: string;
  usuario_id?: number;
  userId?: number;
  id?: number;
}

// --------------------------------------------------
// COMPONENTE HOME
// --------------------------------------------------

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const filterChipsRef = useRef<FilterChipsHandle>(null);

  const { user } = useAuth();

  // --------------------------------------------------
  // USUARIO Y PERMISOS
  // --------------------------------------------------

  const authUser = user as
    | (typeof user & UsuarioConRol)
    | null;

  const rol = String(
    authUser?.rol ?? authUser?.role ?? ""
  ).toUpperCase();

  const puedeRecomendar =
    rol === "ADMINISTRADOR" || rol === "DOCENTE";

  const usuarioId = Number(
    authUser?.usuario_id ??
      authUser?.userId ??
      authUser?.id
  );

  // --------------------------------------------------
  // ESTADOS DE RECOMENDACIONES
  // --------------------------------------------------

  const [recomendaciones, setRecomendaciones] =
    useState<RecomendacionNuevaAPI[]>([]);

  const [errorRecomendaciones, setErrorRecomendaciones] =
    useState<string | null>(null);

  const [
    errorAccionRecomendacion,
    setErrorAccionRecomendacion,
  ] = useState<string | null>(null);

  const [libroParaRecomendar, setLibroParaRecomendar] =
    useState<number | null>(null);

  const [
    comentarioRecomendacion,
    setComentarioRecomendacion,
  ] = useState<string>("");

  const [
    guardandoRecomendacion,
    setGuardandoRecomendacion,
  ] = useState<boolean>(false);

  const [
    quitandoRecomendacionId,
    setQuitandoRecomendacionId,
  ] = useState<number | null>(null);

  // --------------------------------------------------
  // PAGINACIÓN Y CARGA DE LIBROS
  // --------------------------------------------------

  const fetchBooks = useCallback(
    (
      page: number,
      limit: number,
      signal?: AbortSignal
    ) => {
      const filtros: BookFilters = {
        ...currentFilters,
      };

      const q = currentQuery.trim();

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
  // FAVORITOS Y ESTADOS DE LECTURA
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

    return toggleFavorite(
      libro_id,
      isFavorite
    );
  };

  // Avisos de éxito de las recomendaciones
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // --------------------------------------------------
  // NORMALIZAR LIBROS RECOMENDADOS
  // --------------------------------------------------

  const normalizarLibroRecomendado = (
    item: LibroRecomendadoAPI
  ): LibroDestacado | null => {
    const rawBook = item.libro ?? item;

    const idLibro =
      rawBook.libro_id ?? rawBook.id;

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

      descripcion:
        rawBook.descripcion ?? "",

      explicacion:
        item.explicacion ??
        rawBook.explicacion ??
        "",
    } as LibroDestacado;
  };

  // --------------------------------------------------
  // OBTENER TODAS LAS RECOMENDACIONES
  // --------------------------------------------------

  const cargarRecomendaciones = useCallback(
    async () => {
      try {
        const registros =
          await recomendacionService.obtenerTodas<RecomendacionNuevaAPI>();

        setRecomendaciones(registros);

        // Evitar mostrar el mismo libro varias veces.
        const vistos = new Set<number>();

        const libros: LibroDestacado[] = [];

        for (const recomendacion of registros) {
          if (
            vistos.has(recomendacion.libro_id) ||
            !recomendacion.libro
          ) {
            continue;
          }

          const libro =
            normalizarLibroRecomendado({
              ...recomendacion.libro,
              explicacion:
                recomendacion.explicacion,
            });

          if (libro) {
            vistos.add(
              recomendacion.libro_id
            );

            libros.push(libro);
          }
        }

        setLibrosRecomendados(libros);

        setErrorRecomendaciones(null);
      } catch (error) {
        console.error(
          "Error cargando recomendaciones:",
          error
        );

        setErrorRecomendaciones(
          error instanceof Error
            ? error.message
            : "Error al cargar recomendaciones."
        );
      }
    },
    []
  );

  // --------------------------------------------------
  // CARGAR RECOMENDACIONES AL ENTRAR
  // --------------------------------------------------

  useEffect(() => {
    void cargarRecomendaciones();
  }, [cargarRecomendaciones]);

  // --------------------------------------------------
  // ENVIAR RECOMENDACIÓN AL BACKEND
  // --------------------------------------------------

  const enviarRecomendacion = useCallback(
    async (
      libroId: number,
      metodo: "POST" | "DELETE",
      explicacion = ""
    ): Promise<void> => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Iniciá sesión para recomendar libros."
        );
      }

      if (!puedeRecomendar) {
        throw new Error(
          "No tenés permisos para administrar recomendaciones."
        );
      }

      if (metodo === "POST") {
        await recomendacionService.crear(
          libroId,
          explicacion,
          token
        );
      } else {
        await recomendacionService.eliminar(
          libroId,
          token
        );
      }

      await cargarRecomendaciones();
    },
    [
      puedeRecomendar,
      cargarRecomendaciones,
    ]
  );

  // --------------------------------------------------
  // ABRIR DIÁLOGO PARA RECOMENDAR
  // --------------------------------------------------

  const handleRecommendToggle = useCallback(
    async (
      libroId: number,
      isRecommended: boolean
    ): Promise<void> => {
      if (isRecommended) {
        // La eliminación se hace desde
        // "Nuestros recomendados".
        return;
      }

      setErrorAccionRecomendacion(null);

      setComentarioRecomendacion("");

      setLibroParaRecomendar(libroId);
    },
    []
  );

  // --------------------------------------------------
  // GUARDAR RECOMENDACIÓN CON COMENTARIO
  // --------------------------------------------------

  const guardarRecomendacionConComentario =
    async () => {
      if (
        libroParaRecomendar === null ||
        guardandoRecomendacion
      ) {
        return;
      }

      const explicacion =
        comentarioRecomendacion.trim();

      if (!explicacion) {
        setErrorAccionRecomendacion(
          "Escribí un comentario para recomendar el libro."
        );
        return;
      }

      try {
        setGuardandoRecomendacion(true);

        setErrorAccionRecomendacion(null);

        await enviarRecomendacion(
          libroParaRecomendar,
          "POST",
          explicacion
        );

        setLibroParaRecomendar(null);

        setComentarioRecomendacion("");

        // El aviso sale recién cuando el back guardó la recomendación
        setNotification({
          open: true,
          message: "Libro recomendado correctamente.",
          severity: "success",
        });
      } catch (error) {
        setErrorAccionRecomendacion(
          error instanceof Error
            ? error.message
            : "No se pudo guardar la recomendación."
        );
      } finally {
        setGuardandoRecomendacion(false);
      }
    };

  // --------------------------------------------------
  // COMPROBAR SI PUEDE QUITAR RECOMENDACIÓN
  // --------------------------------------------------

  const puedeQuitarRecomendacion = (
    libroId: number
  ): boolean => {
    if (!puedeRecomendar) {
      return false;
    }

    return recomendaciones.some(
      (recomendacion) =>
        recomendacion.libro_id === libroId &&
        (
          rol === "ADMINISTRADOR" ||
          recomendacion.usuario_id === usuarioId
        )
    );
  };

  // --------------------------------------------------
  // QUITAR RECOMENDACIÓN
  // --------------------------------------------------

  const quitarRecomendacion = async (
    libroId: number
  ) => {
    try {
      setQuitandoRecomendacionId(
        libroId
      );

      setErrorAccionRecomendacion(null);

      await enviarRecomendacion(
        libroId,
        "DELETE"
      );
    } catch (error) {
      setErrorAccionRecomendacion(
        error instanceof Error
          ? error.message
          : "No se pudo quitar la recomendación."
      );
    } finally {
      setQuitandoRecomendacionId(null);
    }
  };

  // --------------------------------------------------
  // BÚSQUEDA
  // --------------------------------------------------

  const handleSearch = (
    query: string
  ) => {
    setCurrentQuery(query.trim());
  };

  // Deja la pantalla en el estado inicial: sin búsqueda ni filtros
  const resetSearch = useCallback(() => {
    setCurrentQuery("");
    setCurrentFilters({});
    searchBarRef.current?.clear();
    filterChipsRef.current?.clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // "Inicio" del menú lateral navega a /home estando en /home: React Router no
  // remonta Home, pero sí genera una location.key nueva, así que se resetea acá
  useEffect(() => {
    resetSearch();
  }, [location.key, resetSearch]);

  // --------------------------------------------------
  // FILTROS
  // --------------------------------------------------

  const handleFilterChange = (filtros: BookFilters) => {
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
        onMenuClick={() =>
          setMenuOpen(true)
        }
        title={`Hola, ${
          user?.nombre || "Usuario"
        }`}
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
        onClose={() =>
          setMenuOpen(false)
        }
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
        ref={filterChipsRef}
        onFilterChange={
          handleFilterChange
        }
        onClearSearch={resetSearch}
      />

      {/* NUESTROS RECOMENDADOS */}

      {Object.keys(
        currentFilters
      ).length === 0 &&
        !currentQuery &&
        librosRecomendados.length > 0 && (
          <FeaturedBookSection
            featuredBooks={
              librosRecomendados
            }
            handleFavoriteToggle={
              handleFavoriteToggle
            }
            isBookFavorite={
              isBookFavorite
            }
            getReadingStatus={
              getReadingStatus
            }
            setReadingStatus={
              setReadingStatus
            }
            handleVerMas={(
              libroId
            ) => {
              if (
                libroId != null
              ) {
                navigate(
                  `/bookdetails/${libroId}`
                );
              }
            }}
            canRemoveRecommendation={
              puedeQuitarRecomendacion
            }
            onRemoveRecommendation={
              quitarRecomendacion
            }
            removingBookId={
              quitandoRecomendacionId
            }
          />
        )}

      {/* ERROR AL CARGAR RECOMENDACIONES */}

      {errorRecomendaciones && (
        <Alert
          severity="error"
          sx={{ my: 2 }}
        >
          {errorRecomendaciones}
        </Alert>
      )}

      {/* TÍTULO LISTADO DE LIBROS */}

      {Object.keys(
        currentFilters
      ).length === 0 &&
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
              justifyContent:
                "space-between",
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
              gap: 2,
              backgroundColor:
                "background.paper",
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
        Object.keys(
          currentFilters
        ).length > 0) && (
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
              : currentFilters.curso_id || currentFilters.anio
              ? "Libros por año y curso"
              : "Libros filtrados"}
          </Typography>

          <Button
            startIcon={<HomeIcon />}
            onClick={resetSearch}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Volver al inicio
          </Button>
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
                textAlign:
                  "center",
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
            justifyContent:
              "center",
            gap: 4,
          }}
        >
          {books.map((book) => (
            <BookCard
              key={book.libro_id}
              image={
                book.portada_url
              }
              autor={book.autor}
              gender={
                book.genero
              }
              title={
                book.titulo
              }
              rating={
                book.calificacion_promedio
              }
              isFavorite={
                isBookFavorite(
                  book.libro_id
                )
              }
              libro_id={
                book.libro_id
              }
              onFavoriteToggle={() =>
                handleFavoriteToggle(
                  book.libro_id
                )
              }
              readingStatus={
                getReadingStatus(
                  book.libro_id
                )
              }
              onReadingStatusChange={(
                status
              ) =>
                setReadingStatus(
                  book.libro_id,
                  status
                )
              }
              showReadingStatusControl
              includeGeneralStatus
              
              // El botón Recomendar aparece
              // solo para docentes y administradores,
              // si el libro aún no está recomendado.
              showRecommendControl={
                puedeRecomendar &&
                !recomendaciones.some(
                  (r) =>
                    r.libro_id ===
                    book.libro_id
                )
              }

              isRecommended={
                recomendaciones.some(
                  (r) =>
                    r.libro_id ===
                      book.libro_id &&
                    (
                      rol ===
                        "ADMINISTRADOR" ||
                      r.usuario_id ===
                        usuarioId
                    )
                )
              }

              onRecommendToggle={
                handleRecommendToggle
              }
            />
          ))}
        </Box>
      </InfiniteScroll>

      {/* SIN RESULTADOS */}

      {!loading &&
        !error &&
        books.length === 0 && (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              textAlign:
                "center",
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
            textAlign:
              "center",
            py: 3,
          }}
        >
          <Typography
            color="error"
            mb={1}
          >
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

      {/* ERROR AL ADMINISTRAR RECOMENDACIONES */}

      {errorAccionRecomendacion &&
        libroParaRecomendar === null && (
          <Alert
            severity="error"
            onClose={() =>
              setErrorAccionRecomendacion(
                null
              )
            }
            sx={{ mt: 2 }}
          >
            {errorAccionRecomendacion}
          </Alert>
        )}

      {/* DIÁLOGO PARA RECOMENDAR CON COMENTARIO */}

      <Dialog
        open={
          libroParaRecomendar !== null
        }
        onClose={() => {
          if (
            !guardandoRecomendacion
          ) {
            setLibroParaRecomendar(
              null
            );

            setComentarioRecomendacion(
              ""
            );

            setErrorAccionRecomendacion(
              null
            );
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
          }}
        >
          Recomendar libro
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              mt: 1,
            }}
          >
            Contanos por qué recomendás
            este libro. Tu comentario
            aparecerá en la sección
            «Nuestros recomendados».
          </Typography>

          <TextField
            label="Comentario de la recomendación"
            placeholder="Recomiendo este libro porque..."
            multiline
            minRows={4}
            fullWidth
            required
            value={
              comentarioRecomendacion
            }
            onChange={(event) => {
              setComentarioRecomendacion(
                event.target.value
              );

              setErrorAccionRecomendacion(
                null
              );
            }}
            disabled={
              guardandoRecomendacion
            }
            slotProps={{
              htmlInput: {
                maxLength: 1000,
              },
            }}
            helperText={`${
              comentarioRecomendacion.length
            }/1000 caracteres`}
          />

          {errorAccionRecomendacion && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              {errorAccionRecomendacion}
            </Alert>
          )}
        </DialogContent>

        <DialogActions
          sx={{ p: 2 }}
        >
          <Button
            disabled={
              guardandoRecomendacion
            }
            onClick={() => {
              setLibroParaRecomendar(
                null
              );

              setComentarioRecomendacion(
                ""
              );

              setErrorAccionRecomendacion(
                null
              );
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            disabled={
              guardandoRecomendacion ||
              !comentarioRecomendacion.trim()
            }
            onClick={() => {
              void guardarRecomendacionConComentario();
            }}
          >
            {guardandoRecomendacion
              ? "Guardando..."
              : "Confirmar recomendación"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AVISOS DE RECOMENDACIONES */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() =>
          setNotification((prev) => ({ ...prev, open: false }))
        }
      >
        <Alert
          onClose={() =>
            setNotification((prev) => ({ ...prev, open: false }))
          }
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
