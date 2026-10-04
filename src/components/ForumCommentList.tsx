// src/components/ForumCommentList.tsx
import { Box, Typography, Paper, CircularProgress, Button, TextField, IconButton, Alert, Snackbar } from '@mui/material';
import type { Theme } from '@mui/material';
import { useForumComments } from '@/hooks/useForumComments';
import { useAuth } from '@/hooks/useAuth';
import { useState, FormEvent } from 'react';
import { API_BASE_URL } from '@/environments/api';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ForumComment } from '@/types';

type CommentDisplay = ForumComment & {
  destacado?: boolean;
};

interface ForumCommentListProps {
  foroId: number | string | undefined;
  theme: Theme;
  usuarioId?: number;
}

const ForumCommentList = ({ foroId, theme, usuarioId: usuarioIdProp }: ForumCommentListProps) => {
  const { comments, loading, error, refetch } = useForumComments(foroId);
  const [contenido, setContenido] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ msg: string; severity: 'info' | 'error' | 'success' } | null>(null);
  const { user } = useAuth() || {};
  const usuarioId = usuarioIdProp || user?.userId;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setNotification(null);
    try {
      const payload = { foro_id: foroId, contenido, usuario_id: usuarioId };
      const res = await fetch(`${API_BASE_URL}/api/v1/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || res.status === 202 || data.ok === false) {
        const errorMsg = data.mensaje || data.error || 'Error al enviar el comentario';
        setNotification({
          msg: errorMsg,
          severity: res.status === 202 || data.error === 'EN_REVISION' ? 'info' : 'error',
        });
        setContenido('');
        return;
      }
      setContenido('');
      setNotification({ msg: 'Comentario enviado correctamente', severity: 'success' });
      if (typeof refetch === 'function') {
        await refetch();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setNotification({ msg: message, severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box textAlign="left" mt={2}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Comentarios
      </Typography>
      {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && Array.isArray(comments) && comments.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Aún no hay comentarios.
        </Typography>
      )}
      {(comments as CommentDisplay[])?.map((comment) => (
        <Paper
          key={comment.commentId}
          variant="outlined"
          sx={{
            p: 1.5,
            my: 2,
            borderRadius: '12px',
            bgcolor: theme?.palette?.common?.white,
            border: `1px solid ${theme?.palette?.grey?.[300]}`,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {comment.name || 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {comment.email || ''}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
              </Typography>
              {usuarioId && Number(comment.userId) === Number(usuarioId) && (
                <IconButton
                  onClick={async () => {
                    if (window.confirm('¿Seguro que quieres eliminar este comentario?')) {
                      try {
                        const res = await fetch(
                          `${API_BASE_URL}/api/v1/comments/${comment.commentId}`,
                          {
                            method: 'DELETE',
                          }
                        );
                        if (!res.ok) throw new Error('Error al eliminar el comentario');
                        if (typeof refetch === 'function') await refetch();
                      } catch (err) {
                        const message = err instanceof Error ? err.message : String(err);
                        setNotification({ msg: message, severity: 'error' });
                      }
                    }
                  }}
                  sx={{
                    bgcolor: theme.palette.button?.main,
                    color: '#fff',
                    '&:hover': {
                      bgcolor: theme.palette.button?.main,
                      opacity: 0.85,
                    },
                    width: 32,
                    height: 32,
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography
            variant="body2"
            mt={1}
            sx={{ fontStyle: 'italic', color: theme?.palette?.text?.primary }}
          >
            {comment.content || ''}
          </Typography>
          {comment.destacado && (
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  color: '#FF6633',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                }}
              >
                Comentario destacado
              </Typography>
            </Box>
          )}
        </Paper>
      ))}

      <form onSubmit={handleSubmit}>
        <Box mt={2}>
          {notification && (
            <Alert severity={notification.severity} sx={{ mb: 2 }}>
              {notification.msg}
            </Alert>
          )}
          <TextField
            label="Agregar comentario"
            multiline
            minRows={2}
            fullWidth
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            disabled={sending}
            required
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ccc',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.button?.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.button?.main,
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.palette.button?.main,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={sending || !contenido.trim()}
            sx={{
              backgroundColor:
                !sending && contenido.trim() ? theme.palette.button?.main || '#f25600' : '#bbb',
              color: '#FFFFFF',
              padding: '12px 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '30px',

              '&:hover': {
                backgroundColor: !sending && contenido.trim() ? '#cc4800' : '#aaa',
              },
            }}
          >
            {sending ? 'Enviando...' : 'Comentar'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ForumCommentList;