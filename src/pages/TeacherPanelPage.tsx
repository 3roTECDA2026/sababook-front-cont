import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
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
  alpha,
  useTheme,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import RankingBar from '@/components/ui/RankingBar';
import StatCard from '@/components/ui/StatCard';
import { StyledTableCellHeader, StyledTableContainer } from '@/components/ui/StyledTable';
import { getPanelDocente } from '@/services/courseService';
import { formatDate } from '@/utils/formatDate';
import type { PanelCourse, TeacherPanel } from '@/types';

// Coincide con DIAS_ABANDONO_POR_DEFECTO del back
const DIAS_POR_DEFECTO = 30;
const OPCIONES_DIAS = [15, 30, 60, 90];

const estiloTarjeta = {
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  p: 2,
};

const etiquetaCurso = (curso: PanelCourse) =>
  `${curso.anio}°${curso.division} · ${curso.materia}`;

export default function TeacherPanelPage() {
  const theme = useTheme();
  const naranja = theme.palette.button?.main || '#f25600';

  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [dias, setDias] = useState<number>(DIAS_POR_DEFECTO);
  const [panel, setPanel] = useState<TeacherPanel | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Evita que una respuesta vieja pise a la nueva si se cambia el filtro rápido
    let cancelado = false;
    setCargando(true);
    setError(null);

    getPanelDocente(cursoId, dias)
      .then((data) => {
        if (!cancelado) setPanel(data);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el panel.');
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cursoId, dias]);

  const cursos = panel?.cursos ?? [];
  const nombreCurso = (id: number) => {
    const curso = cursos.find((c) => c.curso_id === id);
    return curso ? etiquetaCurso(curso) : '-';
  };
  const maximoLibros = panel?.libros_mas_elegidos[0]?.alumnos ?? 0;
  const maximoGeneros = panel?.generos_mas_elegidos[0]?.cantidad ?? 0;

  const chipAsignado = (
    <Chip
      label="Asignado"
      size="small"
      sx={{ ml: 1, backgroundColor: alpha(naranja, 0.15), color: naranja }}
    />
  );

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <AppHeader
        onMenuClick={() => setMenuAbierto(true)}
        title="Panel docente"
        subtitle="Cómo leen los alumnos de tus cursos"
      />
      <SideMenu open={menuAbierto} onClose={() => setMenuAbierto(false)} active="Panel docente" />

      <Box display="flex" gap={2} flexWrap="wrap" mt={2} mb={3}>
        <TextField
          select
          id="curso"
          name="curso"
          label="Curso"
          value={cursoId ?? ''}
          onChange={(e) => setCursoId(e.target.value === '' ? null : Number(e.target.value))}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          sx={{ minWidth: 240, flexGrow: 1 }}
        >
          <MenuItem value="">Todos mis cursos</MenuItem>
          {cursos.map((curso) => (
            <MenuItem key={curso.curso_id} value={curso.curso_id}>
              {etiquetaCurso(curso)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          id="dias"
          name="dias"
          label="Abandonado después de"
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
          sx={{ minWidth: 200 }}
        >
          {OPCIONES_DIAS.map((opcion) => (
            <MenuItem key={opcion} value={opcion}>
              {opcion} días en "Leyendo"
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cargando && !panel ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress sx={{ color: naranja }} />
        </Box>
      ) : panel && panel.cursos.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No tenés cursos asignados.
        </Typography>
      ) : (
        panel && (
          <Box sx={{ opacity: cargando ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            {/* Indicadores */}
            <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
              <Box flex="1 1 160px">
                <StatCard title="Alumnos" value={panel.resumen.cantidad_alumnos} />
              </Box>
              <Box flex="1 1 160px">
                <StatCard title="Libros en favoritos" value={panel.resumen.cantidad_favoritos} />
              </Box>
              <Box flex="1 1 160px">
                <StatCard
                  title={`Abandonados (+${panel.resumen.dias_abandono} días)`}
                  value={panel.resumen.cantidad_abandonados}
                />
              </Box>
            </Box>

            {/* Rankings */}
            <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
              <Paper sx={{ ...estiloTarjeta, flex: '1 1 300px' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Libros más elegidos
                </Typography>
                {panel.libros_mas_elegidos.length === 0 ? (
                  <Typography color="text.secondary">Todavía no hay favoritos.</Typography>
                ) : (
                  panel.libros_mas_elegidos.map((libro) => (
                    <RankingBar
                      key={libro.libro_id}
                      label={
                        <>
                          {libro.titulo}
                          {libro.asignado && chipAsignado}
                        </>
                      }
                      detail={`${libro.autor} · ${libro.leyendo} leyendo · ${libro.leidos} leídos`}
                      value={libro.alumnos}
                      max={maximoLibros}
                    />
                  ))
                )}
              </Paper>

              <Paper sx={{ ...estiloTarjeta, flex: '1 1 300px' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Géneros más elegidos
                </Typography>
                {panel.generos_mas_elegidos.length === 0 ? (
                  <Typography color="text.secondary">Todavía no hay favoritos.</Typography>
                ) : (
                  panel.generos_mas_elegidos.map((genero) => (
                    <RankingBar
                      key={genero.genero}
                      label={genero.genero}
                      value={genero.cantidad}
                      max={maximoGeneros}
                    />
                  ))
                )}
              </Paper>
            </Box>

            {/* Abandonados */}
            <StyledTableContainer>
              <Box p={2} pb={1}>
                <Typography variant="h6" fontWeight="bold">
                  Lecturas abandonadas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Libros que siguen en "Leyendo" hace más de {panel.resumen.dias_abandono} días.
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
                    {panel.abandonados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No hay lecturas abandonadas. ¡Bien!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      panel.abandonados.map((item) => (
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
                                  {item.asignado && chipAsignado}
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
          </Box>
        )
      )}
    </Box>
  );
}