// src/pages/ForumDetailsPage.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  Alert,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import CommentSection from '@/components/ui/CommentSection';
import ForumAddComment from '@/components/ui/ForumAddComent';
import useForumDetail from '@/hooks/useForumDetail';
import { useAuth } from '@/hooks/useAuth';
import type { ForumDetailComment } from '@/types';

const ForumDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { foro: forum, loading, error } = useForumDetail(id);
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [localComments, setLocalComments] = useState<ForumDetailComment[]>([]);
  const [authWarning, setAuthWarning] = useState(false);

  const handleCommentAdded = (comment: ForumDetailComment) => {
    setLocalComments((prev) => [...prev, comment]);
  };

  const allComments = [...(forum?.comentarios ?? []), ...localComments];

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
      <AppHeader onMenuClick={() => setMenuOpen(true)} title="Foro" subtitle="Detalles y comentarios" />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Foro" />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && forum && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          {/* Forum header */}
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Avatar variant="rounded" sx={{ width: 60, height: 60, border: '1px solid #ddd' }}>
              <ForumIcon fontSize="large" />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h6" fontWeight="bold">
                {forum.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {forum.descripcion}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Creado por: {forum.creador_nombre ?? 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Fecha: {new Date(forum.fecha_creacion).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Comments list */}
          <CommentSection comments={allComments} />

          <Divider sx={{ my: 3 }} />

          {/* Add comment */}
          {authWarning && (
            <Alert severity="warning" onClose={() => setAuthWarning(false)} sx={{ mb: 2 }}>
              Debés iniciar sesión para poder comentar.
            </Alert>
          )}

          {user ? (
            <ForumAddComment
              forumId={id!}
              userId={user.userId ?? (user as any).usuario_id}
              userName={user.nombre}
              userAvatar={user.avatar_url ?? null}
              onCommentAdded={handleCommentAdded}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              <span
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setAuthWarning(true)}
              >
                Iniciá sesión
              </span>{' '}
              para dejar un comentario.
            </Typography>
          )}
        </Paper>
      )}

      {!loading && !error && !forum && (
        <Typography>No se encontró el foro.</Typography>
      )}
    </Box>
  );
};

export default ForumDetailsPage;
