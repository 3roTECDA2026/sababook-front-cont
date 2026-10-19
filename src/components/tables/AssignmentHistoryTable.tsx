// src/components/tables/AssignmentHistoryTable.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { getHistorialAsignaciones } from '@/services/courseService';
import type { AccionAsignacion, AssignmentHistoryEntry, CourseSummary } from '@/types';

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  marginTop: theme.spacing(1),
}));

const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
  color: theme.palette.body?.main || '#4A4C52',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  borderBottom: `2px solid ${theme.palette.grey[200]}`,
}));

// Texto y color del chip de cada acción
const ETIQUETAS_ACCION: Record<AccionAsignacion, { texto: string; color: 'success' | 'info' | 'default' }> = {
  ASIGNADO: { texto: 'Asignado', color: 'success' },
  PUNTAJE_ACTUALIZADO: { texto: 'Puntaje actualizado', color: 'info' },
  QUITADO: { texto: 'Quitado', color: 'default' },
};

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface AssignmentHistoryTableProps {
  cursos: CourseSummary[];
  onError: (mensaje: string) => void;
}

export default function AssignmentHistoryTable({ cursos, onError }: AssignmentHistoryTableProps) {
  // Años lectivos disponibles según los cursos, del más reciente al más viejo
  const anios = Array.from(new Set(cursos.map((curso) => curso.anio_lectivo))).sort((a, b) => b - a);

  const [anioLectivo, setAnioLectivo] = useState<number | ''>(anios[0] ?? '');
  const [cursoId, setCursoId] = useState<number | ''>('');
  const [registros, setRegistros] = useState<AssignmentHistoryEntry[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  const cursosDelAnio = cursos.filter(
    (curso) => anioLectivo === '' || curso.anio_lectivo === anioLectivo
  );

  // Se recarga el historial cada vez que cambia un filtro
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await getHistorialAsignaciones({
          anio_lectivo: anioLectivo === '' ? undefined : anioLectivo,
          curso_id: cursoId === '' ? undefined : cursoId,
        });
        setRegistros(data);
      } catch (error) {
        setRegistros([]);
        onError(error instanceof Error ? error.message : 'No se pudo cargar el historial.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [anioLectivo, cursoId]);

  return (
    <Box>
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <TextField
          select
          id="historial-anio"
          name="anio_lectivo"
          label="Año lectivo"
          value={anioLectivo}
          onChange={(e) => {
            const valor = e.target.value;
            setAnioLectivo(valor === '' ? '' : Number(valor));
            setCursoId('');
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {anios.map((anio) => (
            <MenuItem key={anio} value={anio}>
              {anio}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          id="historial-curso"
          name="curso"
          label="Curso"
          value={cursoId}
          onChange={(e) => {
            const valor = e.target.value;
            setCursoId(valor === '' ? '' : Number(valor));
          }}
          sx={{ minWidth: 220, flexGrow: 1 }}
        >
          <MenuItem value="">Todos los cursos</MenuItem>
          {cursosDelAnio.map((curso) => (
            <MenuItem key={curso.curso_id} value={curso.curso_id}>
              {`${curso.anio}°${curso.division} · ${curso.anio_lectivo}`}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <StyledTableContainer>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCellHeader>Fecha</StyledTableCellHeader>
                <StyledTableCellHeader>Acción</StyledTableCellHeader>
                <StyledTableCellHeader>Libro</StyledTableCellHeader>
                <StyledTableCellHeader>Curso</StyledTableCellHeader>
                <StyledTableCellHeader align="center">Puntaje</StyledTableCellHeader>
                <StyledTableCellHeader>Realizado por</StyledTableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} sx={{ color: '#f25600' }} />
                  </TableCell>
                </TableRow>
              ) : registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay movimientos para los filtros elegidos.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => {
                  const etiqueta = ETIQUETAS_ACCION[registro.accion];
                  return (
                    <TableRow key={registro.historial_id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatearFecha(registro.fecha)}</TableCell>
                      <TableCell>
                        <Chip label={etiqueta.texto} color={etiqueta.color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {registro.libro.titulo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {registro.libro.autor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {`${registro.curso.anio}°${registro.curso.division} · ${registro.anio_lectivo}`}
                      </TableCell>
                      <TableCell align="center">{registro.puntaje ?? '—'}</TableCell>
                      <TableCell>{registro.usuario?.nombre ?? 'Sin registro'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledTableContainer>
    </Box>
  );
}