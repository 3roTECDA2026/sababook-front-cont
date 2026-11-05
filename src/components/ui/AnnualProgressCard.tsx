// src/components/ui/AnnualProgressCard.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import StyledCard from './StyledCard';
import { getProgresoAlumno } from '@/services/courseService';
import { useAuth } from '@/hooks/useAuth';
import type { StudentProgress } from '@/types';

export default function AnnualProgressCard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [progreso, setProgreso] = useState<StudentProgress | null>(null);
  const alumnoId = user?.usuario_id;
  const anioLectivo = new Date().getFullYear();

  useEffect(() => {
    if (!alumnoId) return;

    let cancelado = false;
    getProgresoAlumno(alumnoId, anioLectivo)
      .then((data) => {
        if (!cancelado) setProgreso(data);
      })
      .catch(() => {
        if (!cancelado) setProgreso(null);
      });

    return () => {
      cancelado = true;
    };
  }, [alumnoId, anioLectivo]);

  if (!alumnoId || !progreso) return null;

  const { curso, puntaje_acumulado } = progreso;

  return (
    <StyledCard sx={{ mt: 2, mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {curso ? `${curso.anio}°${curso.division} · ${anioLectivo}` : anioLectivo}
      </Typography>
      <Box display="flex" alignItems="baseline" gap={1}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: theme.palette.button.main }}
        >
          {puntaje_acumulado}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          puntos acumulados en el año
        </Typography>
      </Box>
    </StyledCard>
  );
}
