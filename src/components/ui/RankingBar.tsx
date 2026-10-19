// Componente de ranking: etiqueta, valor y una barra cuyo largo es relativo al máximo de la lista
import type { ReactNode } from 'react';
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';

interface RankingBarProps {
  label: ReactNode;
  value: number;
  max: number;
  detail?: string;
}

export default function RankingBar({ label, value, max, detail }: RankingBarProps) {
  const theme = useTheme();

  return (
    <Box mb={1.5}>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
        <Typography variant="body2" fontWeight="bold" component="div">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Box>
      {detail && (
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      )}
      <LinearProgress
        variant="determinate"
        value={max > 0 ? (value / max) * 100 : 0}
        sx={{
          height: 8,
          borderRadius: 4,
          mt: 0.5,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            backgroundColor: theme.palette.button?.main || '#f25600',
          },
        }}
      />
    </Box>
  );
}
