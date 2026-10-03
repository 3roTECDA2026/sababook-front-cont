// src/components/ui/FeaturedBookSection.tsx
import { Box, Typography } from '@mui/material';
import BookCard from './BookCard';
import type { FeaturedBook, Book } from '@/types';
import type { ReadingStatus } from '@/hooks/useReadingStatus';

type FeaturedBookData = Partial<FeaturedBook & Book>;

interface FeaturedBookSectionProps {
  featuredBook: FeaturedBookData;
  handleFavoriteToggle: (bookId: number) => boolean | Promise<boolean>;
  isFavorite: boolean;
  handleViewMore: (bookId: number | null | undefined) => void;
  readingStatus: ReadingStatus;
  onReadingStatusChange: (status: ReadingStatus) => void;
}

export default function FeaturedBookSection({
  featuredBook,
  handleFavoriteToggle,
  isFavorite,
  handleViewMore,
  readingStatus,
  onReadingStatusChange,
}: FeaturedBookSectionProps) {
  const currentBookId = featuredBook.bookId || featuredBook.id;

  return (
    <>
      <Typography variant="h4" fontWeight="bold" color="secondary" mb={1}>
        Nuestro recomendado
      </Typography>

      <Box display="flex" justifyContent="left" mt={2} mb={3}>
        <BookCard
          featured={true}
          image={featuredBook.coverUrl}
          title={featuredBook.title}
          author={featuredBook.author}
          genre={featuredBook.genre}
          rating={featuredBook.averageRating}
          isFavorite={isFavorite}
          onFavoriteToggle={() => {
            if (!currentBookId) return false;
            return handleFavoriteToggle(currentBookId);
          }}
          bookId={currentBookId}
          readingStatus={readingStatus}
          onReadingStatusChange={onReadingStatusChange}
          onViewMore={() => handleViewMore(currentBookId)}
        />
      </Box>
    </>
  );
}