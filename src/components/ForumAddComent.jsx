import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { addComment } from "../services/comments";

const ForumAddComment = ({ foroId, userId, onCommentAdded }) => {
  const [texto, setTexto] = useState("");

  const handleSend = async () => {
    if (!texto.trim()) return;

    await addComment({ foroId, userId, contenido: texto });
    setTexto("");

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

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSend}
      >
        Publicar
      </Button>
    </Box>
  );
};

export default ForumAddComment;
