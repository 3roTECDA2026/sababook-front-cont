// src/components/ui/CommentSection.tsx
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import type { ForumDetailComment } from '@/types';

interface CommentSectionProps {
  comments: ForumDetailComment[];
  loading?: boolean;
}

const CommentSection = ({ comments, loading = false }: CommentSectionProps) => {
  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (comments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aún no hay comentarios en este foro.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Comentarios
      </Typography>

      <List disablePadding>
        {comments.map((c) => {
          const id = c.comentario_id;
          const name = c.usuario_nombre ?? 'Usuario';
          const content = c.contenido ?? '';
          const avatar = c.usuario_avatar ?? undefined;
          const date = c.fecha ?? '';

          return (
            <ListItem key={id} alignItems="flex-start" disableGutters>
              <ListItemAvatar>
                <Avatar src={avatar} alt={name}>
                  {name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={name}
                secondary={
                  <>
                    <Typography variant="body2">{content}</Typography>
                    {date && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(date).toLocaleString()}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default CommentSection;