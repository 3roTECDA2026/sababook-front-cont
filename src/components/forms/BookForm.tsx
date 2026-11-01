
import { useState, useEffect } from 'react';
import type {
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
} from 'react';

import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  TextareaAutosize,
  styled,
  useTheme,
  Paper,
  Grid,
} from '@mui/material';

import type { SelectChangeEvent } from '@mui/material';
import type { Book } from '@/types';

const GENEROS = [
  'Novela',
  'Ficción',
  'Ciencia Ficción',
  'Poesía',
  'Ensayo',
  'Biografía',
];

const NIVELES_EDUCATIVOS = ['Básico', 'Superior'];

interface BookFormData {
  libro_id?: number;
  titulo: string;
  autor: string;
  genero: string;
  nivel_educativo: string;
  descripcion: string;
  paginas_totales: number | null;
  imagenUrl?: string;
  portada_url?: string;
  id?: number;
  [key: string]: unknown;
}

const INITIAL_BOOK_DATA: BookFormData = {
  libro_id: undefined,
  titulo: '',
  autor: '',
  genero: '',
  nivel_educativo: '',
  descripcion: '',
  paginas_totales: null,
  imagenUrl: '',
};

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  maxWidth: '900px',
  maxHeight: '90vh',
  overflowY: 'auto',
}));

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  minHeight: '100px',
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[400]}`,
  borderRadius: '4px',
  fontFamily: theme.typography.fontFamily,
  fontSize: '1rem',
  resize: 'vertical',
  '&:focus': {
    borderColor: theme.palette.primary.main,
    outline: 'none',
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

type BookToEdit = Partial<Book> & {
  imagenUrl?: string;
};

interface BookFormProps {
  bookToEdit?: BookToEdit | null;
  onSave: (payload: BookFormData) => Promise<void> | void;
  onCancel: () => void;
  title?: string;
}

const BookForm = ({
  bookToEdit,
  onSave,
  onCancel,
  title,
}: BookFormProps) => {
  const theme = useTheme();

  const [formData, setFormData] = useState<BookFormData>({
    ...INITIAL_BOOK_DATA,
  });

  // SAB-123: controlar si se informa cantidad de páginas.
  const [agregarPaginas, setAgregarPaginas] = useState(false);
  const [paginasInput, setPaginasInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (bookToEdit) {
      const paginas = bookToEdit.paginas_totales;

      const tienePaginas =
        typeof paginas === 'number' &&
        Number.isSafeInteger(paginas) &&
        paginas > 0;

      const mappedData: BookFormData = {
        ...INITIAL_BOOK_DATA,
        ...bookToEdit,
        libro_id: bookToEdit.libro_id,
        paginas_totales: tienePaginas ? paginas : null,
        imagenUrl:
          bookToEdit.imagenUrl ||
          bookToEdit.portada_url ||
          '',
      };

      setFormData(mappedData);
      setAgregarPaginas(tienePaginas);
      setPaginasInput(tienePaginas ? String(paginas) : '');
    } else {
      setFormData({ ...INITIAL_BOOK_DATA });
      setAgregarPaginas(false);
      setPaginasInput('');
    }

    setPageError('');
  }, [bookToEdit]);

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SAB-123: habilitar o deshabilitar las páginas.
  const handleTogglePaginas = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;

    setAgregarPaginas(checked);
    setPageError('');

    if (!checked) {
      setPaginasInput('');
      setFormData((prev) => ({
        ...prev,
        paginas_totales: null,
      }));
    }
  };

  const handlePagesChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    setPaginasInput(value);

    setFormData((prev) => ({
      ...prev,
      paginas_totales: value === '' ? null : Number(value),
    }));

    setPageError('');
  };

  const handleFormSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    let paginas: number | null = null;

    // SAB-123: validar solamente si se eligió agregar páginas.
    if (agregarPaginas) {
      const valor = paginasInput.trim();
      const numero = Number(valor);

      if (
        valor === '' ||
        !Number.isSafeInteger(numero) ||
        numero <= 0 ||
        numero > 2147483647
      ) {
        setPageError(
          'Ingresá un número entero de páginas mayor que cero.'
        );
        return;
      }

      paginas = numero;
    }

    setPageError('');
    setLoading(true);

    const payload: BookFormData = {
      ...formData,
      paginas_totales: paginas,
    };

    delete payload.id;

    if (payload.imagenUrl !== undefined) {
      payload.portada_url = payload.imagenUrl;
    }

    delete payload.imagenUrl;

    if (bookToEdit?.libro_id) {
      payload.libro_id = bookToEdit.libro_id;
    } else {
      delete payload.libro_id;
    }

    try {
      await onSave(payload);
    } catch (error) {
      console.error('Error al guardar el libro:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTitle =
    title ||
    (bookToEdit
      ? 'Editar Libro'
      : 'Crear Nuevo Libro');

  const bookIdentifier = bookToEdit?.libro_id
    ? ` (ID: ${bookToEdit.libro_id})`
    : '';

  return (
    <form onSubmit={handleFormSubmit}>
      <FormContainer>
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color:
                theme.palette.body?.main ||
                '#4A4C52',
            }}
          >
            {currentTitle}
            {bookIdentifier}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box mb={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
              >
                Título
              </Typography>

              <TextField
                name="titulo"
                fullWidth
                required
                value={formData.titulo}
                onChange={handleChange}
                variant="outlined"
                size="small"
                placeholder="Ej: El principito"
              />
            </Box>

            <Box mb={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
              >
                Autor
              </Typography>

              <TextField
                name="autor"
                fullWidth
                required
                value={formData.autor}
                onChange={handleChange}
                variant="outlined"
                size="small"
                placeholder="Ej: Gabriel García Márquez"
              />
            </Box>

            <Box mb={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
              >
                Género
              </Typography>

              <FormControl
                fullWidth
                variant="outlined"
                size="small"
              >
                <InputLabel>
                  Selecciona Género
                </InputLabel>

                <Select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  label="Selecciona Género"
                >
                  {GENEROS.map((genero) => (
                    <MenuItem
                      key={genero}
                      value={genero}
                    >
                      {genero}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box mb={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
              >
                Nivel Educativo
              </Typography>

              <FormControl
                fullWidth
                variant="outlined"
                size="small"
              >
                <InputLabel>
                  Selecciona Nivel
                </InputLabel>

                <Select
                  name="nivel_educativo"
                  value={formData.nivel_educativo}
                  onChange={handleChange}
                  label="Selecciona Nivel"
                >
                  {NIVELES_EDUCATIVOS.map((nivel) => (
                    <MenuItem
                      key={nivel}
                      value={nivel}
                    >
                      {nivel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* SAB-123: páginas opcionales */}
            <Box mb={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
              >
                Cantidad de páginas
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agregarPaginas}
                    onChange={handleTogglePaginas}
                    disabled={loading}
                  />
                }
                label="Agregar cantidad de páginas"
              />

              {agregarPaginas ? (
                <TextField
                  name="paginas_totales"
                  type="number"
                  fullWidth
                  required
                  value={paginasInput}
                  onChange={handlePagesChange}
                  size="small"
                  variant="outlined"
                  placeholder="Ej: 250"
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: 2147483647,
                      step: 1,
                    },
                  }}
                  error={Boolean(pageError)}
                  helperText={
                    pageError ||
                    'Esta cantidad se utilizará para el seguimiento de lectura.'
                  }
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Si no se informa la cantidad de páginas,
                  el libro se guardará sin ese dato y no
                  se mostrará el progreso de lectura.
                </Typography>
              )}
            </Box>

            <Box mb={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
              >
                Descripción
              </Typography>

              <StyledTextarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                aria-label="Descripción del libro"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box mb={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
              >
                Imagen
              </Typography>

              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="URL de la imagen"
                value={formData.imagenUrl ?? ''}
                onChange={handleChange}
                name="imagenUrl"
              />
            </Box>

            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'inline-block',
                maxWidth: '100%',
                mt: 2,
              }}
            >
              <Box
                component="img"
                src={
                  formData.imagenUrl ||
                  'https://placehold.co/300x400/cccccc/333333?text=Sin+Imagen'
                }
                alt="Portada del libro"
                onError={(
                  e: SyntheticEvent<HTMLImageElement>
                ) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://placehold.co/300x400/cccccc/333333?text=Error+Carga';
                }}
                sx={{
                  width: 300,
                  height: 400,
                  objectFit: 'cover',
                  display: 'block',
                  backgroundColor:
                    formData.imagenUrl
                      ? 'transparent'
                      : '#eee',
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 3,
            gap: 2,
          }}
        >
          <Button
            onClick={onCancel}
            variant="outlined"
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: 'button.main',
            }}
          >
            {loading
              ? 'Guardando...'
              : bookToEdit
                ? 'Guardar Cambios'
                : 'Crear Libro'}
          </Button>
        </Box>
      </FormContainer>
    </form>
  );
};

export default BookForm;
