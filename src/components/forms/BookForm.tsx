// src/components/BookForm.tsx
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent, SyntheticEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
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
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Book } from '@/types';
import { uploadPdfMaterial } from '@/services/apiService';
import PdfReaderModal from '@/components/ui/PdfReaderModal';

// NOTA: Se eliminan useParams y useNavigate ya que el formulario es llamado por un modal y no por una ruta.

// --- Constantes de Opciones ---
const GENEROS = ['Novela', 'Ficción', 'Ciencia Ficción', 'Poesía', 'Ensayo', 'Biografía'];
const NIVELES_EDUCATIVOS = ['Básico', 'Superior'];

interface BookFormData {
  libro_id?: number;
  titulo: string;
  autor: string;
  genero: string;
  nivel_educativo: string;
  descripcion: string;
  imagenUrl?: string;
  portada_url?: string;
  archivo_url?: string;
  id?: number;
  [key: string]: unknown;
}

// --- Datos Iniciales del Libro ---
const INITIAL_BOOK_DATA: BookFormData = {
  libro_id: undefined, // Usamos este campo para la API
  titulo: '',
  autor: '',
  genero: '',
  nivel_educativo: '',
  descripcion: '',
  imagenUrl: '', // Se mapea a 'portada_url' para el backend
  archivo_url: '',
};

// --- Componentes Estilizados (Material UI) ---
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  maxWidth: '900px',
  // Quitamos el margin: '40px auto' ya que el modal lo centrará
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  color: '#FFFFFF',
  padding: '10px 25px',
  borderRadius: '8px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  border: '1px solid #ccc',
  padding: '10px 25px',
  borderRadius: '8px',
  fontWeight: 'bold',
  marginRight: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
    borderColor: theme.palette.grey[500],
  },
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

// --- 3. Componente Funcional ---

type BookToEdit = Partial<Book> & { imagenUrl?: string };

interface BookFormProps {
  bookToEdit?: BookToEdit | null;
  onSave: (payload: BookFormData) => Promise<void> | void;
  onCancel: () => void;
  title?: string;
}

