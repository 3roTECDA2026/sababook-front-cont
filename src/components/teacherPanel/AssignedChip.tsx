// Marca los libros asignados a los cursos del docente
import { Chip, alpha, useTheme } from '@mui/material';

export default function AssignedChip() {
  const theme = useTheme();
  const color = theme.palette.button?.main || '#f25600';

  return (
    <Chip label="Asignado" size="small" sx={{ ml: 1, backgroundColor: alpha(color, 0.15), color }} />
  );
}
