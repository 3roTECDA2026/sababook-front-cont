// src/components/BookListSection.tsx
import { Box, Typography } from '@mui/material';
import BookCard from './BookCard';
import type { Book } from '../types';

type BookWithExtras = Book & {
  id?: number;
  isFavorite?: boolean;
  progress?: number;
};

interface BookListSectionProps {
  books: BookWithExtras[];
  handleFavoriteToggle: (libroId: number, isFavorite: boolean) => void;
  handleVerMas: (libroId: number) => void;
}

export default function BookListSection({
  books,
  handleFavoriteToggle,
  handleVerMas,
}: BookListSectionProps) {
  return (
    <>
      <Typography variant="h4" fontWeight="bold" color="secondary" mt={3} mb={1}>
        Destacados
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          width: '100%',
        }}
      >
        {books.map((book) => (
          <BookCard
            key={book.libro_id}
            image={book.portada_url}
            autor={book.autor}
            gender={book.genero}
            title={book.titulo}
            rating={book.calificacion_promedio}
            progress={book.progress}
            isFavorite={book.isFavorite}
            onFavoriteToggle={() => handleFavoriteToggle(book.id || book.libro_id, false)}
            // bookId={book.id} // Esto esta de mas
            libro_id={book.libro_id}
            onVerMas={() => handleVerMas(book.libro_id)}
          />
        ))}
      </Box>
    </>
  );
}