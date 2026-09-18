import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export interface Libro {
  id: string | number;
  titulo: string;
  autor?: string;
  portadaUrl?: string;
  genero?: string;
}

interface CrearListaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (libro?: any) => void;
  onListaCreada?: (libro?: any) => void;
}

export const CrearListaModal: React.FC<CrearListaModalProps> = ({
  open,
  onClose,
  onSuccess,
  onListaCreada,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  // ID del libro seleccionado
  const [libroId, setLibroId] = useState<string>('');
  const [comentario, setComentario] = useState('');

  // Estados para nuevo libro
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoAutor, setNuevoAutor] = useState('');
  const [nuevaPortadaUrl, setNuevaPortadaUrl] = useState('');

  // Estados generales
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargandoLibros, setCargandoLibros] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLibros = async () => {
    setCargandoLibros(true);
    setErrorMsg(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let res = await fetch(`${baseUrl}/api/v1/libros`, { headers });
      if (res.status === 404) {
        res = await fetch(`${baseUrl}/api/v1/books`, { headers });
      }

      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data)
          ? data
          : data.libros || data.books || data.data || [];

        // Normalizado priorizando libro_id de la base de datos
        const listaNormalizada: Libro[] = rawList
          .map((item: any) => ({
            id: item.libro_id ?? item.id ?? item.id_libro ?? item._id,
            titulo: item.titulo ?? item.title ?? 'Sin título',
            autor: item.autor ?? item.author ?? '',
            portadaUrl: item.portada_url ?? item.portadaUrl ?? item.portada ?? '',
            genero: item.genero ?? item.genre ?? '',
          }))
          .filter((item: Libro) => item.id !== undefined && item.id !== null);

        setLibros(listaNormalizada);

        if (listaNormalizada.length > 0) {
          setLibroId(String(listaNormalizada[0].id));
        }
      } else {
        setErrorMsg('No se pudo obtener la lista de libros desde el servidor.');
      }
    } catch (err) {
      console.error('Error al cargar libros:', err);
      setErrorMsg('Error de conexión al cargar el catálogo de libros.');
    } finally {
      setCargandoLibros(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLibros();
    }
  }, [open]);

  const handleClose = () => {
    setErrorMsg(null);
    setComentario('');
    setNuevoTitulo('');
    setNuevoAutor('');
    setNuevaPortadaUrl('');
    setLibroId('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let selectedId = libroId;
      let libroObjeto: any = null;

      // 1. Si está en la pestaña para crear un libro nuevo
      if (tabIndex === 1) {
        if (!nuevoTitulo.trim()) {
          setErrorMsg('Ingresá el título del nuevo libro.');
          setGuardando(false);
          return;
        }

        let createRes = await fetch(`${baseUrl}/api/v1/books`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            titulo: nuevoTitulo,
            autor: nuevoAutor,
            portadaUrl: nuevaPortadaUrl,
          }),
        });

        if (createRes.status === 404) {
          createRes = await fetch(`${baseUrl}/api/v1/libros`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              titulo: nuevoTitulo,
              autor: nuevoAutor,
              portadaUrl: nuevaPortadaUrl,
            }),
          });
        }

        if (!createRes.ok) {
          const errBody = await createRes.json().catch(() => ({}));
          throw new Error(errBody.message || errBody.error || 'No se pudo crear el libro.');
        }

        const nuevoLibro = await createRes.json();
        selectedId = String(
          nuevoLibro.libro_id ?? nuevoLibro.id ?? nuevoLibro.id_libro ?? nuevoLibro._id
        );

        libroObjeto = {
          libro_id: selectedId,
          titulo: nuevoTitulo,
          autor: nuevoAutor,
          portada_url: nuevaPortadaUrl,
        };
      } else {
        // Obtenemos el objeto del libro seleccionado de la lista cargada
        const encontrado = libros.find((item) => String(item.id) === String(selectedId));
        if (encontrado) {
          libroObjeto = {
            libro_id: encontrado.id,
            titulo: encontrado.titulo,
            autor: encontrado.autor,
            portada_url: encontrado.portadaUrl,
            genero: encontrado.genero,
          };
        }
      }

      if (!selectedId) {
        setErrorMsg('Seleccioná un libro para continuar.');
        setGuardando(false);
        return;
      }

      const numericId = Number(selectedId);
      const parsedBookId = isNaN(numericId) ? selectedId : numericId;
      const parsedUserId = storedUserId
        ? isNaN(Number(storedUserId))
          ? storedUserId
          : Number(storedUserId)
        : undefined;

      const payload: Record<string, any> = {
        nombre: 'Nuestro recomendado',
        tipo: 'RECOMENDACION',
        descripcion: comentario || 'Recomendación destacada',
        bookIds: [parsedBookId],
        libroId: parsedBookId,
      };

      if (parsedUserId) {
        payload.usuarioId = parsedUserId;
        payload.userId = parsedUserId;
      }

      const recomRes = await fetch(`${baseUrl}/api/v1/lists`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!recomRes.ok) {
        const errorData = await recomRes.json().catch(() => ({}));
        console.error('Error del servidor:', errorData);
        const backendMessage =
          errorData.error ||
          errorData.message ||
          'Error interno en la base de datos al guardar la lista.';
        throw new Error(backendMessage);
      }

      const responseData = await recomRes.json().catch(() => ({}));
      
      // Si el backend trajo el objeto libro en la respuesta, lo usamos con prioridad
      const libroFinal = responseData.libro || libroObjeto;

      if (onSuccess) {
        onSuccess(libroFinal);
      }
      if (onListaCreada) {
        onListaCreada(libroFinal);
      }

      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al guardar la recomendación.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Crear Recomendación
        </Typography>
        <IconButton onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ overflowY: 'visible' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="fullWidth"
          >
            <Tab icon={<AutoStoriesIcon />} iconPosition="start" label="Elegir Existente" />
            <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Cargar Nuevo Libro" />
          </Tabs>
        </Box>

        <form id="crear-lista-form" onSubmit={handleSubmit}>
          {tabIndex === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cargandoLibros ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <FormControl fullWidth>
                  <InputLabel id="select-libro-label">Seleccionar Libro</InputLabel>
                  <Select
                    labelId="select-libro-label"
                    value={libroId}
                    label="Seleccionar Libro"
                    onChange={(e) => setLibroId(e.target.value as string)}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250,
                        },
                      },
                      disablePortal: false,
                    }}
                  >
                    {libros.map((item) => (
                      <MenuItem key={String(item.id)} value={String(item.id)}>
                        {item.titulo} {item.autor ? `- ${item.autor}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Título del Libro"
                fullWidth
                required
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
              />
              <TextField
                label="Autor / Autora"
                fullWidth
                value={nuevoAutor}
                onChange={(e) => setNuevoAutor(e.target.value)}
              />
              <TextField
                label="URL de Portada (Opcional)"
                fullWidth
                value={nuevaPortadaUrl}
                onChange={(e) => setNuevaPortadaUrl(e.target.value)}
              />
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <TextField
              label="Reseña o Comentario"
              fullWidth
              multiline
              rows={3}
              placeholder="¿Por qué recomendás este libro?"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="crear-lista-form"
          variant="contained"
          color="primary"
          disabled={
            guardando ||
            (tabIndex === 0 && (!libroId || libros.length === 0)) ||
            (tabIndex === 1 && !nuevoTitulo.trim())
          }
        >
          {guardando ? 'Guardando...' : 'Guardar Recomendación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearListaModal;