// src/components/FeaturedBookSection.tsx
import { Box, Typography } from '@mui/material';
import BookCard from './BookCard';
import type { FeaturedBook } from '../types';
import type { ReadingStatus } from '../hooks/useReadingStatus';
// import LibroImage from '../assets/libro.jpg'

type FeaturedBookData = Partial<FeaturedBook> & {
  autor?: string;
  genero?: string;
  rating?: number;
};

interface FeaturedBookSectionProps {
  featuredBook: FeaturedBookData;
  handleFavoriteToggle: (libroId: number) => boolean | Promise<boolean>;
  isFavorite: boolean;
  handleVerMas: (libroId: number | null | undefined) => void;
  readingStatus: ReadingStatus;
  onReadingStatusChange: (status: ReadingStatus) => void;
}

export default function FeaturedBookSection({
  featuredBook,
  handleFavoriteToggle,
  isFavorite,
  handleVerMas,
  readingStatus,
  onReadingStatusChange,
}: FeaturedBookSectionProps) {
  //const bookId = featuredBook.id || featuredBook.libro_id;

  return (
    <>
      <Typography variant="h4" fontWeight="bold" color="secondary" mb={1}>
        Nuestro recomendado
      </Typography>

      <Box display="flex" justifyContent="left" mt={2} mb={3}>
        <BookCard
          featured={true}
          image={featuredBook.portada_url}
          title={featuredBook.titulo}
          autor={featuredBook.autor}
          gender={featuredBook.genero}
          rating={featuredBook.calificacion_promedio || featuredBook.rating}
          isFavorite={isFavorite}
          onFavoriteToggle={() => {
            if (!featuredBook.libro_id) return false;
            return handleFavoriteToggle(featuredBook.libro_id);
          }}
          // bookId={bookId}
          libro_id={featuredBook.libro_id}
          readingStatus={readingStatus}
          onReadingStatusChange={onReadingStatusChange}
          onVerMas={() => handleVerMas(featuredBook.libro_id)}
        />
      </Box>
    </>
  );
}