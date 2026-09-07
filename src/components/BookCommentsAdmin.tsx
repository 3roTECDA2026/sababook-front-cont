// src/components/BookCommentsAdmin.tsx
import { useState, useEffect, SyntheticEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Rating,
  TextField,
  styled,
  Chip,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { API_BASE_URL } from '../environments/api';
import type { Book, OpinionAPI } from '../types';

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  marginTop: theme.spacing(3),
}));

const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
  color: theme.palette.body?.main || '#4A4C52',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  borderBottom: `2px solid ${theme.palette.grey[200]}`,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  color: '#FFFFFF',
  borderRadius: '8px',
  padding: '6px',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
}));

interface EditedComment {
  comentario: string;
  calificacion: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const BookCommentsAdmin = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  // Estados principales
  const [bookInfo, setBookInfo] = useState<Book | null>(null);
  const [comments, setComments] = useState<OpinionAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para edición
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<EditedComment>({ comentario: '', calificacion: 0 });

  // Estados para eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [commentToDelete, setCommentToDelete] = useState<OpinionAPI | null>(null);

  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Estados de loading para operaciones
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Fetch del libro y sus comentarios
  useEffect(() => {
    fetchBookAndComments();
  }, [bookId]);

  const fetchBookAndComments = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      // Fetch información del libro
      const bookRes = await fetch(`${API_BASE_URL}/api/v1/libros/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!bookRes.ok) throw new Error('Error al cargar el libro');
      const bookData: Book = await bookRes.json();
      setBookInfo(bookData);

      // Fetch comentarios del libro
      const commentsRes = await fetch(`${API_BASE_URL}/api/v1/opinion/libro/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!commentsRes.ok) throw new Error('Error al cargar los comentarios');
      const commentsData: OpinionAPI[] = await commentsRes.json();
      setComments(commentsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar edición de comentario
  const handleEditClick = (comment: OpinionAPI) => {
    setEditingCommentId(comment.opinion_id);
    setEditedComment({
      comentario: comment.comentario,
      calificacion: comment.calificacion,
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment({ comentario: '', calificacion: 0 });
  };

  // Guardar cambios de edición
  const handleSaveEdit = async (opinionId: number) => {
    setIsUpdating(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/opinion/${opinionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedComment),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el comentario');
      }

      await fetchBookAndComments();
      setEditingCommentId(null);
      setSnackbar({ open: true, message: '✅ Comentario actualizado correctamente', severity: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al actualizar:', error);
      setSnackbar({ open: true, message: `❌ Error: ${message}`, severity: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (comment: OpinionAPI) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/opinion/${commentToDelete.opinion_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar el comentario');
      }

      await fetchBookAndComments();
      setSnackbar({ open: true, message: '✅ Comentario eliminado correctamente', severity: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al eliminar:', error);
      setSnackbar({ open: true, message: `❌ Error: ${message}`, severity: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  // Cerrar diálogo de eliminación
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  // Cerrar snackbar
  const handleSnackbarClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={50} sx={{ color: '#f25600' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
        <Typography variant="h6" color="error" align="center">
          🚨 {error}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ backgroundColor: '#f25600', '&:hover': { backgroundColor: '#cc4800' } }}
          >
            Volver al Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
      {/* Header con botón de regreso e información del libro */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2, color: '#f25600' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#4A4C52">
            Administrar Comentarios
          </Typography>
          {bookInfo && (
            <Typography variant="subtitle1" color="text.secondary">
              {bookInfo.titulo} - {bookInfo.autor}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Información resumida */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label={`Total de comentarios: ${comments.length}`}
          color="primary"
          sx={{ backgroundColor: '#f25600', fontWeight: 'bold' }}
        />
      </Box>

      {/* Tabla de comentarios */}
      <StyledTableContainer>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCellHeader>Usuario</StyledTableCellHeader>
                <StyledTableCellHeader>Rol</StyledTableCellHeader>
                <StyledTableCellHeader>Calificación</StyledTableCellHeader>
                <StyledTableCellHeader>Comentario</StyledTableCellHeader>
                <StyledTableCellHeader>Fecha</StyledTableCellHeader>
                <StyledTableCellHeader align="center">Acciones</StyledTableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No hay comentarios para este libro.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => (
                  <TableRow key={comment.opinion_id} hover>
                    <TableCell>{comment.usuario_nombre || 'Usuario'}</TableCell>
                    <TableCell>{comment.usuario_rol || 'Lector'}</TableCell>
                    <TableCell>
                      {editingCommentId === comment.opinion_id ? (
                        <Rating
                          value={editedComment.calificacion}
                          onChange={(e, newValue) =>
                            setEditedComment({ ...editedComment, calificacion: newValue ?? 0 })
                          }
                          size="small"
                        />
                      ) : (
                        <Rating value={comment.calificacion} readOnly size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCommentId === comment.opinion_id ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={editedComment.comentario}
                          onChange={(e) =>
                            setEditedComment({ ...editedComment, comentario: e.target.value })
                          }
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2">{comment.comentario}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {comment.fecha ? new Date(comment.fecha).toLocaleDateString('es-ES') : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {editingCommentId === comment.opinion_id ? (
                          <>
                            <ActionButton
                              onClick={() => handleSaveEdit(comment.opinion_id)}
                              title="Guardar"
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <SaveIcon sx={{ fontSize: '1.1rem' }} />
                              )}
                            </ActionButton>
                            <ActionButton onClick={handleCancelEdit} title="Cancelar" disabled={isUpdating}>
                              <CancelIcon sx={{ fontSize: '1.1rem' }} />
                            </ActionButton>
                          </>
                        ) : (
                          <>
                            <ActionButton onClick={() => handleEditClick(comment)} title="Editar">
                              <EditIcon sx={{ fontSize: '1.1rem' }} />
                            </ActionButton>
                            <ActionButton onClick={() => handleDeleteClick(comment)} title="Eliminar">
                              <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                            </ActionButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledTableContainer>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
          </DialogContentText>
          {commentToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Usuario: {commentToDelete.usuario_nombre || 'Usuario'}
              </Typography>
              <Typography variant="body2">Comentario: {commentToDelete.comentario}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary" disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Sí, Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookCommentsAdmin;
