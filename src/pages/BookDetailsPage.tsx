
import { API_BASE_URL } from '@/environments/api';
import { recomendacionService } from '@/services/recomendacionService';
import ReadingProgress from '@/components/ReadingProgress';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Snackbar,
  Typography,
  useTheme,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useParams } from 'react-router-dom';

import SideMenu from '@/components/layout/SideMenu';
import AppHeader from '@/components/layout/AppHeader';
import NavButton from '@/components/ui/NavButton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useAuth } from '@/hooks/useAuth';
import { useBookDetails } from '@/hooks/useBookDetails';
import { useBookOpinion } from '@/hooks/useBookOpinion';
import { useReadingStatus } from '@/hooks/useReadingStatus';
import BookDetailsHeader from '@/components/ui/BookDetailsHeader';
import BookCommentBox from '@/components/BookCommentBox';
import BookOpinionList from '@/components/ui/BookOpinionList';
import BookDescription from '@/components/ui/BookDescription';
import TriviaPlaySection from '@/components/ui/TriviaPlaySection';

interface Recomendacion {
  recomendacion_id: number;
  libro_id: number;
  usuario_id: number;
  explicacion?: string;
}

interface ReadingProgressResponse {
  libro_id?: number;
  pagina_actual?: number;
  paginas_totales?: number;
  porcentaje?: number;
  data?: {
    libro_id?: number;
    pagina_actual?: number;
    paginas_totales?: number;
    porcentaje?: number;
  };
  message?: string;
  error?: string;
}

