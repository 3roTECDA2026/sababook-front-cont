// src/components/ForumCommentList.tsx
import { Box, Typography, Paper, CircularProgress, Button, TextField, IconButton } from '@mui/material';
import type { Theme } from '@mui/material';
import { useForumComments } from '../hooks/useForumComments';
import { useAuth } from '../hooks/useAuth';
import { useState, FormEvent } from 'react';
import { API_BASE_URL } from '../environments/api';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ForumComment } from '../types';

type CommentDisplay = ForumComment & {
  nombre?: string;
  contenido?: string;
  comentario?: string;
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
  const [sendError, setSendError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const { user } = useAuth() || {};
  const usuarioId = usuarioIdProp || user?.usuario_id;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    setSuccessMsg('');
    try {
      const payload = { foro_id: foroId, contenido, usuario_id: usuarioId };
      const res = await fetch(`${API_BASE_URL}/api/v1/comentario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Error al enviar el comentario');
      }
      setContenido('');
      setSuccessMsg('Comentario enviado correctamente');
      // Opcional: recargar comentarios aquí si lo deseas
      if (typeof refetch === 'function') {
        await refetch();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSendError(message);
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
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
      {!loading && Array.isArray(comments) && comments.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Aún no hay comentarios.
        </Typography>
      )}
      {(comments as CommentDisplay[])?.map((comment) => (
        <Paper
          key={comment.comentario_id}
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
                {comment.nombre || 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {comment.email || ''}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                {comment.fecha ? new Date(comment.fecha).toLocaleString() : ''}
              </Typography>
              {usuarioId && Number(comment.usuario_id) === Number(usuarioId) && (
                <IconButton
                  onClick={async () => {
                    if (window.confirm('¿Seguro que quieres eliminar este comentario?')) {
                      try {
                        const res = await fetch(
                          `${API_BASE_URL}/api/v1/comentario/${comment.comentario_id}`,
                          {
                            method: 'DELETE',
                          }
                        );
                        if (!res.ok) throw new Error('Error al eliminar el comentario');
                        if (typeof refetch === 'function') await refetch();
                      } catch (err) {
                        const message = err instanceof Error ? err.message : String(err);
                        alert(message);
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
            {comment.contenido || comment.comentario || ''}
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
                  borderColor: '#ccc', // color normal
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.button?.main, // color al pasar el mouse
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.button?.main, // borde naranja al escribir
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.palette.button?.main, // label naranja al enfocarse
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={sending || !contenido.trim()}
            sx={{
              // estilos copiados del StyledButton
              backgroundColor:
                !sending && contenido.trim() ? theme.palette.button?.main || '#f25600' : '#bbb', // gris cuando está deshabilitado
              color: '#FFFFFF',
              padding: '12px 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '30px',

              // hover
              '&:hover': {
                backgroundColor: !sending && contenido.trim() ? '#cc4800' : '#aaa', // gris más fuerte si está deshabilitado
              },
            }}
          >
            {sending ? 'Enviando...' : 'Comentar'}
          </Button>
          {sendError && (
            <Typography color="error" mt={1}>
              {sendError}
            </Typography>
          )}
          {successMsg && (
            <Typography color="success.main" mt={1}>
              {successMsg}
            </Typography>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default ForumCommentList;