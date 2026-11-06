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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import AssignmentHistoryTable from '@/components/tables/AssignmentHistoryTable';
import PdfReaderModal from '@/components/ui/PdfReaderModal';
import PaginationControls from '@/components/ui/PaginationControls';
import { getCatalogoLibros } from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import {
  getCursos,
  getLibrosDelCurso,
  asignarLibroACurso,
  actualizarPuntajeLibro,
  actualizarPuntajeAnual,
  quitarLibroDeCurso,
  getAsignacionesAnteriores,
} from '@/services/courseService';
import StudentScoresTable from '@/components/teacherPanel/StudentScoresTable';
import type { Book, CourseBook, CourseSummary, PreviousAssignment } from '@/types';

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
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '8px',
};

// Cantidad de libros por página en la tabla del curso
const BOOKS_PER_PAGE = 10;

type Pestana = 'libros' | 'historial' | 'puntajes';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

// Texto que se muestra para identificar un curso en el selector
const etiquetaCurso = (curso: CourseSummary) =>
  `${curso.anio}°${curso.division} · ${curso.anio_lectivo} · ${curso.materia.nombre}`;

const parsearPuntaje = (valor: string): { valido: boolean; puntaje: number | null } => {
  if (valor.trim() === '') return { valido: true, puntaje: null };
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    return { valido: false, puntaje: null };
  }
  return { valido: true, puntaje: numero };
};

const parsearPuntajeAnual = (valor: string): number | null => {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 140 && numero <= 200 ? numero : null;
};

const mensajeDeError = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.';

