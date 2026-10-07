// src/components/ForumAddComent.tsx
import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
// TODO: el módulo '../services/comments' no existe en el proyecto.
// Componente sin uso actualmente. A definir si se completa o se elimina.
// import { addComment } from "../services/comments";

interface ForumAddCommentProps {
  foroId: number | string;
  userId: number | string;
  onCommentAdded?: () => void;
}

const ForumAddComment = ({ foroId, userId, onCommentAdded }: ForumAddCommentProps) => {
  const [texto, setTexto] = useState<string>('');

  const handleSend = async () => {
    if (!texto.trim()) return;

    // await addComment({ foroId, userId, contenido: texto });
    setTexto('');

    // Avisar al padre que debe refrescar comentarios
    onCommentAdded?.();
  };

  return (
    <Box mt={2}>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe un comentario..."
      />

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSend}>
        Publicar
      </Button>
    </Box>
  );
};

export default ForumAddComment;