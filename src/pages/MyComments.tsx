// src/pages/MyComments.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Avatar,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import AppHeader from '../components/AppHeader';
import SideMenu from '../components/SideMenu';
import SearchBar from '../components/SearchBar';

interface MockComment {
  id: number;
  title: string;
  author: string;
  image: string;
}

// Data simulada de comentarios
const INITIAL_COMMENT_DATA: MockComment[] = [
  { id: 1, title: 'La Resistencia', author: 'Ernesto Sabato', image: '/path/to/book1.jpg' },
  { id: 2, title: 'La campana de cristal', author: 'Silvia Plath', image: '/path/to/book2.jpg' },
  { id: 3, title: 'Apologías y rechazos', author: 'Ernesto Sabato', image: '/path/to/book3.jpg' },
];

interface CommentItemProps {
  id: number;
  title: string;
  author: string;
  image: string;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number, title: string) => void;
}

// Componente para una fila de comentario
const CommentItem = ({ id, title, author, image, onView, onEdit, onDelete }: CommentItemProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 1.5,
      px: 2,
      borderBottom: '1px solid #eee',
    }}
  >
    {/* Información del Libro y Autor */}
    <Box display="flex" alignItems="center" flexGrow={1}>
      <Avatar src={image} variant="rounded" sx={{ width: 45, height: 60, mr: 2, border: '1px solid #ddd' }} />
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {author}
        </Typography>
      </Box>
    </Box>

    {/* Botones de Acción */}
    <Box display="flex" gap={1}>
      {/* 1. BOTÓN VER */}
      <IconButton
        onClick={() => onView(id)}
        sx={{ bgcolor: '#f25600', color: '#ffffff', '&:hover': { bgcolor: 'orange.700' } }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>

      {/* 2. BOTÓN EDITAR */}
      <IconButton
        onClick={() => onEdit(id)}
        sx={{ bgcolor: '#f25600', color: '#ffffff', '&:hover': { bgcolor: 'orange.700' } }}
      >
        <EditIcon fontSize="small" />
      </IconButton>

      {/* 3. BOTÓN ELIMINAR */}
      <IconButton
        onClick={() => onDelete(id, title)}
        sx={{ bgcolor: '#f25600', color: '#ffffff', '&:hover': { bgcolor: 'orange.700' } }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

export default function MyComments() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<MockComment[]>(INITIAL_COMMENT_DATA);
  const [filteredComments, setFilteredComments] = useState<MockComment[]>(INITIAL_COMMENT_DATA);

  // Estado para el diálogo de eliminación
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [commentTitle, setCommentTitle] = useState<string>('');

  // Sincronizar filteredComments con comments
  useEffect(() => {
    setFilteredComments(comments);
  }, [comments]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredComments(comments);
      return;
    }
    const normalizedQuery = query.toLowerCase();
    const filtered = comments.filter(
      (comment) =>
        comment.title.toLowerCase().includes(normalizedQuery) ||
        comment.author.toLowerCase().includes(normalizedQuery)
    );
    setFilteredComments(filtered);
  };

  // --- MANEJO DE ACCIONES ---

  // 1. VER: Navega a la vista de detalle
  const handleViewComment = (id: number) => {
    // Asumimos que la ruta para ver un comentario es /comentarios/ID
    navigate(`/comentarios/${id}`);
    console.log(`Navegando a ver comentario ${id}`);
  };

  // 2. EDITAR: Navega al formulario de edición
  const handleEditComment = (id: number) => {
    // Asumimos que la ruta para editar es /comentarios/editar/ID
    navigate(`/comentarios/editar/${id}`);
    console.log(`Navegando a editar comentario ${id}`);
  };

  // 3. ELIMINAR: Abre el diálogo de confirmación
  const handleDeleteClick = (id: number, title: string) => {
    setCommentToDelete(id);
    setCommentTitle(title);
    setDialogOpen(true);
  };

  // 4. ELIMINAR CONFIRMADO: Cierra el diálogo y realiza la lógica de eliminación
  const handleConfirmDelete = () => {
    setDialogOpen(false);
    if (commentToDelete !== null) {
      //  AQUÍ IRÍA LA LLAMADA AL MÉTODO DELETE DE LA API
      console.log(`Eliminando comentario con ID: ${commentToDelete}`);

      // Lógica optimista/local: Eliminar el comentario de la lista de estado
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentToDelete));

      // Restablecer estados
      setCommentToDelete(null);
      setCommentTitle('');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCommentToDelete(null);
    setCommentTitle('');
  };

  return (
    <Box
      py={2}
      px={1}
      sx={{
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title="Mis Comentarios"
        subtitle="Tu voz en la comunidad lectora."
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} active="Perfil" />

      <Box mb={2}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      <Typography variant="h5" fontWeight="bold" color="text.primary" mt={3} mb={2}>
        Mis Comentarios
      </Typography>

      {/* Lista de Comentarios */}
      <Box sx={{ bgcolor: '#ffffff', borderRadius: 2, boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
        {filteredComments.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No se encontraron comentarios que coincidan con la búsqueda.
          </Typography>
        ) : (
          filteredComments.map((item) => (
            <CommentItem
              key={item.id}
              id={item.id} // Pasar el ID
              title={item.title}
              author={item.author}
              image={item.image}
              // 👈 PASAR LAS FUNCIONES DE MANEJO
              onView={handleViewComment}
              onEdit={handleEditComment}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </Box>

      {/* ------------------------------------------- */}
      {/* DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ------------------------------------------- */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{'Confirmar Eliminación'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas eliminar tu comentario sobre "{commentTitle}"? Esta acción es irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: '#4b2c15' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            autoFocus
            variant="contained"
            sx={{ bgcolor: '#f25600', '&:hover': { bgcolor: '#cc4800' } }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}