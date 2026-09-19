// src/pages/BookPreview.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../environments/api';
import MenuIcon from '@mui/icons-material/Menu';
import moment from 'moment';
import 'moment/locale/es';
import type { Book } from '../types';

moment.locale('es');

type BookWithAliases = Book & {
  id?: number;
  title?: string;
  image?: string;
  description?: string;
};

interface BookPreviewProps {
  book?: BookWithAliases | null;
  onCommentClick?: (book: BookWithAliases | null) => void;
}

const BookPreview = ({ book: propBook, onCommentClick }: BookPreviewProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookWithAliases | null>(propBook || null);
  const [loading, setLoading] = useState<boolean>(!propBook);

  useEffect(() => {
    if (!propBook && id) {
      fetch(`${API_BASE_URL}/api/v1/libros/${id}`)
        .then((res) => res.json())
        .then((data: BookWithAliases) => {
          setBook(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error cargando libro:', err);
          setLoading(false);
        });
    } else if (propBook) {
      setBook(propBook);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, propBook]);

  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick(book);
    } else {
      navigate(`/book/${book?.id || book?.libro_id || id}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography>Cargando libro...</Typography>
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography>Libro no encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, maxWidth: '100%', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <IconButton sx={{ mr: 2, color: 'text.primary' }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '2rem' }}>
          Bienvenida, Lucia
        </Typography>
      </Box>

      {/* Fecha */}
      <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary', fontSize: '0.8rem' }}>
        {new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>

      {/* Bloque imagen+título centrado */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row', // siempre fila
          alignItems: 'center', // centra verticalmente el título
          justifyContent: 'center', // centra bloque horizontalmente
          gap: 2,
          mb: 3,
          maxWidth: 700, // limita ancho del bloque
          mx: 'auto', // centra horizontalmente
        }}
      >
        {/* Imagen */}
        <Box sx={{ width: 300, flexShrink: 0, borderRadius: 2, overflow: 'hidden' }}>
          <img
            src={book?.portada_url || book?.image || 'https://via.placeholder.com/300x400'}
            alt={`Portada de ${book?.titulo || book?.title || 'Libro'}`}
            style={{
              width: '100%',
              height: 400,
              objectFit: 'contain',
              backgroundColor: '#f5f5f5',
            }}
          />
        </Box>

        {/* Título */}
        <Box sx={{ flex: 1, textAlign: 'left' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'secondary.main' }}>
            {book?.titulo || book?.title || 'Título del libro'}
          </Typography>
        </Box>
      </Box>

      {/* Botón centrado */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCommentClick}
          sx={{
            width: '80%',
            display: 'block',
            mx: 'auto',
            py: 0.5,
            px: 1,
            fontSize: '0.8rem',
            borderRadius: 4,
            fontWeight: 'bold',
            backgroundColor: 'button.main',
            color: '#fff',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'primary.main',
              boxShadow: '0px 4px 20px rgba(0,0,0,0.3)',
            },
          }}
        >
          Comentar
        </Button>
      </Box>

      {/* Descripción centrada */}
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 'bold', fontSize: '1rem', color: 'secondary.main', textAlign: 'center' }}
      >
        Descripción
      </Typography>
      <Typography
        variant="body1"
        sx={{ lineHeight: 1.6, fontSize: '0.95rem', color: 'body.main', textAlign: 'center' }}
      >
        {book?.descripcion ||
          book?.description ||
          'Esta es la descripción completa del libro. Aquí se puede incluir sinopsis, detalles del contenido, o cualquier información que ayude a que quien lo vea decida si quiere leerlo.'}
      </Typography>
    </Box>
  );
};

export default BookPreview;