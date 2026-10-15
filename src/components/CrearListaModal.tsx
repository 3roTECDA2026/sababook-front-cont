
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Divider,
  Chip,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
)
  .replace(/\/$/, '')
  .replace(/\/api\/v1$/, '');

const COLOR_NARANJA = '#f25600';

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
  // =====================================================
  // ESTADOS
  // =====================================================

  const [libroId, setLibroId] = useState('');
  const [comentario, setComentario] = useState('');

  const [mostrarSegundoLibro, setMostrarSegundoLibro] =
    useState(false);

  const [segundoLibroId, setSegundoLibroId] = useState('');
  const [segundoComentario, setSegundoComentario] =
    useState('');

  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargandoLibros, setCargandoLibros] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const solicitudEnCursoRef = useRef(false);

  // =====================================================
  // LIMPIAR FORMULARIO
  // =====================================================

  const limpiarFormulario = () => {
    setLibroId('');
    setComentario('');

    setMostrarSegundoLibro(false);
    setSegundoLibroId('');
    setSegundoComentario('');

    setErrorMsg(null);
  };

  const handleClose = () => {
    if (solicitudEnCursoRef.current) return;

    limpiarFormulario();
    onClose();
  };

  // =====================================================
  // CARGAR LIBROS
  // =====================================================

  const fetchLibros = async () => {
    try {
      setCargandoLibros(true);
      setErrorMsg(null);

      const token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json',
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/v1/libros`,
        { headers }
      );

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
        throw new Error(
          'El servidor devolvió un catálogo inválido.'
        );
      }

      const listaNormalizada: Libro[] = rawList
        .map((item: any) => ({
          id:
            item.libro_id ??
            item.id ??
            item.id_libro ??
            item._id,

          titulo:
            item.titulo ??
            item.title ??
            'Sin título',

          autor:
            item.autor ??
            item.author ??
            '',

          portadaUrl:
            item.portada_url ??
            item.portadaUrl ??
            item.portada ??
            '',

          genero:
            item.genero ??
            item.genre ??
            '',
        }))
        .filter(
          (item: Libro) =>
            item.id !== undefined &&
            item.id !== null
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

      setSegundoLibroId((anterior) => {
        if (
          anterior &&
          listaNormalizada.some(
            (libro) => String(libro.id) === anterior
          )
        ) {
          return anterior;
        }

        return '';
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

  // =====================================================
  // AGREGAR O QUITAR SEGUNDO LIBRO
  // =====================================================

  const agregarSegundoLibro = () => {
    setMostrarSegundoLibro(true);
    setSegundoLibroId('');
    setSegundoComentario('');
    setErrorMsg(null);
  };

  const quitarSegundoLibro = () => {
    setMostrarSegundoLibro(false);
    setSegundoLibroId('');
    setSegundoComentario('');
    setErrorMsg(null);
  };

  // =====================================================
  // GUARDAR RECOMENDACIÓN
  // =====================================================

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
          'Necesitás iniciar sesión para recomendar libros.'
        );
      }

      // Validar primer libro
      if (!libroId) {
        throw new Error(
          'Seleccioná el primer libro.'
        );
      }

      if (!comentario.trim()) {
        throw new Error(
          'Escribí una explicación para el primer libro.'
        );
      }

      const primerLibro = libros.find(
        (item) => String(item.id) === libroId
      );

      if (!primerLibro) {
        throw new Error(
          'El primer libro seleccionado no es válido.'
        );
      }

      const primerIdNumerico = Number(libroId);

      if (
        !Number.isSafeInteger(primerIdNumerico) ||
        primerIdNumerico <= 0
      ) {
        throw new Error(
          'El ID del primer libro es inválido.'
        );
      }

      // Preparar libros para enviar al backend
      const librosRecomendados = [
        {
          libroId: primerIdNumerico,
          explicacion: comentario.trim(),
        },
      ];

      // Validar segundo libro si está habilitado
      if (mostrarSegundoLibro) {
        if (!segundoLibroId) {
          throw new Error(
            'Seleccioná el segundo libro o quitá esa sección.'
          );
        }

        if (segundoLibroId === libroId) {
          throw new Error(
            'No podés recomendar dos veces el mismo libro.'
          );
        }

        if (!segundoComentario.trim()) {
          throw new Error(
            'Escribí una explicación para el segundo libro.'
          );
        }

        const segundoLibro = libros.find(
          (item) => String(item.id) === segundoLibroId
        );

        if (!segundoLibro) {
          throw new Error(
            'El segundo libro seleccionado no es válido.'
          );
        }

        const segundoIdNumerico = Number(segundoLibroId);

        if (
          !Number.isSafeInteger(segundoIdNumerico) ||
          segundoIdNumerico <= 0
        ) {
          throw new Error(
            'El ID del segundo libro es inválido.'
          );
        }

        librosRecomendados.push({
          libroId: segundoIdNumerico,
          explicacion: segundoComentario.trim(),
        });
      }

      const parsedUserId = storedUserId
        ? Number(storedUserId)
        : undefined;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // =================================================
      // PAYLOAD PARA EL CONTROLADOR NUEVO
      // =================================================

      const payload: Record<string, unknown> = {
        nombre: 'Nuestro recomendado',
        tipo: 'RECOMENDACION',

        descripcion:
          comentario.trim() ||
          'Recomendación destacada',

        libros: librosRecomendados,

        // Compatibilidad con código anterior
        libroId: primerIdNumerico,
        bookIds: librosRecomendados.map(
          (item) => item.libroId
        ),
      };

      if (
        parsedUserId !== undefined &&
        Number.isSafeInteger(parsedUserId) &&
        parsedUserId > 0
      ) {
        payload.usuarioId = parsedUserId;
        payload.userId = parsedUserId;
      }

      // Guardar una sola recomendación
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

      const responseData = await recomRes
        .json()
        .catch(() => ({}));

      // Mantener compatibilidad con callbacks actuales
      const libroFinal =
        responseData?.libro ?? primerLibro;

      limpiarFormulario();

      try {
        onSuccess?.(libroFinal);
      } catch (callbackError) {
        console.error(
          'Error en onSuccess:',
          callbackError
        );
      }

      try {
        onListaCreada?.(libroFinal);
      } catch (callbackError) {
        console.error(
          'Error en onListaCreada:',
          callbackError
        );
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

  // =====================================================
  // COMPONENTE PARA SELECCIONAR LIBROS
  // =====================================================

  const renderListaLibros = (
    seleccionado: string,
    seleccionar: (id: string) => void,
    idExcluido?: string
  ) => {
    if (cargandoLibros) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: 2,
          }}
        >
          <CircularProgress size={30} />
        </Box>
      );
    }

    const librosDisponibles = libros.filter(
      (item) =>
        !idExcluido ||
        String(item.id) !== idExcluido
    );

    if (librosDisponibles.length === 0) {
      return (
        <Alert severity="info">
          No hay libros disponibles para seleccionar.
        </Alert>
      );
    }

    return (
      <Box
        sx={{
          maxHeight: 300,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pr: 0.5,
        }}
      >
        {librosDisponibles.map((item) => {
          const activo =
            seleccionado === String(item.id);

          return (
            <Box
              key={String(item.id)}
              onClick={() => {
                if (!guardando) {
                  seleccionar(String(item.id));
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                border: '2px solid',
                borderColor: activo
                  ? COLOR_NARANJA
                  : '#e5e7eb',
                borderRadius: 2,
                bgcolor: activo
                  ? '#fff4ed'
                  : 'white',
                cursor: guardando
                  ? 'default'
                  : 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#fff4ed',
                },
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
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 55,
                    height: 75,
                    bgcolor: '#eee',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                >
                  <AutoStoriesIcon
                    sx={{ color: COLOR_NARANJA }}
                  />
                </Box>
              )}

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  fontWeight="bold"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {item.titulo}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {item.autor || 'Autor no informado'}
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: activo
                    ? COLOR_NARANJA
                    : '#999',
                  fontSize: 22,
                }}
              >
                {activo ? '●' : '○'}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <AutoStoriesIcon
            sx={{ color: COLOR_NARANJA }}
          />

          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 'bold' }}
          >
            Recomendar libros
          </Typography>
        </Box>

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
          {/* ========================================== */}
          {/* PRIMER LIBRO OBLIGATORIO */}
          {/* ========================================== */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
            >
              Libro 1
            </Typography>

            <Chip
              label="Obligatorio"
              size="small"
              sx={{
                bgcolor: '#fff4ed',
                color: COLOR_NARANJA,
                fontWeight: 'bold',
              }}
            />
          </Box>

          {renderListaLibros(
            libroId,
            (id) => {
              setLibroId(id);

              if (segundoLibroId === id) {
                setSegundoLibroId('');
              }
            }
          )}

          {!cargandoLibros && libros.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No hay libros disponibles en el catálogo.
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <TextField
              label="Explicación del primer libro"
              fullWidth
              multiline
              rows={3}
              required
              disabled={guardando}
              placeholder="¿Por qué recomendás este libro?"
              value={comentario}
              onChange={(e) =>
                setComentario(e.target.value)
              }
            />
          </Box>

          {/* ========================================== */}
          {/* SEGUNDO LIBRO OPCIONAL */}
          {/* ========================================== */}

          <Divider sx={{ my: 3 }} />

          {!mostrarSegundoLibro ? (
            <Button
              type="button"
              variant="outlined"
              fullWidth
              startIcon={<AddCircleOutlineIcon />}
              disabled={
                guardando ||
                cargandoLibros ||
                libros.length < 2
              }
              onClick={agregarSegundoLibro}
              sx={{
                color: COLOR_NARANJA,
                borderColor: COLOR_NARANJA,
                fontWeight: 'bold',
                py: 1.5,
                '&:hover': {
                  borderColor: COLOR_NARANJA,
                  bgcolor: '#fff4ed',
                },
              }}
            >
              Agregar segundo libro (opcional)
            </Button>
          ) : (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                >
                  Libro 2
                </Typography>

                <Button
                  type="button"
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={quitarSegundoLibro}
                  disabled={guardando}
                >
                  Quitar
                </Button>
              </Box>

              <Alert
                severity="info"
                sx={{ mb: 2 }}
              >
                Elegí un libro diferente al primero.
                Ambos se publicarán en una sola
                recomendación.
              </Alert>

              {renderListaLibros(
                segundoLibroId,
                setSegundoLibroId,
                libroId
              )}

              <Box sx={{ mt: 3 }}>
                <TextField
                  label="Explicación del segundo libro"
                  fullWidth
                  multiline
                  rows={3}
                  required
                  disabled={guardando}
                  placeholder="¿Por qué recomendás este segundo libro?"
                  value={segundoComentario}
                  onChange={(e) =>
                    setSegundoComentario(e.target.value)
                  }
                />
              </Box>
            </Box>
          )}
        </form>
      </DialogContent>

      {/* ============================================== */}
      {/* BOTONES */}
      {/* ============================================== */}

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
          disabled={
            guardando ||
            cargandoLibros ||
            !libroId ||
            libros.length === 0 ||
            !comentario.trim() ||
            (
              mostrarSegundoLibro &&
              (
                !segundoLibroId ||
                !segundoComentario.trim() ||
                segundoLibroId === libroId
              )
            )
          }
          sx={{
            bgcolor: COLOR_NARANJA,
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#d94d00',
            },
          }}
        >
          {guardando ? (
            <>
              <CircularProgress
                size={18}
                sx={{
                  color: 'white',
                  mr: 1,
                }}
              />
              Guardando...
            </>
          ) : (
            'Guardar recomendación'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearListaModal;
