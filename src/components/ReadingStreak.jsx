import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';

export const ReadingStreak = ({ rachaActual = 3, recordRacha = 7 }) => {
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2.5, 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'grey.100', 
        maxWidth: 320, 
        bgcolor: 'background.paper' 
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
          Racha de Lectura
        </Typography>
        <Typography variant="h6" role="img" aria-label="fuego">🔥</Typography>
      </Box>

      <Box display="flex" alignItems="baseline" gap={1} mb={0.5}>
        <Typography variant="h3" fontWeight="900" color="warning.main">
          {rachaActual}
        </Typography>
        <Typography variant="caption" fontWeight="medium" color="text.secondary">
          días consecutivos
        </Typography>
      </Box>

      <Typography variant="caption" color="text.disabled" display="block" mb={2}>
        Récord histórico: <strong style={{ color: '#666' }}>{recordRacha} días</strong>
      </Typography>

      {/* Indicadores de días de la semana */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        pt={1.5} 
        borderTop={1} 
        borderColor="grey.100"
      >
        {diasSemana.map((dia, index) => (
          <Tooltip title={`Día ${index + 1}`} key={index} arrow>
            <Box display="flex" flex={1} flexDirection="col" alignItems="center" gap={0.5} textAlign="center">
              <Typography variant="caption" fontSize={10} color="text.disabled" fontWeight="bold">
                {dia}
              </Typography>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: index < rachaActual ? 'warning.main' : 'grey.200',
                  boxShadow: index < rachaActual ? 1 : 0
                }} 
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
};

export default ReadingStreak;
