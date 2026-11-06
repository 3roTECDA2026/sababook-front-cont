// src/components/teacherPanel/StudentScoresTable.tsx
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { StyledTableCellHeader, StyledTableContainer } from '@/components/ui/StyledTable';
import { useCourseScores } from '@/hooks/useCourseScores';

interface StudentScoresTableProps {
  cursoId: number | null;
}

export default function StudentScoresTable({ cursoId }: StudentScoresTableProps) {
  const theme = useTheme();
  const { puntajes, cargando, error } = useCourseScores(cursoId);

  if (cursoId === null) {
    return (
      <StyledTableContainer>
        <Box p={2}>
          <Typography variant="h6" fontWeight="bold">
            Puntajes de los alumnos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Elegí un curso para ver sus puntajes.
          </Typography>
        </Box>
      </StyledTableContainer>
    );
  }

  return (
    <StyledTableContainer>
      <Box p={2} pb={1}>
        <Typography variant="h6" fontWeight="bold">
          Puntajes de los alumnos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {puntajes
            ? `Puntaje anual del curso: ${puntajes.curso.puntaje_anual} puntos.`
            : 'Progreso de cada alumno en el año.'}
        </Typography>
      </Box>

      {error ? (
        <Box p={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : cargando ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={30} sx={{ color: theme.palette.button.main }} />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCellHeader>Alumno · Puntaje</StyledTableCellHeader>
                <StyledTableCellHeader align="center">Estado</StyledTableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
                {!puntajes || puntajes.alumnos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Este curso todavía no tiene alumnos inscriptos.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  puntajes.alumnos.map((alumno) => (
                    <TableRow key={alumno.usuario_id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {alumno.nombre}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {alumno.puntaje_acumulado} / {alumno.minimo_requerido}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (alumno.puntaje_acumulado / alumno.minimo_requerido) * 100,
                            100
                          )}
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {alumno.cumplido ? (
                          <Chip label="Cumplido" color="success" size="small" />
                        ) : (
                          <Chip
                            label={`Faltan ${alumno.faltante}`}
                            color="warning"
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </StyledTableContainer>
  );
}
