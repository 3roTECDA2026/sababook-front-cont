// src/components/ui/ForumAddComent.tsx
import { useState } from 'react';
import { Box, Button, TextField, Alert, Typography } from '@mui/material';
import { API_BASE_URL } from '@/environments/api';
import type { ForumDetailComment } from '@/types';

const MAX_COMMENT_LENGTH = 250;

interface ForumAddCommentProps {
  forumId: number | string;
  userId: number | string;
  userName?: string;
  userAvatar?: string | null;
  onCommentAdded?: (comment: ForumDetailComment) => void;
}

const ForumAddComment = ({
  forumId,
  userId,
  userName,
  userAvatar,
  onCommentAdded,
}: ForumAddCommentProps) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    severity: 'error' | 'warning' | 'success' | 'info';
    message: string;
  } | null>(null);

  const handleSend = async () => {
    if (!text.trim() || text.length > MAX_COMMENT_LENGTH) return;

    setSending(true);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/forums/${forumId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content: text }),
      });

      const data = await res.json();

      if (!res.ok || res.status === 202 || data.ok === false) {
        const severity =
          res.status === 202 || data.error === 'EN_REVISION' ? 'info' : 'error';
        setFeedback({ severity, message: data.mensaje || data.error || 'Error al agregar el comentario' });
        setText('');
        return;
      }

      const newComment: ForumDetailComment = {
        ...data,
        userName,
        userAvatar: userAvatar ?? null,
      };

      setText('');
      setFeedback({ severity: 'success', message: 'Comentario agregado con éxito.' });
      onCommentAdded?.(newComment);
    } catch {
      setFeedback({
        severity: 'error',
        message: 'No se pudo agregar el comentario. Verificá la conexión con el servidor.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {feedback && (
        <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Typography variant="subtitle1" fontWeight="bold">
        Agregar un comentario
      </Typography>

      <TextField
        multiline
        minRows={2}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
        placeholder="Escribe tu comentario..."
        inputProps={{ maxLength: MAX_COMMENT_LENGTH }}
        helperText={
          <Typography
            component="span"
            variant="caption"
            color={text.length >= MAX_COMMENT_LENGTH ? 'error' : 'text.secondary'}
          >
            {text.length} / {MAX_COMMENT_LENGTH}
          </Typography>
        }
      />

      <Button
        variant="contained"
        color="warning"
        onClick={handleSend}
        disabled={sending || !text.trim() || text.length > MAX_COMMENT_LENGTH}
      >
        {sending ? 'Enviando...' : 'Publicar comentario'}
      </Button>
    </Box>
  );
};

export default ForumAddComment;