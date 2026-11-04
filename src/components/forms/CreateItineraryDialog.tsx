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
import { API_BASE_URL } from '@/environments/api';
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
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
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
    fetch(`${API_BASE_URL}/api/v1/libros?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableBooks(data);
        }
      })
      .catch(() => {})
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

  const handleRemoveBookField = (index: number) => {
    setSelectedBooks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBookChange = (index: number, libroId: number) => {
    setSelectedBooks((prev) => {
      const copy = [...prev];
      copy[index].libroId = libroId;
      return copy;
    });
  };

  const handleExplanationChange = (index: number, explicacion: string) => {
    setSelectedBooks((prev) => {
      const copy = [...prev];
      copy[index].explicacion = explicacion;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre del itinerario es obligatorio.');
      return;
    }
    const validBooks = selectedBooks.filter((b) => b.libroId > 0);
    if (validBooks.length === 0) {
      setError('Debes agregar al menos un libro al itinerario.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        libros: validBooks,
      });
      setNombre('');
      setDescripcion('');
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
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Ej: Memoria, Dictadura y Derechos Humanos"
        />

        <TextField
          label="Descripción o fundamentación pedagógica"
          fullWidth
          multiline
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
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
            disabled={loadingBooks || availableBooks.length === 0}
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
                {availableBooks.map((b) => (
                  <MenuItem key={b.libro_id} value={b.libro_id}>
                    {b.titulo} — {b.autor}
                  </MenuItem>
                ))}
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
        <Button onClick={onClose} disabled={submitting} sx={{ bgcolor: 'action.hover', color: 'text.primary' }}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Guardando...' : 'Crear Itinerario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
