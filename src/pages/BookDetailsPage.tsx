import { API_BASE_URL } from '@/environments/api';
import { recomendacionService } from '@/services/recomendacionService';
import ReadingProgress from '@/components/ReadingProgress';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useParams } from 'react-router-dom';

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
import PdfReaderModal, { resolvePdfUrl } from '@/components/ui/PdfReaderModal';
import { uploadPdfMaterial, adjuntarPdfLibro } from '@/services/apiService';

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

  // Estado para visualización y carga de PDF (SAB-67)
  const [pdfReaderOpen, setPdfReaderOpen] = useState(false);
  const [uploadPdfDialogOpen, setUploadPdfDialogOpen] = useState(false);
  const [pdfInputUrl, setPdfInputUrl] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [currentArchivoUrl, setCurrentArchivoUrl] = useState<string | null>(null);

  const {
    book,
    loading: bookLoading,
    error: bookError,
  } = useBookDetails(id);

  useEffect(() => {
    if (book?.archivo_url) {
      setCurrentArchivoUrl(book.archivo_url);
    }
  }, [book?.archivo_url]);

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
  // GESTIÓN DE MATERIAL PDF (SAB-67)
  // =====================================================
  const handlePdfUploadSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setNotification({
        open: true,
        message: 'El archivo seleccionado debe ser un documento PDF (.pdf)',
        severity: 'error',
      });
      return;
    }

    setPdfUploading(true);
    try {
      const res = await uploadPdfMaterial(file);
      setPdfInputUrl(res.url);
      setNotification({
        open: true,
        message: 'Archivo PDF subido correctamente',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error al subir PDF:', err);
      setNotification({
        open: true,
        message: 'Error al subir el archivo PDF',
        severity: 'error',
      });
    } finally {
      setPdfUploading(false);
    }
  };

  const handleSavePdfMaterial = async () => {
    if (!book || !pdfInputUrl.trim()) return;
    setPdfUploading(true);
    try {
      await adjuntarPdfLibro(book.libro_id, pdfInputUrl.trim());
      setCurrentArchivoUrl(pdfInputUrl.trim());
      setUploadPdfDialogOpen(false);
      setNotification({
        open: true,
        message: 'Material de lectura PDF adjuntado con éxito al libro',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error al adjuntar PDF:', err);
      setNotification({
        open: true,
        message: 'No se pudo adjuntar el PDF al libro',
        severity: 'error',
      });
    } finally {
      setPdfUploading(false);
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

        {/* MATERIAL DE LECTURA PDF (SAB-67) */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mt: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            backgroundColor: currentArchivoUrl ? '#fff9f5' : '#fafafa',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <PictureAsPdfIcon sx={{ color: '#e53935', fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Material de lectura digital
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentArchivoUrl
                  ? 'Este libro cuenta con archivo PDF disponible para leer o descargar.'
                  : 'Aún no se ha cargado el material de lectura en PDF para este libro.'}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            {currentArchivoUrl && (
              <>
                <Button
                  startIcon={<MenuBookIcon />}
                  onClick={() => setPdfReaderOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2 }}
                >
                  Leer PDF
                </Button>
                <Button
                  component="a"
                  href={resolvePdfUrl(currentArchivoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<DownloadIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2 }}
                >
                  Descargar
                </Button>
              </>
            )}

            {(isAdmin || isTeacher) && (
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => {
                  setPdfInputUrl(currentArchivoUrl || '');
                  setUploadPdfDialogOpen(true);
                }}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                {currentArchivoUrl ? 'Cambiar PDF' : 'Cargar PDF'}
              </Button>
            )}
          </Box>
        </Paper>

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
             <Button
              startIcon={leido && !guardandoLectura ? <CheckCircleIcon /> : undefined}
              disabled={guardandoLectura}
              onClick={handleToggleLeido}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2.5 }}
            >
              {guardandoLectura ? (
                <CircularProgress size={17} sx={{ color: 'inherit' }} />
              ) : leido ? (
                'Desmarcar como leído'
              ) : (
                'Marcar como leído'
              )}
            </Button>
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
            <Button
              variant="contained"
              color="primary"
              disabled={removingRecommendation}
              onClick={handleRemoveRecommendation}
              sx={{
                backgroundColor: BLUE_COLOR,
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                '&:hover': {
                  backgroundColor: '#125aa0',
                },
              }}
            >
              {removingRecommendation ? (
                <>
                  <CircularProgress
                    size={17}
                    sx={{ color: '#fff', mr: 1 }}
                  />
                  Quitando...
                </>
              ) : (
                'Dejar de recomendar'
              )}
            </Button>
          </Box>
        )}

        {/* BOTÓN NARANJA: COMENTAR */}
         <NavButton
          onClick={handleCommentClick}
          sx={{
            width: '100%',
            p: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(242, 86, 0, 0.4)',
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

      {/* MODAL LECTOR DE PDF (SAB-67) */}
      <PdfReaderModal
        open={pdfReaderOpen}
        onClose={() => setPdfReaderOpen(false)}
        pdfUrl={currentArchivoUrl}
        title={book.titulo || 'Material de lectura'}
      />

      {/* DIÁLOGO CARGA DE PDF PARA DOCENTES/ADMINISTRADORES */}
      <Dialog
        open={uploadPdfDialogOpen}
        onClose={() => setUploadPdfDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PictureAsPdfIcon sx={{ color: '#e53935' }} />
          Cargar Material de Lectura (PDF)
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Selecciona un archivo PDF desde tu dispositivo o ingresa una URL directa.
          </Typography>

          <Box mb={2.5}>
            <input
              type="file"
              accept="application/pdf,.pdf"
              id="detail-pdf-file-input"
              style={{ display: 'none' }}
              onChange={handlePdfUploadSelect}
            />
            <Button
              variant="outlined"
              component="label"
              htmlFor="detail-pdf-file-input"
              startIcon={pdfUploading ? <CircularProgress size={18} /> : <UploadFileIcon />}
              disabled={pdfUploading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {pdfUploading ? 'Subiendo archivo...' : 'Seleccionar archivo PDF local'}
            </Button>
          </Box>

          <TextField
            fullWidth
            label="URL del PDF"
            placeholder="https://ejemplo.com/material.pdf o /uploads/..."
            value={pdfInputUrl}
            onChange={(e) => setPdfInputUrl(e.target.value)}
            size="small"
            helperText="También puedes pegar un enlace directo si está alojado en internet"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setUploadPdfDialogOpen(false)}
            variant="outlined"
            disabled={pdfUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSavePdfMaterial}
            variant="contained"
            disabled={pdfUploading || !pdfInputUrl.trim()}
          >
            {pdfUploading ? 'Guardando...' : 'Guardar Material'}
          </Button>
        </DialogActions>
      </Dialog>

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