// src/components/BookDescription.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Book } from '../types';

interface BookDescriptionProps {
  book: Book & { description?: string };
}

const BookDescription = ({ book }: BookDescriptionProps) => {
  return (
    <Box textAlign="left" mt={2}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Descripción
      </Typography>
      <Typography variant="body2" paragraph color="text.secondary" sx={{ mb: 3 }}>
        {book.descripcion || book.description || 'Sin descripción disponible.'}
      </Typography>
    </Box>
  );
};

export default BookDescription;