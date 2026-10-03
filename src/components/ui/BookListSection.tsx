// src/components/BookListSection.tsx
import { Box, Typography } from '@mui/material';
import BookCard from './BookCard';
import type { Book } from '@/types';

type BookWithExtras = Book & {
  id?: number;
  isFavorite?: boolean;
  progress?: number;
};

interface BookListSectionProps {
  books: BookWithExtras[];
  handleFavoriteToggle: (bookId: number, isFavorite: boolean) => void;
  handleViewMore: (bookId: number) => void;
}

export default function BookListSection({
  books,
  handleFavoriteToggle,
  handleViewMore,
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
        {books.map((book) => {
          const currentBookId = book.bookId || book.id || 0;
          return (
            <BookCard
              key={currentBookId}
              image={book.coverUrl}
              author={book.author}
              genre={book.genre}
              title={book.title}
              rating={book.averageRating}
              progress={book.progress}
              isFavorite={book.isFavorite}
              onFavoriteToggle={() => handleFavoriteToggle(currentBookId, false)}
              bookId={currentBookId}
              onViewMore={() => handleViewMore(currentBookId)}
            />
          );
        })}
      </Box>
    </>
  );
}