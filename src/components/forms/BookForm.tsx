
import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type SyntheticEvent,
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
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';

import type { SelectChangeEvent } from '@mui/material';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';

import type { Book } from '@/types';
import { uploadPdfMaterial } from '@/services/apiService';
import PdfReaderModal from '@/components/ui/PdfReaderModal';

// Opciones del formulario
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

  // SAB-123: las páginas son opcionales.
  paginas_totales: number | null;

  imagenUrl?: string;
  portada_url?: string;

  // SAB-67: material de lectura PDF.
  archivo_url?: string;

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
  archivo_url: '',
};

// Componentes estilizados
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  maxWidth: '900px',
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
  paginas_totales?: number | null;
  archivo_url?: string | null;
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estado general del formulario
  const [formData, setFormData] = useState<BookFormData>({
    ...INITIAL_BOOK_DATA,
  });

  // SAB-123: estado de páginas opcionales
  const [agregarPaginas, setAgregarPaginas] = useState(false);
  const [paginasInput, setPaginasInput] = useState('');
  const [pageError, setPageError] = useState('');

  // Estado del guardado
  const [loading, setLoading] = useState(false);

  // SAB-67: estado de archivos PDF
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<
    string | null
  >(null);

  // Inicializar el formulario al crear o editar un libro.
  useEffect(() => {
    if (bookToEdit) {
      const paginas = bookToEdit.paginas_totales;

      const tienePaginas =
        typeof paginas === 'number' &&
        Number.isSafeInteger(paginas) &&
        paginas > 0 &&
        paginas <= 2147483647;

      const mappedData: BookFormData = {
        ...INITIAL_BOOK_DATA,
        ...bookToEdit,

        libro_id: bookToEdit.libro_id,

        paginas_totales: tienePaginas ? paginas : null,

        imagenUrl:
          bookToEdit.imagenUrl ||
          bookToEdit.portada_url ||
          '',

        archivo_url: bookToEdit.archivo_url || '',
      };

      setFormData(mappedData);

      // SAB-123: mostrar checkbox marcado si ya tiene páginas.
      setAgregarPaginas(tienePaginas);
      setPaginasInput(
        tienePaginas ? String(paginas) : ''
      );

      // SAB-67: conservar el PDF existente.
      setSelectedFileName(
        bookToEdit.archivo_url
          ? 'Archivo PDF cargado'
          : null
      );
    } else {
      setFormData({ ...INITIAL_BOOK_DATA });

      setAgregarPaginas(false);
      setPaginasInput('');

      setSelectedFileName(null);
    }

    setPageError('');
    setPdfError(null);
    setPreviewPdfOpen(false);
  }, [bookToEdit]);

  // Cambios en campos generales.
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

  // SAB-123: activar o desactivar cantidad de páginas.
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

  // SAB-123: actualizar cantidad de páginas.
  const handlePagesChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    setPaginasInput(value);
    setPageError('');

    setFormData((prev) => ({
      ...prev,
      paginas_totales:
        value.trim() === '' ? null : Number(value),
    }));
  };

  // SAB-67: seleccionar y subir un PDF.
  const handlePdfFileSelect = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const esPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!esPdf) {
      setPdfError(
        'El archivo seleccionado debe ser un documento PDF (.pdf)'
      );
      return;
    }

    // Tamaño máximo: 25 MB.
    if (file.size > 25 * 1024 * 1024) {
      setPdfError(
        'El tamaño del PDF no debe superar los 25 MB'
      );
      return;
    }

    setPdfError(null);
    setUploadingPdf(true);

    try {
      const res = await uploadPdfMaterial(file);

      setFormData((prev) => ({
        ...prev,
        archivo_url: res.url,
      }));

      setSelectedFileName(file.name);
    } catch (err) {
      console.error('Error al subir PDF:', err);

      setPdfError(
        'No se pudo subir el archivo PDF. Intenta de nuevo.'
      );
    } finally {
      setUploadingPdf(false);
    }
  };

  // SAB-67: quitar el PDF adjunto.
  const handleClearPdf = () => {
    setFormData((prev) => ({
      ...prev,
      archivo_url: '',
    }));

    setSelectedFileName(null);
    setPdfError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Guardar libro: integra SAB-123 y SAB-67.
  const handleFormSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading || uploadingPdf) return;

    let paginas: number | null = null;

    // SAB-123: validar solo cuando el checkbox está marcado.
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

    // Preparar datos para el backend.
    const payload: BookFormData = {
      ...formData,

      // Si no se marcaron páginas, enviamos NULL.
      paginas_totales: paginas,
    };

    // Quitar ID auxiliar.
    delete payload.id;

    // Mapear imagenUrl a portada_url.
    if (payload.imagenUrl !== undefined) {
      payload.portada_url = payload.imagenUrl;
    }

    delete payload.imagenUrl;

    // SAB-67: conservar URL del PDF.
    if (payload.archivo_url) {
      payload.archivo_url = payload.archivo_url.trim();
    }

    // Conservar ID cuando se está editando.
    if (bookToEdit?.libro_id) {
      payload.libro_id = bookToEdit.libro_id;
    }

    try {
      await onSave(payload);
    } catch (err) {
      console.error(
        'Error al guardar en el formulario:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const currentTitle =
    title ||
    (bookToEdit ? 'Editar Libro' : 'Crear Nuevo Libro');

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
          {/* COLUMNA IZQUIERDA */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Título */}
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
                value={formData.titulo}
                onChange={handleChange}
                variant="outlined"
                size="small"
                placeholder="Ej: El Ingenioso Hidalgo Don Quijote de la Mancha"
              />
            </Box>

            {/* Autor */}
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
                value={formData.autor}
                onChange={handleChange}
                variant="outlined"
                size="small"
                placeholder="Ej: García Márquez, Gabriel"
              />
            </Box>

            {/* Género */}
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
                  {GENEROS.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Nivel educativo */}
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
                  {NIVELES_EDUCATIVOS.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
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

            {/* Descripción */}
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

          {/* COLUMNA DERECHA */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Imagen */}
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
                value={formData.imagenUrl || ''}
                onChange={handleChange}
                name="imagenUrl"
              />
            </Box>

            {/* Previsualización de imagen */}
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

          {/* SAB-67: MATERIAL DE LECTURA PDF */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.grey[300]}`,
                borderRadius: '8px',
                backgroundColor:
                  theme.palette.grey[50] ||
                  '#fafafa',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={1.5}
              >
                <PictureAsPdfIcon
                  sx={{ color: '#e53935' }}
                />

                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                >
                  Material de lectura (Archivo PDF)
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={2}
              >
                Carga el archivo PDF del libro para que
                los alumnos puedan leerlo directamente
                desde la plataforma.
              </Typography>

              {pdfError && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  onClose={() => setPdfError(null)}
                >
                  {pdfError}
                </Alert>
              )}

              {/* Seleccionar PDF */}
              <Box
                display="flex"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
                mb={2}
              >
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePdfFileSelect}
                />

                <Button
                  variant="outlined"
                  startIcon={
                    uploadingPdf ? (
                      <CircularProgress size={18} />
                    ) : (
                      <UploadFileIcon />
                    )
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploadingPdf}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {uploadingPdf
                    ? 'Subiendo PDF...'
                    : 'Seleccionar archivo PDF'}
                </Button>

                {formData.archivo_url && (
                  <>
                    <Chip
                      icon={<PictureAsPdfIcon />}
                      label={
                        selectedFileName ||
                        'PDF adjunto'
                      }
                      color="primary"
                      variant="outlined"
                      onDelete={handleClearPdf}
                    />

                    <Button
                      size="small"
                      variant="text"
                      startIcon={<VisibilityIcon />}
                      onClick={() =>
                        setPreviewPdfOpen(true)
                      }
                      sx={{
                        textTransform: 'none',
                      }}
                    >
                      Previsualizar
                    </Button>
                  </>
                )}
              </Box>

              {/* URL directa del PDF */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={0.5}
                >
                  O ingresa la URL directa del documento
                  PDF si está alojado externamente:
                </Typography>

                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="https://ejemplo.com/material-de-lectura.pdf"
                  name="archivo_url"
                  value={formData.archivo_url || ''}
                  onChange={handleChange}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* BOTONES */}
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
            disabled={loading || uploadingPdf}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar Cambios'}
          </Button>
        </Box>

        {/* Previsualización del PDF */}
        <PdfReaderModal
          open={previewPdfOpen}
          onClose={() => setPreviewPdfOpen(false)}
          pdfUrl={formData.archivo_url}
          title={
            formData.titulo ||
            'Material de lectura'
          }
        />
      </FormContainer>
    </form>
  );
};

export default BookForm;
