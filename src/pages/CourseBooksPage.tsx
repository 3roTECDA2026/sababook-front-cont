// src/pages/CourseBooksPage.tsx
import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
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
import type { AlertColor } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getCatalogoLibros } from '@/services/apiService';
import {
  getCursos,
  getLibrosDelCurso,
  asignarLibroACurso,
  actualizarPuntajeLibro,
  quitarLibroDeCurso,
} from '@/services/courseService';
import type { Book, CourseBook, CourseSummary } from '@/types';

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

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  color: '#FFFFFF',
  borderRadius: '8px',
  padding: '6px',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
}));

const estiloBotonPrincipal = {
  backgroundColor: '#f25600',
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '8px',
  '&:hover': { backgroundColor: '#cc4800' },
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

// Texto que se muestra para identificar un curso en el selector
const etiquetaCurso = (curso: CourseSummary) =>
  `${curso.anio}°${curso.division} · ${curso.anio_lectivo} · ${curso.materia.nombre}`;

// Devuelve el puntaje como entero >= 0, o null si no es válido
const parsearPuntaje = (valor: string): number | null => {
  if (valor.trim() === '') return null;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? numero : null;
};

const mensajeDeError = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.';

export default function CourseBooksPage() {
  const { isAdmin: esAdmin } = useAuth();

  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);

  // Cursos y libros
  const [cursos, setCursos] = useState<CourseSummary[]>([]);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [libros, setLibros] = useState<CourseBook[]>([]);
  const [catalogo, setCatalogo] = useState<Book[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState<boolean>(true);
  const [cargandoLibros, setCargandoLibros] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Diálogo de asignación
  const [dialogoAsignarAbierto, setDialogoAsignarAbierto] = useState<boolean>(false);
  const [libroElegido, setLibroElegido] = useState<Book | null>(null);
  const [puntajeNuevo, setPuntajeNuevo] = useState<string>('');

  // Edición de puntaje y borrado
  const [libroAEditar, setLibroAEditar] = useState<CourseBook | null>(null);
  const [puntajeEditado, setPuntajeEditado] = useState<string>('');
  const [libroAQuitar, setLibroAQuitar] = useState<CourseBook | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const mostrarMensaje = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  // Carga inicial de cursos: el docente solo ve los suyos
  useEffect(() => {
    const cargarCursos = async () => {
      setCargandoCursos(true);
      try {
        const data = await getCursos(!esAdmin);
        setCursos(data);
        if (data.length > 0) setCursoId(data[0].curso_id);
      } catch (error) {
        mostrarMensaje(mensajeDeError(error), 'error');
      } finally {
        setCargandoCursos(false);
      }
    };
    cargarCursos();
  }, [esAdmin]);

  const cargarLibros = async (id: number) => {
    setCargandoLibros(true);
    try {
      setLibros(await getLibrosDelCurso(id));
    } catch (error) {
      setLibros([]);
      mostrarMensaje(mensajeDeError(error), 'error');
    } finally {
      setCargandoLibros(false);
    }
  };

  // Cada vez que cambia el curso elegido, se recargan sus libros
  useEffect(() => {
    if (cursoId !== null) cargarLibros(cursoId);
  }, [cursoId]);

  // Libros del catálogo que todavía no están en el curso
  const librosDisponibles = catalogo.filter(
    (libro) => !libros.some((asignado) => asignado.libro_id === libro.libro_id)
  );

  const abrirDialogoAsignar = async () => {
    setLibroElegido(null);
    setPuntajeNuevo('');
    setDialogoAsignarAbierto(true);

    if (catalogo.length === 0) {
      try {
        setCatalogo(await getCatalogoLibros());
      } catch {
        mostrarMensaje('No se pudo cargar el catálogo de libros.', 'error');
      }
    }
  };

  const confirmarAsignacion = async () => {
    if (cursoId === null || !libroElegido) return;

    const puntaje = parsearPuntaje(puntajeNuevo);
    if (puntaje === null) {
      mostrarMensaje('El puntaje debe ser un número entero mayor o igual a 0.', 'warning');
      return;
    }

    setGuardando(true);
    try {
      await asignarLibroACurso(cursoId, libroElegido.libro_id, puntaje);
      setDialogoAsignarAbierto(false);
      mostrarMensaje('Libro asignado correctamente.', 'success');
      await cargarLibros(cursoId);
    } catch (error) {
      mostrarMensaje(mensajeDeError(error), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const abrirDialogoEditar = (libro: CourseBook) => {
    setLibroAEditar(libro);
    setPuntajeEditado(String(libro.puntaje));
  };

  const confirmarEdicion = async () => {
    if (cursoId === null || !libroAEditar) return;

    const puntaje = parsearPuntaje(puntajeEditado);
    if (puntaje === null) {
      mostrarMensaje('El puntaje debe ser un número entero mayor o igual a 0.', 'warning');
      return;
    }

    setGuardando(true);
    try {
      await actualizarPuntajeLibro(cursoId, libroAEditar.libro_id, puntaje);
      setLibroAEditar(null);
      mostrarMensaje('Puntaje actualizado correctamente.', 'success');
      await cargarLibros(cursoId);
    } catch (error) {
      mostrarMensaje(mensajeDeError(error), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarQuitar = async () => {
    if (cursoId === null || !libroAQuitar) return;

    setGuardando(true);
    try {
      await quitarLibroDeCurso(cursoId, libroAQuitar.libro_id);
      mostrarMensaje('Libro quitado del curso correctamente.', 'success');
      await cargarLibros(cursoId);
    } catch (error) {
      mostrarMensaje(mensajeDeError(error), 'error');
    } finally {
      setGuardando(false);
      setLibroAQuitar(null);
    }
  };

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <AppHeader
        onMenuClick={() => setMenuAbierto(true)}
        title="Libros por curso"
        subtitle={esAdmin ? 'Asigná libros a los cursos' : 'Asigná libros a tus cursos'}
      />
      <SideMenu open={menuAbierto} onClose={() => setMenuAbierto(false)} active="Libros por curso" />

      {cargandoCursos ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress sx={{ color: '#f25600' }} />
        </Box>
      ) : cursos.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          {esAdmin ? 'Todavía no hay cursos creados.' : 'No tenés cursos asignados.'}
        </Typography>
      ) : (
        <>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mt={2} mb={3}>
            <TextField
              select
              id="curso"
              name="curso"
              label="Curso"
              value={cursoId ?? ''}
              onChange={(e) => setCursoId(Number(e.target.value))}
              sx={{ minWidth: 260, flexGrow: 1 }}
            >
              {cursos.map((curso) => (
                <MenuItem key={curso.curso_id} value={curso.curso_id}>
                  {etiquetaCurso(curso)}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirDialogoAsignar}
              sx={estiloBotonPrincipal}
            >
              Asignar libro
            </Button>
          </Box>

          <StyledTableContainer>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCellHeader>Libro</StyledTableCellHeader>
                    <StyledTableCellHeader>Autor</StyledTableCellHeader>
                    <StyledTableCellHeader align="center">Puntaje</StyledTableCellHeader>
                    <StyledTableCellHeader align="center">Acciones</StyledTableCellHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cargandoLibros ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={30} sx={{ color: '#f25600' }} />
                      </TableCell>
                    </TableRow>
                  ) : libros.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Este curso todavía no tiene libros asignados.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    libros.map((libro) => (
                      <TableRow key={libro.libro_id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              variant="rounded"
                              src={libro.portada_url ?? undefined}
                              alt={libro.titulo}
                              sx={{ width: 40, height: 56 }}
                            >
                              <MenuBookIcon />
                            </Avatar>
                            <Typography variant="body2" fontWeight="bold">
                              {libro.titulo}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{libro.autor}</TableCell>
                        <TableCell align="center">{libro.puntaje}</TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <ActionButton
                              title="Editar puntaje"
                              onClick={() => abrirDialogoEditar(libro)}
                            >
                              <EditIcon sx={{ fontSize: '1.1rem' }} />
                            </ActionButton>
                            <ActionButton
                              title="Quitar del curso"
                              onClick={() => setLibroAQuitar(libro)}
                            >
                              <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                            </ActionButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledTableContainer>
        </>
      )}

      {/* Diálogo para asignar un libro */}
      <Dialog
        open={dialogoAsignarAbierto}
        onClose={() => !guardando && setDialogoAsignarAbierto(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Asignar libro al curso</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Autocomplete
              id="libro-a-asignar"
              options={librosDisponibles}
              value={libroElegido}
              onChange={(_, valor) => setLibroElegido(valor)}
              getOptionLabel={(libro) => `${libro.titulo} — ${libro.autor}`}
              isOptionEqualToValue={(a, b) => a.libro_id === b.libro_id}
              noOptionsText="No hay libros disponibles"
              renderInput={(params) => <TextField {...params} name="libro" label="Libro" />}
            />
            <TextField
              id="puntaje-nuevo"
              name="puntaje"
              label="Puntaje"
              type="number"
              value={puntajeNuevo}
              onChange={(e) => setPuntajeNuevo(e.target.value)}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDialogoAsignarAbierto(false)}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmarAsignacion}
            disabled={guardando || !libroElegido}
            sx={estiloBotonPrincipal}
          >
            {guardando ? <CircularProgress size={22} color="inherit" /> : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar el puntaje */}
      <Dialog
        open={libroAEditar !== null}
        onClose={() => !guardando && setLibroAEditar(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Editar puntaje</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {libroAEditar?.titulo}
          </Typography>
          <TextField
            id="puntaje-editado"
            name="puntaje"
            label="Puntaje"
            type="number"
            fullWidth
            value={puntajeEditado}
            onChange={(e) => setPuntajeEditado(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setLibroAEditar(null)} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmarEdicion}
            disabled={guardando}
            sx={estiloBotonPrincipal}
          >
            {guardando ? <CircularProgress size={22} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación para quitar un libro */}
      <ConfirmationModal
        open={libroAQuitar !== null}
        onClose={() => setLibroAQuitar(null)}
        onConfirm={confirmarQuitar}
        title="Quitar libro del curso"
        message={libroAQuitar ? `¿Querés quitar "${libroAQuitar.titulo}" de este curso?` : ''}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}