// src/pages/ForumDetailsPage.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import useForumDetail from '@/hooks/useForumDetail';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/environments/api';
import type { ForumDetailComment } from '@/types';

const ForumDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { forum, loading, error } = useForumDetail(id);
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<{ severity: 'error' | 'warning' | 'success'; message: string } | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [localComments, setLocalComments] = useState<ForumDetailComment[]>([]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      setFeedback({ severity: 'warning', message: 'Debés iniciar sesión para poder comentar.' });
      return;
    }

    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/forums/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId || (user as any).usuario_id,
          content: newComment,
        }),
      });

      const data = await res.json();

      if (!res.ok || res.status === 202 || data.ok === false) {
        const errorMsg = data.mensaje || data.error || 'Error al agregar el comentario';
        const severityType = res.status === 202 || data.error === 'EN_REVISION' ? 'info' : 'error';
        setFeedback({ severity: severityType, message: errorMsg });
        setNewComment('');
        return;
      }

      setNewComment('');

      const nuevoComentario: ForumDetailComment = {
        ...data,
        userName: user.name || (user as any).nombre,
        userAvatar: user.avatarUrl ?? (user as any).avatar_url ?? null,
      };

      setLocalComments((prev) => [...prev, nuevoComentario]);
      setFeedback({ severity: 'success', message: 'Comentario agregado con éxito.' });
    } catch (err) {
      console.error(err);
      setFeedback({ severity: 'error', message: 'No se pudo agregar el comentario. Verifica la conexión con el servidor.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        maxWidth: 700,
        margin: '0 auto',
        backgroundColor: 'white',
      }}
    >
      {/* Header y menú lateral */}
      <AppHeader onMenuClick={() => setMenuOpen(true)} title="Foro" subtitle="Detalles y comentarios" />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Foro" />

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* Foro encontrado */}
      {!loading && !error && forum && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          {/* Datos del foro */}
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Avatar variant="rounded" sx={{ width: 60, height: 60, border: '1px solid #ddd' }}>
              <ForumIcon fontSize="large" />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h6" fontWeight="bold">
                {forum.title || (forum as any).titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {forum.description || (forum as any).descripcion}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Creado por: {forum.creatorName || (forum as any).creador_nombre || 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Fecha: {new Date(forum.createdAt || (forum as any).fecha_creacion || '').toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Comentarios */}
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Comentarios
          </Typography>

          {forum.comments || localComments ? (
            (forum.comments || localComments).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aún no hay comentarios en este foro.
              </Typography>
            ) : (
              <List>
                {(forum.comments || localComments).map((c: any) => (
                  <ListItem key={c.comentario_id || c.id || c.commentId} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={(c.usuario_avatar || c.avatar_url || c.userAvatar) ?? undefined} alt={c.usuario_nombre || c.nombre || c.userName || 'Usuario'}>
                        {(c.usuario_nombre || c.nombre || c.userName || 'U')?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={c.usuario_nombre || c.nombre || c.userName || 'Usuario'}
                      secondary={
                        <>
                          <Typography variant="body2">{c.contenido || c.comentario || c.content}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(c.fecha || c.createdAt || '').toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )
          ) : (
            <CircularProgress />
          )}

          {/* Formulario para agregar comentario */}
          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            {feedback && (
              <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
                {feedback.message}
              </Alert>
            )}
            <Typography variant="subtitle1" fontWeight="bold">
              Agregar un comentario
            </Typography>
            <TextField
              multiline
              minRows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              fullWidth
            />
            <Button
              variant="contained"
              color="warning" // Botón naranja
              onClick={handleAddComment}
              disabled={sending || !newComment.trim()}
            >
              {sending ? 'Enviando...' : 'Agregar comentario'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Foro no encontrado */}
      {!loading && !error && !forum && <Typography>No se encontró el foro.</Typography>}
    </Box>
  );
};

export default ForumDetailsPage;





