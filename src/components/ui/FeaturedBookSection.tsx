
import { Box, Typography } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import BookCard from './BookCard';
import type { FeaturedBook } from '@/types';
import type { ReadingStatus } from '@/hooks/useReadingStatus';

type FeaturedBookData = Partial<FeaturedBook> & {
  autor?: string;
  genero?: string;
  rating?: number;
};

interface FeaturedBookSectionProps {
  featuredBook: FeaturedBookData;
  comentarioRecomendacion?: string;
  handleFavoriteToggle: (libroId: number) => boolean | Promise<boolean>;
  isFavorite: boolean;
  handleVerMas: (libroId: number | null | undefined) => void;
  readingStatus: ReadingStatus;
  onReadingStatusChange: (status: ReadingStatus) => void;
}

export default function FeaturedBookSection({
  featuredBook,
  comentarioRecomendacion,
  handleFavoriteToggle,
  isFavorite,
  handleVerMas,
  readingStatus,
  onReadingStatusChange,
}: FeaturedBookSectionProps) {
  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="secondary"
        sx={{ mb: 2 }}
      >
        Nuestro recomendado
      </Typography>

      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #333333',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 3,
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <BookCard
            featured={true}
            image={featuredBook.portada_url}
            title={featuredBook.titulo}
            autor={featuredBook.autor}
            gender={featuredBook.genero}
            rating={
              featuredBook.calificacion_promedio ??
              featuredBook.rating
            }
            isFavorite={isFavorite}
            onFavoriteToggle={() => {
              if (!featuredBook.libro_id) return false;
              return handleFavoriteToggle(featuredBook.libro_id);
            }}
            libro_id={featuredBook.libro_id}
            readingStatus={readingStatus}
            onReadingStatusChange={onReadingStatusChange}
            onVerMas={() => handleVerMas(featuredBook.libro_id)}
          />
        </Box>

        {comentarioRecomendacion?.trim() && (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
              backgroundColor: '#fafafa',
              border: '1px solid #555555',
              borderRadius: '12px',
              padding: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              <FormatQuoteIcon sx={{ color: '#f25600' }} />

              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: '#252525' }}
              >
                Comentario de la recomendación
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: '#333333',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {comentarioRecomendacion}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
