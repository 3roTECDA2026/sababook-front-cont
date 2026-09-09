// src/components/ForumCommentsAdmin.tsx
import { useState, useEffect } from 'react';
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
import { useForumComments } from '../hooks/useForumComments';
import type { ForumComment, Forum } from '../types';

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

// Forma cruda que puede llegar del hook, con nombres alternativos
type RawComment = ForumComment & {
  id?: number;
  comentario?: string;
  usuario_nombre?: string;
  createdAt?: string;
  destacado?: boolean;
  usuario?: { id?: number };
};

// Forma ya transformada que usa este componente
interface DisplayComment {
  comentario_id: number;
  comentario: string;
  usuario_nombre: string;
  email: string;
  fecha: string;
  destacado: boolean;
  usuario_id: number | null;
}

interface EditedComment {
  comentario: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const ForumCommentsAdmin = () => {
  const { foroId } = useParams<{ foroId: string }>();
  const navigate = useNavigate();

  // Estado foro
  const [forumInfo, setForumInfo] = useState<Partial<Forum> | null>(null);
  const [loadingForum, setLoadingForum] = useState<boolean>(true);
  const [errorForum, setErrorForum] = useState<string | null>(null);

  // Estados de edición
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<EditedComment>({ comentario: '' });

  // Estados de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [commentToDelete, setCommentToDelete] = useState<DisplayComment | null>(null);

  // Estados de notificaciones
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Loading de operaciones
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Hook de comentarios
  const {
    comments: rawComments,
    loading: loadingComments,
    error: errorComments,
    refetch,
  } = useForumComments(foroId);

  const comments: DisplayComment[] = (rawComments as RawComment[]).map((c) => ({
    comentario_id: c.id ?? c.comentario_id,
    comentario: c.contenido || c.comentario || '',
    usuario_nombre: c.nombre || c.usuario_nombre || 'Usuario',
    email: c.email || '',
    fecha: c.fecha || c.createdAt || new Date().toISOString(),
    destacado: c.destacado || false,
    usuario_id: c.usuario_id ?? c.usuario?.id ?? null,
  }));

  // Fetch info del foro
  useEffect(() => {
    const fetchForum = async () => {
      setLoadingForum(true);
      setErrorForum(null);

      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/foro/${foroId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          await res.text();
          throw new Error('Error al cargar el foro');
        }

        const data = await res.json();

        setForumInfo(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('🚨 ERROR FETCH FORO:', err);
        setErrorForum(message);
      } finally {
        setLoadingForum(false);
      }
    };

    fetchForum();
  }, [foroId]);

  // Editar comentario
  const handleEditClick = (comment: DisplayComment) => {
    setEditingCommentId(comment.comentario_id);
    setEditedComment({ comentario: comment.comentario });
  };
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment({ comentario: '' });
  };
  const handleSaveEdit = async (comentarioId: number) => {
    setIsUpdating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comentario/${comentarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editedComment),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar comentario');
      }
      await refetch();
      setEditingCommentId(null);
      setSnackbar({
        open: true,
        message: '✅ Comentario actualizado correctamente',
        severity: 'success',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      setSnackbar({ open: true, message: `❌ Error: ${message}`, severity: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Eliminar comentario
  const handleDeleteClick = (comment: DisplayComment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comentario/${commentToDelete.comentario_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar comentario');
      }
      await refetch();
      setSnackbar({
        open: true,
        message: '✅ Comentario eliminado correctamente',
        severity: 'success',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      setSnackbar({ open: true, message: `❌ Error: ${message}`, severity: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Loading y errores
  if (loadingForum || loadingComments) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress size={50} sx={{ color: '#f25600' }} />
      </Box>
    );
  }

  if (errorForum) {
    return (
      <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
        <Typography variant="h6" color="error" align="center">
          🚨 {errorForum}
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2, color: '#f25600' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#4A4C52">
            Administrar Comentarios del Foro
          </Typography>
          {forumInfo && (
            <Typography variant="subtitle1" color="text.secondary">
              {forumInfo.titulo}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Resumen */}
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
                <StyledTableCellHeader>Comentario</StyledTableCellHeader>
                <StyledTableCellHeader>Fecha</StyledTableCellHeader>
                <StyledTableCellHeader align="center">Acciones</StyledTableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No hay comentarios para este foro.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => (
                  <TableRow key={comment.comentario_id} hover>
                    <TableCell>{comment.usuario_nombre || 'Usuario'}</TableCell>
                    <TableCell>
                      {editingCommentId === comment.comentario_id ? (
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
                        {editingCommentId === comment.comentario_id ? (
                          <>
                            <ActionButton
                              onClick={() => handleSaveEdit(comment.comentario_id)}
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

      {/* Diálogo eliminar */}
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

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForumCommentsAdmin;