
import React, { useState, useEffect, useRef } from 'react';
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

type RespuestaLibro = {
  libro_id?: string | number;
  id?: string | number;
  id_libro?: string | number;
  _id?: string | number;
  libro?: RespuestaLibro;
  data?: RespuestaLibro;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
).replace(/\/$/, '').replace(/\/api\/v1$/, '');

const obtenerMensajeError = async (
  response: Response,
  mensajeDefault: string
): Promise<string> => {
  try {
    const data = await response.json();

    if (typeof data?.error === 'string') return data.error;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.mensaje === 'string') return data.mensaje;

    return `${mensajeDefault} (HTTP ${response.status})`;
  } catch {
    return `${mensajeDefault} (HTTP ${response.status})`;
  }
};

const obtenerIdLibro = (
  data: RespuestaLibro
): string | number | undefined => {
  const libro = data.libro ?? data.data ?? data;

  return (
    libro.libro_id ??
    libro.id ??
    libro.id_libro ??
    libro._id
  );
};

export const CrearListaModal: React.FC<CrearListaModalProps> = ({
  open,
  onClose,
  onSuccess,
  onListaCreada,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [libroId, setLibroId] = useState('');
  const [comentario, setComentario] = useState('');

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoAutor, setNuevoAutor] = useState('');
  const [nuevaPortadaUrl, setNuevaPortadaUrl] = useState('');

  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargandoLibros, setCargandoLibros] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Conserva el libro creado si falla la recomendación.
  const libroCreadoRef = useRef<{
    firma: string;
    libro: Libro;
  } | null>(null);

  const solicitudEnCursoRef = useRef(false);

  const limpiarFormulario = () => {
    setTabIndex(0);
    setLibroId('');
    setComentario('');
    setNuevoTitulo('');
    setNuevoAutor('');
    setNuevaPortadaUrl('');
    setErrorMsg(null);
    libroCreadoRef.current = null;
  };

  const handleClose = () => {
    if (solicitudEnCursoRef.current) return;

    limpiarFormulario();
    onClose();
  };

  const fetchLibros = async () => {
    try {
      setCargandoLibros(true);
      setErrorMsg(null);

      const token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let response = await fetch(
        `${API_BASE_URL}/api/v1/libros`,
        { headers }
      );

      if (response.status === 404) {
        response = await fetch(
          `${API_BASE_URL}/api/v1/books`,
          { headers }
        );
      }

      if (!response.ok) {
        throw new Error(
          await obtenerMensajeError(
            response,
            'No se pudo cargar el catálogo de libros.'
          )
        );
      }

      const data = await response.json();

      const rawList = Array.isArray(data)
        ? data
        : data?.libros ?? data?.books ?? data?.data ?? [];

      if (!Array.isArray(rawList)) {
        throw new Error('El servidor devolvió un catálogo inválido.');
      }

      const listaNormalizada: Libro[] = rawList
        .map((item: any) => ({
          id: item.libro_id ?? item.id ?? item.id_libro ?? item._id,
          titulo: item.titulo ?? item.title ?? 'Sin título',
          autor: item.autor ?? item.author ?? '',
          portadaUrl:
            item.portada_url ?? item.portadaUrl ?? item.portada ?? '',
          genero: item.genero ?? item.genre ?? '',
        }))
        .filter(
          (item: Libro) =>
            item.id !== undefined && item.id !== null
        );

      setLibros(listaNormalizada);

      setLibroId((anterior) => {
        if (
          anterior &&
          listaNormalizada.some(
            (libro) => String(libro.id) === anterior
          )
        ) {
          return anterior;
        }

        return listaNormalizada.length > 0
          ? String(listaNormalizada[0].id)
          : '';
      });
    } catch (err: unknown) {
      console.error('Error al cargar libros:', err);

      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Error inesperado al cargar los libros.'
      );
    } finally {
      setCargandoLibros(false);
    }
  };

  useEffect(() => {
    if (open) {
      void fetchLibros();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (solicitudEnCursoRef.current) return;

    solicitudEnCursoRef.current = true;
    setGuardando(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');

      if (!token) {
        throw new Error(
          'Necesitás iniciar sesión para recomendar un libro.'
        );
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      let selectedId: string | number = libroId;
      let libroObjeto: Libro | null = null;

      if (tabIndex === 1) {
        if (!nuevoTitulo.trim()) {
          throw new Error('Ingresá el título del nuevo libro.');
        }

        const firma = JSON.stringify({
          titulo: nuevoTitulo.trim(),
          autor: nuevoAutor.trim(),
          portada: nuevaPortadaUrl.trim(),
        });

        // Reutilizar el libro creado al reintentar.
        if (libroCreadoRef.current?.firma === firma) {
          libroObjeto = libroCreadoRef.current.libro;
          selectedId = libroObjeto.id;
        } else {
          libroCreadoRef.current = null;

          const body = JSON.stringify({
            titulo: nuevoTitulo.trim(),
            autor: nuevoAutor.trim(),
            portadaUrl: nuevaPortadaUrl.trim(),
          });

          let createRes = await fetch(
            `${API_BASE_URL}/api/v1/books`,
            {
              method: 'POST',
              headers,
              body,
            }
          );

          if (createRes.status === 404) {
            createRes = await fetch(
              `${API_BASE_URL}/api/v1/libros`,
              {
                method: 'POST',
                headers,
                body,
              }
            );
          }

          if (!createRes.ok) {
            throw new Error(
              await obtenerMensajeError(
                createRes,
                'No se pudo crear el libro.'
              )
            );
          }

          const nuevoLibro: RespuestaLibro =
            await createRes.json();

          const id = obtenerIdLibro(nuevoLibro);

          if (id === undefined || id === null) {
            throw new Error(
              'El libro fue creado, pero el servidor no devolvió su ID. Revisá el catálogo antes de reintentar.'
            );
          }

          selectedId = id;

          libroObjeto = {
            id,
            titulo: nuevoTitulo.trim(),
            autor: nuevoAutor.trim(),
            portadaUrl: nuevaPortadaUrl.trim(),
          };

          libroCreadoRef.current = {
            firma,
            libro: libroObjeto,
          };
        }
      } else {
        const encontrado = libros.find(
          (item) => String(item.id) === String(selectedId)
        );

        if (!encontrado) {
          throw new Error('Seleccioná un libro válido.');
        }

        libroObjeto = encontrado;
      }

      if (
        selectedId === '' ||
        selectedId === undefined ||
        selectedId === null
      ) {
        throw new Error('Seleccioná un libro para continuar.');
      }

      const numericId = Number(selectedId);
      const parsedBookId = Number.isNaN(numericId)
        ? selectedId
        : numericId;

      const parsedUserId = storedUserId
        ? Number.isNaN(Number(storedUserId))
          ? storedUserId
          : Number(storedUserId)
        : undefined;

      const payload: Record<string, unknown> = {
        nombre: 'Nuestro recomendado',
        tipo: 'RECOMENDACION',
        descripcion:
          comentario.trim() || 'Recomendación destacada',
        bookIds: [parsedBookId],
        libroId: parsedBookId,
      };

      if (parsedUserId !== undefined) {
        payload.usuarioId = parsedUserId;
        payload.userId = parsedUserId;
      }

      const recomRes = await fetch(
        `${API_BASE_URL}/api/v1/lists`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!recomRes.ok) {
        throw new Error(
          await obtenerMensajeError(
            recomRes,
            'No se pudo guardar la recomendación.'
          )
        );
      }

      const responseData = await recomRes.json().catch(
        () => ({})
      );

      const libroFinal =
        responseData?.libro ?? libroObjeto;

      // Se ejecutan solo después de guardar correctamente.
      limpiarFormulario();

      try {
        onSuccess?.(libroFinal);
      } catch (callbackError) {
        console.error('Error en onSuccess:', callbackError);
      }

      try {
        onListaCreada?.(libroFinal);
      } catch (callbackError) {
        console.error('Error en onListaCreada:', callbackError);
      }

      onClose();
    } catch (err: unknown) {
      console.error(
        'Error al guardar la recomendación:',
        err
      );

      if (err instanceof TypeError) {
        setErrorMsg(
          'No se pudo conectar con el servidor. Verificá que el backend esté funcionando.'
        );
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(
          'Ocurrió un error inesperado al guardar la recomendación.'
        );
      }
    } finally {
      solicitudEnCursoRef.current = false;
      setGuardando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 'bold' }}
        >
          Recomendar Libro
        </Typography>

        <IconButton
          onClick={handleClose}
          aria-label="Cerrar"
          disabled={guardando}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form
          id="crear-lista-form"
          onSubmit={handleSubmit}
        >
          {tabIndex === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {cargandoLibros ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 2,
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Box sx={{
                    maxHeight: 350,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    {libros.map((item) => {
                      const activo = libroId === String(item.id);
                      return (
                        <Box
                          key={String(item.id)}
                          onClick={() => !guardando && setLibroId(String(item.id))}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            border: '2px solid',
                            borderColor: activo ? '#f25600' : '#e5e7eb',
                            borderRadius: 2,
                            bgcolor: activo ? '#fff4ed' : 'white',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#fff4ed' }
                          }}
                        >
                          {item.portadaUrl ? (
                            <Box
                              component="img"
                              src={item.portadaUrl}
                              alt={item.titulo}
                              sx={{
                                width: 55,
                                height: 75,
                                objectFit: 'cover',
                                borderRadius: 1
                              }}
                            />
                          ) : (
                            <Box sx={{
                              width: 55,
                              height: 75,
                              bgcolor: '#eee',
                              display: 'grid',
                              placeItems: 'center'
                            }}>
                              📚
                            </Box>
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight="bold">
                              {item.titulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.autor || 'Autor no informado'}
                            </Typography>
                          </Box>
                          <Typography color={activo ? '#f25600' : '#999'}>
                            {activo ? '●' : '○'}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
              )}

              {!cargandoLibros && libros.length === 0 && (
                <Alert severity="info">
                  No hay libros disponibles en el catálogo.
                </Alert>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <TextField
              label="Reseña o Comentario"
              fullWidth
              multiline
              rows={3}
              disabled={guardando}
              placeholder="¿Por qué recomendás este libro?"
              value={comentario}
              onChange={(e) =>
                setComentario(e.target.value)
              }
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={guardando}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          form="crear-lista-form"
          variant="contained"
          color="primary"
          disabled={
            guardando ||
            cargandoLibros ||
            (tabIndex === 0 &&
              (!libroId || libros.length === 0)) ||
            (tabIndex === 1 &&
              !nuevoTitulo.trim())
          }
        >
          {guardando
            ? 'Guardando...'
            : 'Guardar Recomendación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearListaModal;