interface ReadBooksCountResponse {
  libros_leidos: number;
}

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const BookDetailsPage = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const {
    getReadingStatus,
    getReadingDate,
    setReadingStatus,
  } = useReadingStatus();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);

  // SAB-91: progreso individual
  const [currentProgress, setCurrentProgress] =
    useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  // Estado de lectura
  const [guardandoLectura, setGuardandoLectura] = useState(false);

  // Contador individual de libros leídos
  const [librosLeidos, setLibrosLeidos] =
    useState<number | null>(null);
  const [loadingLibrosLeidos, setLoadingLibrosLeidos] =
    useState(false);
  const [versionLibrosLeidos, setVersionLibrosLeidos] =
    useState(0);

  // Recomendaciones
  const [recomendaciones, setRecomendaciones] =
    useState<Recomendacion[]>([]);
  const [loadingRecomendaciones, setLoadingRecomendaciones] =
    useState(true);
  const [removingRecommendation, setRemovingRecommendation] =
    useState(false);

  // Confirmación antes de dejar de recomendar
  const [isUnrecommendConfirmOpen, setIsUnrecommendConfirmOpen] =
    useState(false);

  // Notificaciones
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    book,
    loading: bookLoading,
    error: bookError,
  } = useBookDetails(id);

  const {
    opinions,
    setOpinions,
    loading: opinionsLoading,
  } = useBookOpinion(id);

  const authorStyle: SxProps<Theme> = {
    fontWeight: 900,
    fontSize: '1.5rem',
    lineHeight: 1,
    textTransform: 'uppercase',
    mb: 0.5,
    color: theme.palette.text.primary,
  };

  const userId = Number(
    user?.usuario_id ?? user?.userId ?? 0
  );

  const userRole = String(user?.rol ?? '').toUpperCase();

  const isAdmin = userRole === 'ADMINISTRADOR';
  const isTeacher = userRole === 'DOCENTE';

  // =====================================================
  // CONTADOR INDIVIDUAL DE LIBROS LEÍDOS
  // =====================================================

  useEffect(() => {
    const controller = new AbortController();

    const cargarLibrosLeidos = async () => {
      setLibrosLeidos(null);

      if (!userId) {
        setLoadingLibrosLeidos(false);
        return;
      }

      setLoadingLibrosLeidos(true);

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No hay una sesión activa.');
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/favorites/read-count`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data: ReadBooksCountResponse & {
          error?: string;
          message?: string;
        } = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              'No se pudo obtener el contador de libros leídos.'
          );
        }

        const total = Number(data.libros_leidos);

        if (!Number.isInteger(total) || total < 0) {
          throw new Error(
            'El servidor devolvió un contador inválido.'
          );
        }

        if (!controller.signal.aborted) {
          setLibrosLeidos(total);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(
          'Error al cargar libros leídos:',
          error
        );

        setLibrosLeidos(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLibrosLeidos(false);
        }
      }
    };

    void cargarLibrosLeidos();

    return () => controller.abort();
  }, [userId, versionLibrosLeidos]);

  // =====================================================
  // SAB-91: CONSULTAR PROGRESO INDIVIDUAL
  // =====================================================

  useEffect(() => {
    setCurrentProgress(null);

    if (!id || !user) {
      setLoadingProgress(false);
      return;
    }

    const libroId = Number(id);

    if (!Number.isInteger(libroId) || libroId <= 0) {
      setLoadingProgress(false);
      return;
    }

    const controller = new AbortController();

    const cargarProgreso = async () => {
      setLoadingProgress(true);

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error(
            'Debés iniciar sesión para consultar tu progreso.'
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/favorites/progress?libro_id=${libroId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data: ReadingProgressResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              'No se pudo consultar el progreso de lectura.'
          );
        }

        const progreso = data.data ?? data;
        const paginaActual = Number(
          progreso.pagina_actual ?? 0
        );

        if (
          !Number.isInteger(paginaActual) ||
          paginaActual < 0
        ) {
          throw new Error(
            'El servidor devolvió un progreso inválido.'
          );
        }

        if (!controller.signal.aborted) {
          setCurrentProgress(paginaActual);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(
          'Error al cargar progreso:',
          error
        );

        setNotification({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el progreso de lectura.',
          severity: 'error',
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProgress(false);
        }
      }
    };

    void cargarProgreso();

    return () => controller.abort();
  }, [id, userId, user]);

  // =====================================================
  // CONSULTAR RECOMENDACIONES
  // =====================================================

  useEffect(() => {
    if (!id) {
      setLoadingRecomendaciones(false);
      return;
    }

    const controller = new AbortController();

    const cargarRecomendaciones = async () => {
      setLoadingRecomendaciones(true);

      try {
        const data =
          await recomendacionService.obtenerTodas<Recomendacion>(
            controller.signal
          );

        const recomendacionesLibro = data.filter(
          (recomendacion): recomendacion is Recomendacion => {
            if (
              !recomendacion ||
              typeof recomendacion !== 'object'
            ) {
              return false;
            }

            const item =
              recomendacion as Partial<Recomendacion>;

            return Number(item.libro_id) === Number(id);
          }
        );

        if (!controller.signal.aborted) {
          setRecomendaciones(recomendacionesLibro);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(
          'Error al cargar recomendaciones:',
          error
        );

        setRecomendaciones([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRecomendaciones(false);
        }
      }
    };

    void cargarRecomendaciones();

    return () => controller.abort();
  }, [id]);

  // =====================================================
  // PERMISOS PARA QUITAR RECOMENDACIÓN
  // =====================================================

  const libroEstaRecomendado =
    recomendaciones.length > 0;

  const recomendacionPropia = recomendaciones.some(
    (recomendacion) =>
      Number(recomendacion.usuario_id) === userId
  );

  const puedeQuitarRecomendacion =
    libroEstaRecomendado &&
    (isAdmin || (isTeacher && recomendacionPropia));

  // =====================================================
  // QUITAR RECOMENDACIÓN
  // =====================================================

  // Se llama desde el modal de confirmación, nunca directo desde el botón
  const handleRemoveRecommendation = async () => {
    setIsUnrecommendConfirmOpen(false);

    if (
      !id ||
      !puedeQuitarRecomendacion ||
      removingRecommendation
    ) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setNotification({
        open: true,
        message:
          'Debés iniciar sesión para quitar una recomendación.',
        severity: 'error',
      });
      return;
    }

    setRemovingRecommendation(true);

    try {
      await recomendacionService.eliminar(
        Number(id),
        token
      );

      if (isAdmin) {
        setRecomendaciones([]);
      } else {
        setRecomendaciones((prev) =>
          prev.filter(
            (recomendacion) =>
              Number(recomendacion.usuario_id) !== userId
          )
        );
      }

      setNotification({
        open: true,
        message:
          'La recomendación se quitó correctamente.',
        severity: 'success',
      });
    } catch (error) {
      console.error(
        'Error al quitar recomendación:',
        error
      );

      setNotification({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo quitar la recomendación.',
        severity: 'error',
      });
    } finally {
      setRemovingRecommendation(false);
    }
  };

  // =====================================================
  // MARCAR O DESMARCAR COMO LEÍDO
  // =====================================================

  const handleToggleLeido = async () => {
    if (!book || guardandoLectura) return;

    const yaLeido =
      getReadingStatus(book.libro_id) === 'leido';

    setGuardandoLectura(true);

    try {
      const ok = await setReadingStatus(
        book.libro_id,
        yaLeido ? 'general' : 'leido'
      );

      if (ok) {
        setVersionLibrosLeidos((prev) => prev + 1);
      }

      setNotification({
        open: true,
        message: ok
          ? yaLeido
            ? 'Se quitó la marca de leído.'
            : '¡Libro marcado como leído!'
          : 'No se pudo guardar. Intentá de nuevo en un momento.',
        severity: ok ? 'success' : 'error',
      });
    } catch (error) {
      console.error(
        'Error al actualizar estado de lectura:',
        error
      );

      setNotification({
        open: true,
        message:
          'No se pudo guardar el estado de lectura.',
        severity: 'error',
      });
    } finally {
      setGuardandoLectura(false);
    }
  };

  // =====================================================
  // COMENTARIOS
  // =====================================================

  const handleCommentClick = () => {
    if (!user) {
      setNotification({
        open: true,
        message:
          'Debés iniciar sesión para comentar.',
        severity: 'error',
      });
      return;
    }

    setShowCommentBox((prev) => !prev);
  };

  const handleMenuToggle = () => setMenuOpen(true);
  const handleMenuClose = () => setMenuOpen(false);

  // =====================================================
  // SAB-91: ACTUALIZAR PROGRESO INDIVIDUAL
  // =====================================================

  const handleUpdateProgress = async (
    newPage: number
  ) => {
    if (!book || savingProgress) return;

    if (!user) {
      setNotification({
        open: true,
        message:
          'Debés iniciar sesión para guardar tu progreso.',
        severity: 'error',
      });
      return;
    }

    const totalPages = Number(
      book.paginas_totales
    );

    if (
      !Number.isInteger(newPage) ||
      newPage < 0 ||
      !Number.isInteger(totalPages) ||
      totalPages <= 0 ||
      newPage > totalPages
    ) {
      setNotification({
        open: true,
        message:
          `Ingresá una página válida entre 0 y ${totalPages}.`,
        severity: 'error',
      });
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setNotification({
        open: true,
        message:
          'Tu sesión no está disponible. Iniciá sesión nuevamente.',
        severity: 'error',
      });
      return;
    }

    setSavingProgress(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/favorites/progress`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            libro_id: book.libro_id,
            pagina_actual: newPage,
          }),
        }
      );

      const data: ReadingProgressResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            'No se pudo actualizar el progreso.'
        );
      }

      const progreso = data.data ?? data;

      const paginaGuardada = Number(
        progreso.pagina_actual ?? newPage
      );

      setCurrentProgress(paginaGuardada);

      setNotification({
        open: true,
        message:
          `Progreso guardado: página ${paginaGuardada}.`,
        severity: 'success',
      });
    } catch (error) {
      console.error(
        'Error al actualizar progreso:',
        error
      );

      setNotification({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el progreso.',
        severity: 'error',
      });
    } finally {
      setSavingProgress(false);
    }
  };

  // =====================================================
  // ESTADOS DE CARGA
  // =====================================================

  if (bookLoading || opinionsLoading) {
    return <div>Cargando...</div>;
  }

  if (bookError) {
    return <div>{bookError}</div>;
  }

  if (!book) {
    return <div>No se encontró el libro.</div>;
  }

  const coverImageSrc =
    book.portada_url?.trim() || undefined;

  const leido =
    getReadingStatus(book.libro_id) === 'leido';

  const fechaLectura =
    getReadingDate(book.libro_id);

  const totalPages = Number(
    book.paginas_totales ?? 0
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1000,
        minHeight: '100vh',
        margin: '0 auto',
        py: 2,
        px: 1,
        backgroundColor: theme.palette.common.white,
      }}
    >
      <AppHeader
        onMenuClick={handleMenuToggle}
        title="Detalles del libro"
        subtitle="Descubrí su esencia y su autor"
      />

      <SideMenu
        open={menuOpen}
        onClose={handleMenuClose}
        active="Inicio"
      />

      <Box sx={{ pt: 0 }}>
        <BookDetailsHeader
          book={book}
          coverImageSrc={coverImageSrc}
          authorStyle={authorStyle}
          actions={
            <TriviaPlaySection
              bookId={book.libro_id}
            />
          }
        />

        {/* ===================================== */}
        {/* CONTADOR DE LIBROS LEÍDOS */}
        {/* ===================================== */}

        {user && (
          <Box
            sx={{
              mt: 3,
              mb: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'background.paper',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <MenuBookIcon
                sx={{
                  color: 'primary.main',
                  fontSize: 30,
                }}
              />

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                }}
              >
                Libros leídos
              </Typography>
            </Box>

            {loadingLibrosLeidos ? (
              <CircularProgress
                size={24}
                sx={{
                  color: 'primary.main',
                }}
              />
            ) : (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                }}
              >
                {librosLeidos ?? '—'}
              </Typography>
            )}
          </Box>
        )}

        {/* ===================================== */}
        {/* SAB-91: PROGRESO INDIVIDUAL */}
        {/* ===================================== */}

        {user ? (
          <ReadingProgress
            currentPage={currentProgress ?? 0}
            totalPages={totalPages}
            onUpdateProgress={handleUpdateProgress}
            loading={loadingProgress}
            saving={savingProgress}
            disabled={
              loadingProgress ||
              currentProgress === null
            }
          />
        ) : (
          <Alert
            severity="info"
            sx={{ mt: 3 }}
          >
            Iniciá sesión para consultar y guardar
            tu progreso de lectura.
          </Alert>
        )}

        {/* ===================================== */}
        {/* MARCAR COMO LEÍDO */}
        {/* ===================================== */}

        {user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              mt: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {leido && fechaLectura
                ? `Leído el ${formatearFecha(fechaLectura)}`
                : 'Todavía no lo marcaste como leído.'}
            </Typography>

            <Button
              startIcon={
                leido && !guardandoLectura
                  ? <CheckCircleIcon />
                  : undefined
              }
              disabled={guardandoLectura}
              onClick={handleToggleLeido}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 2.5,
              }}
            >
              {guardandoLectura ? (
                <CircularProgress
                  size={17}
                  sx={{
                    color: 'inherit',
                  }}
                />
              ) : leido ? (
                'Desmarcar como leído'
              ) : (
                'Marcar como leído'
              )}
            </Button>
          </Box>
        )}

        {/* ===================================== */}
        {/* FORMULARIO DE COMENTARIOS */}
        {/* ===================================== */}

        {showCommentBox && user && (
          <BookCommentBox
            theme={theme}
            id={id}
            user={user}
            newRating={newRating}
            newComment={newComment}
            setNewRating={setNewRating}
            setNewComment={setNewComment}
            setShowCommentBox={setShowCommentBox}
            setOpinions={setOpinions}
          />
        )}

        <Divider sx={{ my: 3 }} />

        {/* DESCRIPCIÓN DEL LIBRO */}
        <BookDescription book={book} />

        {/* ===================================== */}
        {/* DEJAR DE RECOMENDAR */}
        {/* Acción de eliminar: color="error" y confirmación */}
        {/* ===================================== */}

        {!loadingRecomendaciones &&
          puedeQuitarRecomendacion && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 2,
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                color="error"
                disabled={removingRecommendation}
                onClick={() => setIsUnrecommendConfirmOpen(true)}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 1,
                }}
              >
                {removingRecommendation ? (
                  <>
                    <CircularProgress
                      size={17}
                      sx={{
                        color: 'inherit',
                        mr: 1,
                      }}
                    />
                    Quitando...
                  </>
                ) : (
                  'Dejar de recomendar'
                )}
              </Button>
            </Box>
          )}

        {/* ===================================== */}
        {/* COMENTAR */}
        {/* Colores definidos por el tema */}
        {/* ===================================== */}

        <NavButton
          onClick={handleCommentClick}
          sx={{
            width: '100%',
            p: '12px 20px',
            borderRadius: '8px',
          }}
        >
          Comentar
        </NavButton>

        <Divider sx={{ my: 3 }} />

        {/* LISTA DE COMENTARIOS */}
        <BookOpinionList
          opinions={opinions}
          theme={theme}
        />
      </Box>

      {/* CONFIRMACIÓN PARA DEJAR DE RECOMENDAR */}
      <ConfirmationModal
        open={isUnrecommendConfirmOpen}
        onClose={() => setIsUnrecommendConfirmOpen(false)}
        onConfirm={() => {
          void handleRemoveRecommendation();
        }}
        title="Dejar de recomendar"
        message={`¿Querés dejar de recomendar "${book.titulo}"? Se va a quitar de «Nuestros recomendados».`}
      />

      {/* ===================================== */}
      {/* NOTIFICACIONES */}
      {/* Posición por defecto: abajo a la izquierda, como en el resto de la app */}
      {/* ===================================== */}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotification((prev) => ({
            ...prev,
            open: false,
          }))
        }
      >
        <Alert
          severity={notification.severity}
          onClose={() =>
            setNotification((prev) => ({
              ...prev,
              open: false,
            }))
          }
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookDetailsPage;
