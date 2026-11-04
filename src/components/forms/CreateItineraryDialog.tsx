// src/components/forms/CreateItineraryDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { itineraryService } from '@/services/itineraryService';
import { Book } from '@/types/book';

interface CreateItineraryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nombre: string;
    descripcion: string;
    libros: { libroId: number; explicacion: string }[];
  }) => Promise<unknown>;
}

export default function CreateItineraryDialog({
  open,
  onClose,
  onSubmit,
}: CreateItineraryDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<
    { libroId: number; explicacion: string }[]
  >([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingBooks(true);
    itineraryService
      .getBooksCatalog(100)
      .then((data) => {
        setAvailableBooks(data);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el catálogo de libros.';
        setError(message);
      })
      .finally(() => setLoadingBooks(false));
  }, [open]);

  const handleAddBookField = () => {
    const nextAvailable = availableBooks.find(
      (b) => !selectedBooks.some((sb) => sb.libroId === b.libro_id),
    );
    setSelectedBooks((prev) => [
      ...prev,
      { libroId: nextAvailable ? nextAvailable.libro_id : 0, explicacion: '' },
    ]);
  };

  // Un libro no puede repetirse dentro del itinerario: la tabla lista_libro
  // tiene clave compuesta (lista_id, libro_id) y el back rechaza el guardado.
  const isBookUsedElsewhere = (libroId: number, index: number) =>
    selectedBooks.some((sb, i) => i !== index && sb.libroId === libroId);

  const hasBooksLeft = availableBooks.some(
    (b) => !selectedBooks.some((sb) => sb.libroId === b.libro_id),
  );
  const handleRemoveBookField = (index: number) => {
    setSelectedBooks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBookChange = (index: number, libroId: number) => {
    setSelectedBooks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, libroId } : item)),
    );
  };

  const handleExplanationChange = (index: number, explicacion: string) => {
    setSelectedBooks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, explicacion } : item)),
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre del itinerario es obligatorio.');
      return;
    }
    // Se descartan duplicados por si quedó un borrador viejo con el mismo libro
    // elegido en dos filas: la clave (lista_id, libro_id) no los admite.
    const seenBookIds = new Set<number>();
    const validBooks = selectedBooks.filter((b) => {
      if (b.libroId <= 0 || seenBookIds.has(b.libroId)) return false;
      seenBookIds.add(b.libroId);
      return true;
    });
    if (validBooks.length === 0) {
      setError('Debes agregar al menos un libro al itinerario.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        nombre: name.trim(),
        descripcion: description.trim(),
        libros: validBooks,
      });
      setName('');
      setDescription('');
      setSelectedBooks([]);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al guardar itinerario.');
      } else {
        setError('Error al guardar itinerario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
        Crear Nuevo Itinerario APL
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          label="Título del itinerario"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Ej: Memoria, Dictadura y Derechos Humanos"
        />

        <TextField
          label="Descripción o fundamentación pedagógica"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
          placeholder="Explicación del eje transversal que articula estas lecturas..."
        />

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Libros de la APL seleccionados
          </Typography>
          <Button
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddBookField}
            disabled={loadingBooks || availableBooks.length === 0 || !hasBooksLeft}
          >
            Agregar libro
          </Button>
        </Box>

        {loadingBooks && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {selectedBooks.map((item, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TextField
                select
                size="small"
                label={`Libro #${index + 1}`}
                fullWidth
                value={item.libroId || ''}
                onChange={(e) => handleBookChange(index, Number(e.target.value))}
              >
                {availableBooks.map((b) => {
                  const usedElsewhere = isBookUsedElsewhere(b.libro_id, index);
                  return (
                    <MenuItem key={b.libro_id} value={b.libro_id} disabled={usedElsewhere}>
                      {b.titulo} — {b.autor}
                      {usedElsewhere ? ' (ya agregado)' : ''}
                    </MenuItem>
                  );
                })}
              </TextField>
              <IconButton color="error" onClick={() => handleRemoveBookField(index)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
            <TextField
              size="small"
              label="Eje o enfoque pedagógico para este libro"
              fullWidth
              multiline
              rows={2}
              value={item.explicacion}
              onChange={(e) => handleExplanationChange(index, e.target.value)}
              placeholder="¿Por qué se sugiere este libro en el itinerario?"
            />
          </Box>
        ))}

        {!loadingBooks && selectedBooks.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
            Aún no has agregado libros. Tocá en "Agregar libro" para comenzar.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Guardando...' : 'Crear Itinerario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