// 💡 Ahora acepta props para el modo edición, guardado y cancelación
const BookForm = ({ bookToEdit, onSave, onCancel, title }: BookFormProps) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 💡 ESTADO INICIAL: Mapea bookToEdit (si existe) o usa datos iniciales vacíos
  const [formData, setFormData] = useState<BookFormData>(INITIAL_BOOK_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [previewPdfOpen, setPreviewPdfOpen] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // 💡 EFECTO: Actualiza el formulario cuando cambia bookToEdit (al abrir el modal)
  useEffect(() => {
    if (bookToEdit) {
      // Mapeamos los campos del objeto bookToEdit al formato del formulario
      const mappedData: BookFormData = {
        ...INITIAL_BOOK_DATA,
        ...bookToEdit,
        libro_id: bookToEdit.libro_id,
        // Mapeamos el campo de la DB (portada_url) al campo del formulario (imagenUrl)
        imagenUrl: bookToEdit.imagenUrl || bookToEdit.portada_url || '',
        archivo_url: bookToEdit.archivo_url || '',
      };
      setFormData(mappedData);
      setSelectedFileName(bookToEdit.archivo_url ? 'Archivo PDF cargado' : null);
    } else {
      setFormData(INITIAL_BOOK_DATA);
      setSelectedFileName(null);
    }
    setPdfError(null);
  }, [bookToEdit]);

  // Manejador de cambios en los campos del formulario
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador de selección y carga de archivo PDF
  const handlePdfFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('El archivo seleccionado debe ser un documento PDF (.pdf)');
      return;
    }

    // Límite 25MB
    if (file.size > 25 * 1024 * 1024) {
      setPdfError('El tamaño del PDF no debe superar los 25 MB');
      return;
    }

    setPdfError(null);
    setUploadingPdf(true);
    setSelectedFileName(file.name);

    try {
      const res = await uploadPdfMaterial(file);
      setFormData((prev) => ({ ...prev, archivo_url: res.url }));
    } catch (err) {
      console.error('Error al subir PDF:', err);
      setPdfError('No se pudo subir el archivo PDF. Intenta de nuevo.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleClearPdf = () => {
    setFormData((prev) => ({ ...prev, archivo_url: '' }));
    setSelectedFileName(null);
    setPdfError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 💡 Manejador de Guardado (POST/PUT delegado al padre)
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // ---  Mapeamos 'imagenUrl' a 'portada_url' y limpiamos IDs ---
    const payload: BookFormData = { ...formData };

    // 1. Eliminar IDs internos del componente
    delete payload.id;

    // 2. Mapear 'imagenUrl' (frontend) a 'portada_url' (backend/DB)
    if (payload.imagenUrl !== undefined) {
      payload.portada_url = payload.imagenUrl;
    }
    delete payload.imagenUrl;

    // Incluimos archivo_url limpio
    if (payload.archivo_url) {
      payload.archivo_url = payload.archivo_url.trim();
    }

    // Incluimos libro_id en el payload si estamos editando (crucial para que Dashboard use PUT)
    if (bookToEdit && bookToEdit.libro_id) {
      payload.libro_id = bookToEdit.libro_id;
    }

    try {
      // 💡 Llamamos al handler del componente padre (Dashboard) para que haga el API call
      await onSave(payload);
    } catch (err) {
      // El componente padre ya maneja el Snackbar para errores
      console.error('Error al guardar en el formulario:', err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 La cancelación llama al prop onCancel
  const handleCancel = () => {
    onCancel();
  };

  // Renderizado
  const currentTitle = title || (bookToEdit ? 'Editar Libro' : 'Crear Nuevo Libro');
  const bookIdentifier = bookToEdit?.libro_id ? ` (ID: ${bookToEdit.libro_id})` : '';

  return (
    // 💡 Usa el nuevo handler unificado
    <form onSubmit={handleFormSubmit}>
      <FormContainer>
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: theme.palette.body?.main || '#4A4C52' }}
          >
            {currentTitle}
            {bookIdentifier}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Columna Izquierda: Campos del formulario */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Género
              </Typography>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Selecciona Género</InputLabel>
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

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Nivel Educativo
              </Typography>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Selecciona Nivel</InputLabel>
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

            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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

          {/* Columna Derecha: Imagen */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Imagen
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="URL de la imagen"
                value={formData.imagenUrl}
                onChange={handleChange}
                name="imagenUrl"
              />
            </Box>

            {/* Previsualización de la Imagen */}
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
                src={formData.imagenUrl || 'https://placehold.co/300x400/cccccc/333333?text=Sin+Imagen'}
                alt="Portada del libro"
                // 🚨 Importante: Añadir fallback de error para la imagen
                onError={(e: SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://placehold.co/300x400/cccccc/333333?text=Error+Carga';
                }}
                sx={{
                  width: 300,
                  height: 400,
                  objectFit: 'cover',
                  display: 'block',
                  backgroundColor: formData.imagenUrl ? 'transparent' : '#eee',
                }}
              />
            </Box>
          </Grid>

          {/* Sección de Material de Lectura PDF (SAB-67) */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.grey[300]}`,
                borderRadius: '8px',
                backgroundColor: theme.palette.grey[50] || '#fafafa',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <PictureAsPdfIcon sx={{ color: '#e53935' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Material de lectura (Archivo PDF)
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Carga el archivo PDF del libro para que los alumnos puedan leerlo directamente desde la plataforma.
              </Typography>

              {pdfError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPdfError(null)}>
                  {pdfError}
                </Alert>
              )}

              {/* Botón para seleccionar archivo local */}
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePdfFileSelect}
                />
                <Button
                  variant="outlined"
                  startIcon={uploadingPdf ? <CircularProgress size={18} /> : <UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPdf}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {uploadingPdf ? 'Subiendo PDF...' : 'Seleccionar archivo PDF'}
                </Button>

                {formData.archivo_url && (
                  <>
                    <Chip
                      icon={<PictureAsPdfIcon />}
                      label={selectedFileName || 'PDF adjunto'}
                      color="primary"
                      variant="outlined"
                      onDelete={handleClearPdf}
                    />
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setPreviewPdfOpen(true)}
                      sx={{ textTransform: 'none' }}
                    >
                      Previsualizar
                    </Button>
                  </>
                )}
              </Box>

              {/* O ingresar URL directa */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  O ingresa la URL directa del documento PDF si está alojado externamente:
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button onClick={onCancel} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading || uploadingPdf}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>

        {/* Modal de previsualización del PDF */}
        <PdfReaderModal
          open={previewPdfOpen}
          onClose={() => setPreviewPdfOpen(false)}
          pdfUrl={formData.archivo_url}
          title={formData.titulo || 'Material de lectura'}
        />
      </FormContainer>
    </form>
  );
};

export default BookForm;