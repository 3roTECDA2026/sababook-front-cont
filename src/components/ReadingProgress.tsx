import React, { useState, useEffect } from 'react';
import { Box, LinearProgress, Typography, TextField, Button } from '@mui/material';

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number;
  onUpdateProgress: (newPage: number, newTotalPages?: number) => void;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  currentPage,
  totalPages,
  onUpdateProgress,
}) => {
  const [pageInput, setPageInput] = useState<string>(String(currentPage));
  const [totalInput, setTotalInput] = useState<string>(String(totalPages));

  // Sincronizar si cambian desde afuera
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    setTotalInput(String(totalPages));
  }, [totalPages]);

  const safeTotal = parseInt(totalInput, 10) > 0 ? parseInt(totalInput, 10) : (totalPages > 0 ? totalPages : 1);
  const progressPercentage = Math.min(Math.max((currentPage / safeTotal) * 100, 0), 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPage = parseInt(pageInput, 10);
    const parsedTotal = parseInt(totalInput, 10);

    if (!isNaN(parsedPage) && parsedPage >= 0) {
      onUpdateProgress(parsedPage, !isNaN(parsedTotal) ? parsedTotal : undefined);
    }
  };

  return (
    <Box sx={{ width: '100%', my: 3, p: 2, borderRadius: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Seguimiento de lectura
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Página {currentPage} de {safeTotal}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary">
          {Math.round(progressPercentage)}% completado
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#e0e0e0',
          mb: 2,
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#FF6633',
          },
        }}
      />

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Página actual"
          type="number"
          size="small"
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ width: '130px' }}
        />
        <TextField
          label="Total de páginas"
          type="number"
          size="small"
          value={totalInput}
          onChange={(e) => setTotalInput(e.target.value)}
          inputProps={{ min: 1 }}
          sx={{ width: '130px' }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: '#FF6633',
            '&:hover': { bgcolor: '#cc4800' },
            fontWeight: 'bold',
          }}
        >
          Actualizar
        </Button>
      </Box>
    </Box>
  );
};

export default ReadingProgress;