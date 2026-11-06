// src/components/teacherPanel/StudentScoresTable.tsx
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Switch,
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
import { useNotification } from '@/contexts/NotificationContext';

interface StudentScoresTableProps {
  cursoId: number | null;
}

export default function StudentScoresTable({ cursoId }: StudentScoresTableProps) {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const { puntajes, cargando, error, recargar, isSavingVisibility, updateScoreVisibility } =
    useCourseScores(cursoId);

  // No se muestra con los datos de otro curso: mientras carga, un clic cambiaría el curso nuevo
  const currentCourse = !cargando && puntajes?.curso.curso_id === cursoId ? puntajes.curso : null;

  const handleVisibilityChange = async (courseId: number, visible: boolean) => {
    try {
      await updateScoreVisibility(courseId, visible);
      showNotification(
        visible
          ? 'Los alumnos de este curso ahora ven su puntaje en Inicio.'
          : 'Los alumnos de este curso ya no ven su puntaje en Inicio.',
        'success'
      );
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'No se pudo cambiar la visibilidad del puntaje.',
        'error'
      );
    }
  };

  if (cursoId === null) {
    return (
      <StyledTableContainer>
        <Box p={2}>
          <Typography variant="body2" color="text.secondary">
            Elegí un curso para ver sus puntajes.
          </Typography>
        </Box>
      </StyledTableContainer>
    );
  }

  return (
    <StyledTableContainer>
      <Box
        p={2}
        pb={1}
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
      >
        <Typography variant="body2" color="text.secondary">
          {puntajes
            ? `Puntaje anual del curso: ${puntajes.curso.puntaje_anual} puntos.`
            : 'Progreso de cada alumno en el año.'}
        </Typography>
        {currentCourse && (
          <FormControlLabel
            label="Mostrar el puntaje a los alumnos en Inicio"
            control={
              <Switch
                checked={currentCourse.show_annual_score}
                disabled={isSavingVisibility}
                onChange={(e) => handleVisibilityChange(currentCourse.curso_id, e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.button.main },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.button.main,
                  },
                }}
              />
            }
          />
        )}
      </Box>

      {error ? (
        <Box p={2} display="flex" flexDirection="column" gap={1} alignItems="center">
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={recargar}>
            Reintentar
          </Button>
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
