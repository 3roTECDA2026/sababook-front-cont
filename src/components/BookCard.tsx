// src/components/BookCard.tsx
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Rating,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const HORIZONTAL_PADDING = 2; // (Equivale a 16px en el tema de Material-UI)

interface BookCardProps {
  image?: string;
  title?: string;
  autor?: string;
  gender?: string;
  description?: string;
  rating?: number;
  featured?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  // bookId, // Esto esta de mas
  libro_id?: number | null;
  onVerMas?: () => void;
  progress?: number;
}

export default function BookCard({
  image,
  title,
  autor,
  gender,
  description,
  rating,
  featured = false,
  isFavorite = false,
  onFavoriteToggle,
  // bookId, // Esto esta de mas
  libro_id,
}: BookCardProps) {
  const navigate = useNavigate();

  // Determinar ID del libro (usa cualquiera de los dos disponibles)
  const bookIdentifier = libro_id;

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
        bgcolor: '#ffffff',
        px: 3,
        py: 1.5,
        width: featured ? { xs: '100%', sm: 500 } : { xs: '100%', md: '48%' },
        minWidth: featured ? { xs: '100%', sm: 400 } : 0,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
        },
        mb: 2,
      }}
    >
      {/* Imagen del libro */}
      <Box
        sx={{
          position: 'relative',
          width: featured ? 145 : 110,
          height: featured ? 200 : 155,
          mr: 2,
        }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 2,
            objectFit: 'cover',
          }}
        />

        {/* Botón de favorito */}
        <IconButton
          aria-label="Toggle favorite"
          onClick={onFavoriteToggle}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            p: 0.5,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {isFavorite ? (
            <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
          ) : (
            <FavoriteBorderIcon fontSize="small" sx={{ color: 'red' }} />
          )}
        </IconButton>
      </Box>

      {/* Contenido de la tarjeta */}
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box
          sx={{
            px: HORIZONTAL_PADDING,
            pb: 1,
            pt: featured ? 4 : 6,
          }}
        >
          <Typography variant={featured ? 'h5' : 'subtitle1'} fontWeight="bold" sx={{ mb: 0.5 }}>
            {title}
          </Typography>

          {autor && (
            <Typography
              variant={featured ? 'body1' : 'body2'}
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              <b>Autor:</b> {autor}
            </Typography>
          )}
          {gender && (
            <Typography
              variant={featured ? 'body1' : 'body2'}
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              <b>Género:</b> {gender}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {description}
            </Typography>
          )}

          <Rating value={rating ?? 0} precision={0.5} readOnly size={featured ? 'medium' : 'small'} />

          {rating && (
            <Typography variant="h6" color="subtitle" fontWeight="bold" sx={{ mt: 0.2, mb: 1 }}>
              {rating.toFixed(1)}
            </Typography>
          )}
        </Box>

        {/* Botón Ver más */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 'auto',
            px: HORIZONTAL_PADDING,
            pt: 1,
            pb: 0,
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              console.log('Navigating to book details for ID:', bookIdentifier);
              if (bookIdentifier) {
                navigate(`/bookdetails/${bookIdentifier}`);
              }
            }}
            sx={{
              bgcolor: '#f25600',
              textTransform: 'none',
              fontSize: featured ? '0.9rem' : '0.8rem',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#d64500',
              },
            }}
          >
            Ver más
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}