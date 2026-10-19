// Indicadores generales del panel docente
import { Box } from '@mui/material';
import StatCard from '@/components/ui/StatCard';
import type { PanelSummary } from '@/types';

interface TeacherPanelStatsProps {
  resumen: PanelSummary;
}

export default function TeacherPanelStats({ resumen }: TeacherPanelStatsProps) {
  const indicadores = [
    { titulo: 'Alumnos', valor: resumen.cantidad_alumnos },
    { titulo: 'Libros en favoritos', valor: resumen.cantidad_favoritos },
    { titulo: `Abandonados (+${resumen.dias_abandono} días)`, valor: resumen.cantidad_abandonados },
  ];

  return (
    <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
      {indicadores.map((indicador) => (
        <Box key={indicador.titulo} flex="1 1 160px">
          <StatCard title={indicador.titulo} value={indicador.valor} />
        </Box>
      ))}
    </Box>
  );
}