export default function CourseBooksPage() {
  // El rol sale del contexto de autenticación, no del localStorage
  const { isAdmin: esAdmin, loading: cargandoUsuario } = useAuth();

  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [pestana, setPestana] = useState<Pestana>('libros');

  // Cursos y libros
  const [cursos, setCursos] = useState<CourseSummary[]>([]);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [libros, setLibros] = useState<CourseBook[]>([]);
  const [catalogo, setCatalogo] = useState<Book[]>([]);
  // Paginado de la tabla de libros
  const [page, setPage] = useState<number>(1);
  const [cargandoCursos, setCargandoCursos] = useState<boolean>(true);
  const [cargandoLibros, setCargandoLibros] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Diálogo de asignación
  const [dialogoAsignarAbierto, setDialogoAsignarAbierto] = useState<boolean>(false);
  const [libroElegido, setLibroElegido] = useState<Book | null>(null);
  const [puntajeNuevo, setPuntajeNuevo] = useState<string>('');

  // Alerta de asignaciones en años anteriores (null = diálogo cerrado)
  const [asignacionesAnteriores, setAsignacionesAnteriores] = useState<PreviousAssignment[] | null>(
    null
  );

  // Edición de puntaje y borrado
  const [libroAEditar, setLibroAEditar] = useState<CourseBook | null>(null);
  const [puntajeEditado, setPuntajeEditado] = useState<string>('');
  const [libroAQuitar, setLibroAQuitar] = useState<CourseBook | null>(null);

  const [dialogoPuntajeAnualAbierto, setDialogoPuntajeAnualAbierto] = useState<boolean>(false);
  const [puntajeAnualEditado, setPuntajeAnualEditado] = useState<string>('');

  // Lector de PDF para material de lectura (SAB-67)
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfBookId, setSelectedPdfBookId] = useState<number | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const mostrarMensaje = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  // Carga inicial de cursos: el docente solo ve los suyos.
  // Espera a que el contexto termine de cargar el usuario para conocer su rol.
  useEffect(() => {
    if (cargandoUsuario) return;

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
  }, [esAdmin, cargandoUsuario]);

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

  // Cada vez que cambia el curso elegido, se recargan sus libros y se vuelve a la primera página
  useEffect(() => {
    setPage(1);
    if (cursoId !== null) cargarLibros(cursoId);
  }, [cursoId]);

  // Paginado en el front: el curso trae todos sus libros y se muestran de a BOOKS_PER_PAGE
  const totalPages = Math.max(1, Math.ceil(libros.length / BOOKS_PER_PAGE));
  // Si se quita el último libro de la última página, se queda en la anterior
  const currentPage = Math.min(page, totalPages);
  const visibleBooks = libros.slice(
    (currentPage - 1) * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE
  );

  // Libros del catálogo que todavía no están en el curso
  const librosDisponibles = catalogo.filter(
    (libro) => !libros.some((asignado) => asignado.libro_id === libro.libro_id)
  );

  const cursoSeleccionado = cursos.find((curso) => curso.curso_id === cursoId) ?? null;

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

  // Asigna el libro elegido al curso (después de pasar por la alerta, si hubo)
  const realizarAsignacion = async () => {
    if (cursoId === null || !libroElegido) return;

    const { valido, puntaje } = parsearPuntaje(puntajeNuevo);
    if (!valido) return;

    setGuardando(true);
    try {
      await asignarLibroACurso(cursoId, libroElegido.libro_id, puntaje);
      setAsignacionesAnteriores(null);
      setDialogoAsignarAbierto(false);
      mostrarMensaje('Libro asignado correctamente.', 'success');
      await cargarLibros(cursoId);
    } catch (error) {
      mostrarMensaje(mensajeDeError(error), 'error');
    } finally {
      setGuardando(false);
    }
  };

  // Valida el puntaje y, antes de asignar, revisa si el libro ya se usó
  // en años anteriores: si es así, muestra la alerta para confirmar
  const confirmarAsignacion = async () => {
    if (cursoId === null || !libroElegido) return;

    const { valido } = parsearPuntaje(puntajeNuevo);
    if (!valido) {
      mostrarMensaje('El puntaje debe ser un número entero entre 1 y 100.', 'warning');
      return;
    }

    setGuardando(true);
    try {
      const anteriores = await getAsignacionesAnteriores(cursoId, libroElegido.libro_id);
      if (anteriores.length > 0) {
        setAsignacionesAnteriores(anteriores);
        setGuardando(false);
        return;
      }
    } catch {
      // Si no se pudo consultar, no se bloquea la asignación: la alerta es informativa
    }
    setGuardando(false);

    await realizarAsignacion();
  };

  const abrirDialogoEditar = (libro: CourseBook) => {
    setLibroAEditar(libro);
    setPuntajeEditado(libro.puntaje === null ? '' : String(libro.puntaje));
  };

  const confirmarEdicion = async () => {
    if (cursoId === null || !libroAEditar) return;

    const { valido, puntaje } = parsearPuntaje(puntajeEditado);
    if (!valido) {
      mostrarMensaje('El puntaje debe ser un número entero entre 1 y 100.', 'warning');
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

  const abrirDialogoPuntajeAnual = () => {
    setPuntajeAnualEditado(String(cursoSeleccionado?.puntaje_anual ?? 140));
    setDialogoPuntajeAnualAbierto(true);
  };

  const confirmarPuntajeAnual = async () => {
    if (cursoId === null) return;

    const puntajeAnual = parsearPuntajeAnual(puntajeAnualEditado);
    if (puntajeAnual === null) {
      mostrarMensaje('El puntaje anual debe ser un número entero entre 140 y 200.', 'warning');
      return;
    }

    setGuardando(true);
    try {
      const curso = await actualizarPuntajeAnual(cursoId, puntajeAnual);
      setCursos((prev) =>
        prev.map((c) =>
          c.curso_id === curso.curso_id ? { ...c, puntaje_anual: curso.puntaje_anual } : c
        )
      );
      setDialogoPuntajeAnualAbierto(false);
      mostrarMensaje('Puntaje anual actualizado correctamente.', 'success');
    } catch (error) {
      mostrarMensaje(mensajeDeError(error), 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <AppHeader
        onMenuClick={() => setMenuAbierto(true)}
        title="Libros por curso"
        subtitle={esAdmin ? 'Asigná libros a los cursos' : 'Asigná libros a tus cursos'}
      />
      <SideMenu
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        active="Libros por curso"
      />

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
          <Tabs
            value={pestana}
            onChange={(_, valor: Pestana) => setPestana(valor)}
            sx={{
              mt: 2,
              mb: 3,
              '& .MuiTabs-indicator': { backgroundColor: '#f25600' },
              '& .MuiTab-root.Mui-selected': { color: '#f25600' },
            }}
          >
            <Tab
              value="libros"
              label="Libros del curso"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            />
            <Tab
              value="historial"
              label="Historial"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            />
            <Tab
              value="puntajes"
              label="Puntajes de alumnos"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            />
          </Tabs>

          {pestana !== 'historial' && cursoSeleccionado && (
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={3}>
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

              {esAdmin ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={abrirDialogoPuntajeAnual}
                  sx={estiloBotonPrincipal}
                >
                  Puntaje anual: {cursoSeleccionado?.puntaje_anual ?? 140}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Puntaje anual: {cursoSeleccionado?.puntaje_anual ?? 140}
                </Typography>
              )}
            </Box>
          )}

          {pestana === 'historial' ? (
            <AssignmentHistoryTable
              cursos={cursos}
              onError={(mensaje) => mostrarMensaje(mensaje, 'error')}
            />
          ) : pestana === 'puntajes' ? (
            <>
              {cursoSeleccionado && (
                <Box p={2}>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Curso: {etiquetaCurso(cursoSeleccionado)}
                  </Typography>
                </Box>
              )}
              <StudentScoresTable cursoId={cursoId} />
            </>
          ) : (
            <>
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={3}>
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
                        visibleBooks.map((libro) => (
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
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {libro.titulo}
                                  </Typography>
                                  {libro.pdf_path && (
                                    <Box
                                      component="span"
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        fontSize: '0.75rem',
                                        color: 'error.main',
                                        cursor: 'pointer',
                                        mt: 0.3,
                                      }}
                                      onClick={() => {
                                        setSelectedPdfBookId(libro.libro_id);
                                        setSelectedPdfTitle(libro.titulo);
                                        setPdfModalOpen(true);
                                      }}
                                    >
                                      <PictureAsPdfIcon sx={{ fontSize: '0.9rem' }} />
                                      Material PDF disponible
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{libro.autor}</TableCell>
                            <TableCell align="center">
                              {libro.puntaje ?? 'Sin puntaje'}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center">
                                {libro.pdf_path && (
                                  <ActionButton
                                    title="Leer material PDF"
                                    onClick={() => {
                                      setSelectedPdfBookId(libro.libro_id);
                                      setSelectedPdfTitle(libro.titulo);
                                      setPdfModalOpen(true);
                                    }}
                                  >
                                    <PictureAsPdfIcon sx={{ fontSize: '1.1rem' }} />
                                  </ActionButton>
                                )}
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

              <PaginationControls
                page={currentPage}
                totalPages={totalPages}
                onChange={setPage}
                disabled={cargandoLibros}
              />
            </>
          )}
        </>
      )}
    </Box>
  );
}
