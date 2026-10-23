import { API_BASE_URL } from '@/environments/api';
import { recomendacionService } from '@/services/recomendacionService';
import ReadingProgress from '@/components/ReadingProgress';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Snackbar,
  Typography,
  useTheme,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useParams } from 'react-router-dom';
import { AppButton } from '@/components/atoms/AppButton';

import SideMenu from '@/components/layout/SideMenu';
import AppHeader from '@/components/layout/AppHeader';
import NavButton from '@/components/ui/NavButton';
import { useAuth } from '@/hooks/useAuth';
import { useBookDetails } from '@/hooks/useBookDetails';
import { useBookOpinion } from '@/hooks/useBookOpinion';
import { useReadingStatus } from '@/hooks/useReadingStatus';
import BookDetailsHeader from '@/components/ui/BookDetailsHeader';
import BookCommentBox from '@/components/BookCommentBox';
import BookOpinionList from '@/components/ui/BookOpinionList';
import BookDescription from '@/components/ui/BookDescription';
import TriviaPlaySection from '@/components/ui/TriviaPlaySection';

const ORANGE_COLOR = '#FF6633';
const BLUE_COLOR = '#1976d2';

interface Recomendacion {
  recomendacion_id: number;
  libro_id: number;
  usuario_id: number;
  explicacion?: string;
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
  const { getReadingStatus, getReadingDate, setReadingStatus } = useReadingStatus();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [currentProgress, setCurrentProgress] = useState<number | null>(null);
  const [guardandoLectura, setGuardandoLectura] = useState(false);

  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loadingRecomendaciones, setLoadingRecomendaciones] = useState(true);
  const [removingRecommendation, setRemovingRecommendation] = useState(false);

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

            const item = recomendacion as Partial<Recomendacion>;

            return Number(item.libro_id) === Number(id);
          }
        );

        if (!controller.signal.aborted) {
          setRecomendaciones(recomendacionesLibro);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Error al cargar recomendaciones:', error);
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
  const libroEstaRecomendado = recomendaciones.length > 0;

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
  const handleRemoveRecommendation = async () => {
    if (!id || !puedeQuitarRecomendacion || removingRecommendation) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setNotification({
        open: true,
        message: 'Debés iniciar sesión para quitar una recomendación.',
        severity: 'error',
      });
      return;
    }

    setRemovingRecommendation(true);

    try {
      await recomendacionService.eliminar(Number(id), token);

      // El administrador puede eliminar todas las
      // recomendaciones del libro.
      // El docente solamente elimina la propia.
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
        message: 'La recomendación se quitó correctamente.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error al quitar recomendación:', error);

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
  // MARCAR COMO LEÍDO
  // =====================================================
  // Marcar = estado "leido"; desmarcar = volver a "general".
  // Si el libro no estaba en la biblioteca, el back lo agrega.
  const handleToggleLeido = async () => {
    if (!book || guardandoLectura) return;

    const yaLeido = getReadingStatus(book.libro_id) === 'leido';

    setGuardandoLectura(true);
    const ok = await setReadingStatus(book.libro_id, yaLeido ? 'general' : 'leido');
    setGuardandoLectura(false);

    setNotification({
      open: true,
      message: ok
        ? yaLeido
          ? 'Se quitó la marca de leído.'
          : '¡Libro marcado como leído!'
        : 'No se pudo guardar. Intentá de nuevo en un momento.',
      severity: ok ? 'success' : 'error',
    });
  };

  // =====================================================
  // COMENTARIOS
  // =====================================================
  const handleCommentClick = () => {
    if (!user) {
      setNotification({
        open: true,
        message: 'Debés iniciar sesión para comentar.',
        severity: 'error',
      });
      return;
    }

    setShowCommentBox((prev) => !prev);
  };

  const handleMenuToggle = () => setMenuOpen(true);
  const handleMenuClose = () => setMenuOpen(false);

  // =====================================================
  // PROGRESO DE LECTURA
  // =====================================================
  const handleUpdateProgress = async (newPage: number) => {
    if (!id) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/libros/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pagina_actual: newPage,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Error al actualizar el progreso.');
      }

      setCurrentProgress(newPage);
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
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

  const coverImageSrc = book.portada_url?.trim() || undefined;
  const leido = getReadingStatus(book.libro_id) === 'leido';
  const fechaLectura = getReadingDate(book.libro_id);

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
            <TriviaPlaySection bookId={book.libro_id} />
          }
        />

        <ReadingProgress
          currentPage={
            currentProgress !== null
              ? currentProgress
              : (book.pagina_actual ?? 0)
          }
          totalPages={
            book.paginas_totales && book.paginas_totales > 0
              ? book.paginas_totales
              : 100
          }
          onUpdateProgress={handleUpdateProgress}
        />

        {/* MARCAR COMO LEÍDO */}
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
            <Typography variant="body2" color="text.secondary">
              {leido && fechaLectura
                ? `Leído el ${formatearFecha(fechaLectura)}`
                : 'Todavía no lo marcaste como leído.'}
            </Typography>

            <AppButton
              variant={leido ? 'outlined' : 'primary'}
              startIcon={leido && !guardandoLectura ? <CheckCircleIcon /> : undefined}
              disabled={guardandoLectura}
              loading={guardandoLectura}
              onClick={handleToggleLeido}
              sx={{ px: 2.5 }}
            >
              {leido ? 'Desmarcar como leído' : 'Marcar como leído'}
            </AppButton>
          </Box>
        )}

        {/* FORMULARIO DE COMENTARIOS */}
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

        {/* BOTÓN AZUL: DEJAR DE RECOMENDAR */}
        {!loadingRecomendaciones && puedeQuitarRecomendacion && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 2,
              mb: 2,
            }}
          >
            <AppButton
              variant="primary"
              disabled={removingRecommendation}
              loading={removingRecommendation}
              onClick={handleRemoveRecommendation}
              sx={{
                backgroundColor: BLUE_COLOR,
                px: 2.5,
                py: 1,
                '&:hover': {
                  backgroundColor: '#125aa0',
                },
              }}
            >
              Dejar de recomendar
            </AppButton>
          </Box>
        )}

        {/* BOTÓN NARANJA: COMENTAR */}
        <NavButton
          onClick={handleCommentClick}
          sx={{
            width: '100%',
            p: '12px 20px',
            bgcolor: ORANGE_COLOR + ' !important',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '8px !important',
            boxShadow: '0 4px 10px rgba(255, 102, 51, 0.4)',
            '&:hover': {
              bgcolor: '#cc4800 !important',
            },
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

      {/* NOTIFICACIONES */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotification((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
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