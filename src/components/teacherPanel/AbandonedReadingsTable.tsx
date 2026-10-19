// Tabla de libros que siguen en "Leyendo" más días de lo esperado
import {
  Avatar,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { StyledTableCellHeader, StyledTableContainer } from '@/components/ui/StyledTable';
import { etiquetaCursoPanel } from '@/utils/course';
import { formatDate } from '@/utils/formatDate';
import AssignedChip from './AssignedChip';
import type { AbandonedBook, PanelCourse } from '@/types';

interface AbandonedReadingsTableProps {
  abandonados: AbandonedBook[];
  cursos: PanelCourse[];
  dias: number;
}

export default function AbandonedReadingsTable({
  abandonados,
  cursos,
  dias,
}: AbandonedReadingsTableProps) {
  const nombreCurso = (id: number) => {
    const curso = cursos.find((c) => c.curso_id === id);
    return curso ? etiquetaCursoPanel(curso) : '-';
  };

  return (
    <StyledTableContainer>
      <Box p={2} pb={1}>
        <Typography variant="h6" fontWeight="bold">
          Lecturas abandonadas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Libros que siguen en "Leyendo" hace más de {dias} días.
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCellHeader>Alumno</StyledTableCellHeader>
              <StyledTableCellHeader>Curso</StyledTableCellHeader>
              <StyledTableCellHeader>Libro</StyledTableCellHeader>
              <StyledTableCellHeader align="center">Leyendo desde</StyledTableCellHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {abandonados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No hay lecturas abandonadas. ¡Bien!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              abandonados.map((item) => (
                <TableRow key={`${item.usuario_id}-${item.libro_id}`} hover>
                  <TableCell>{item.alumno}</TableCell>
                  <TableCell>{nombreCurso(item.curso_id)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        variant="rounded"
                        src={item.portada_url ?? undefined}
                        alt={item.titulo}
                        sx={{ width: 32, height: 44 }}
                      >
                        <MenuBookIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.titulo}
                          {item.asignado && <AssignedChip />}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.autor}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{formatDate(item.fecha_estado)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.dias_leyendo} días
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledTableContainer>
  );
}
