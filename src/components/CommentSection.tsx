// src/components/CommentSection.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Avatar,
  styled,
  useTheme,
} from '@mui/material';

interface HardcodedComment {
  id: number;
  user: string;
  time: string;
  text: string;
}

const COMMENTS: HardcodedComment[] = [
  {
    id: 1,
    user: 'Ana G.',
    time: 'Hace 5 horas',
    text: '¡Excelente libro! La narrativa te atrapa desde la primera página.',
  },
  {
    id: 2,
    user: 'Pedro L.',
    time: 'Ayer',
    text: 'Esperaba un poco más del final, pero la construcción de personajes es impecable.',
  },
];

const StyledSendButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
  color: '#FFFFFF',
  padding: '10px 20px',
  fontWeight: 'bold',
  borderRadius: '10px',
  textTransform: 'none',
  minWidth: '100px',
}));

const CommentBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const CommentSection = () => {
  const theme = useTheme();
  const [newComment, setNewComment] = useState<string>('');

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      console.log('Enviando comentario:', newComment);
      setNewComment('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: '12px', mt: 4 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ color: theme.palette.body?.main || '#4A4C52' }}
      >
        Comentarios ({COMMENTS.length})
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box mb={4}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Deja tu comentario
        </Typography>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Escribe aquí tu opinión o consulta..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ bgcolor: theme.palette.grey[50], borderRadius: '8px' }}
          />
          <StyledSendButton
            onClick={handleCommentSubmit}
            disabled={!newComment.trim()}
            sx={{ height: { xs: '56px', sm: 'auto' }, minWidth: { xs: '100%', sm: '120px' } }}
          >
            Enviar
          </StyledSendButton>
        </Box>
      </Box>

      <Box>
        {COMMENTS.map((comment) => (
          <CommentBox key={comment.id}>
            <Avatar
              src={`https://i.pravatar.cc/150?img=${comment.id + 10}`}
              sx={{ width: 40, height: 40 }}
            />
            <Box flexGrow={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                {comment.user}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                {comment.time}
              </Typography>
              <Typography variant="body2">{comment.text}</Typography>
            </Box>
          </CommentBox>
        ))}
      </Box>
    </Paper>
  );
};

export default CommentSection;