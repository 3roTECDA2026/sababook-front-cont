// src/pages/ForumDetailsPage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";
import AppHeader from "../components/AppHeader";
import SideMenu from "../components/SideMenu";
import useForumDetail from "../hooks/useForumDetail";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../environments/api";

const ForumDetailsPage = () => {
  const { id } = useParams(); // ID del foro desde la URL
  const { foro, loading, error, refetch } = useForumDetail(id);
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/foro/${id}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: user.usuario_id,
          contenido: newComment,
        }),
      });

      if (!res.ok) throw new Error("Error al agregar el comentario");

      const addedComment = await res.json();
      setNewComment("");

      // Actualizar comentarios localmente
      if (foro?.comentarios) {
        foro.comentarios = [
          ...foro.comentarios,
          {
            ...addedComment,
            usuario_nombre: user.nombre,
            usuario_avatar: user.avatar_url,
          },
        ];
      } else {
        foro.comentarios = [
          {
            ...addedComment,
            usuario_nombre: user.nombre,
            usuario_avatar: user.avatar_url,
          },
        ];
      }

      // Forzar re-render
      refetch?.();
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar el comentario");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
        maxWidth: 700,
        margin: "0 auto",
        backgroundColor: "white",
      }}
    >
      {/* Header y menú lateral */}
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title="Foro"
        subtitle="Detalles y comentarios"
      />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Foro" />

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
      {!loading && !error && foro && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          {/* Datos del foro */}
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Avatar variant="rounded" sx={{ width: 60, height: 60, border: "1px solid #ddd" }}>
              <ForumIcon fontSize="large" />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h6" fontWeight="bold">
                {foro.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {foro.descripcion}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Creado por: {foro.creador_nombre || "Usuario"}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Fecha: {new Date(foro.fecha_creacion).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Comentarios */}
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Comentarios
          </Typography>

          {foro?.comentarios ? (
            foro.comentarios.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aún no hay comentarios en este foro.
              </Typography>
            ) : (
              <List>
                {foro.comentarios.map((c) => (
                  <ListItem key={c.comentario_id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={c.usuario_avatar} alt={c.usuario_nombre}>
                        {c.usuario_nombre?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={c.usuario_nombre}
                      secondary={
                        <>
                          <Typography variant="body2">{c.contenido}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(c.fecha).toLocaleString()}
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
              {sending ? "Enviando..." : "Agregar comentario"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Foro no encontrado */}
      {!loading && !error && !foro && (
        <Typography>No se encontró el foro.</Typography>
      )}
    </Box>
  );
};

export default ForumDetailsPage;





