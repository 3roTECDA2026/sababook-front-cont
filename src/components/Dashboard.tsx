// src/components/Dashboard.tsx
import { useState, useEffect, SyntheticEvent } from 'react';
import {
  Box,
  Modal,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import type { AlertColor } from '@mui/material';

import HeaderDashboard from './HeaderDashboard';
import type { DashboardView } from './HeaderDashboard';
import UserTable from './UserTable';
import BookTable from './BookTable';
import ForumTable from './ForumTable';
import ForumDetail from './ForumDetail';
import UserForm from './UserForm';
import type { UserFormData } from './UserForm';
import ForumForm from './ForumForm';
import BookForm from './BookForm';
import { API_BASE_URL } from '../environments/api';
import type { Book, Forum, User } from '../types';

const DashboardContainer = Box;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

type RolKey = 'alumno' | 'docente' | 'administrador';

const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('users');
  // --- ESTADOS DE USUARIOS y LIBROS (Ahora son específicos) ---
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  // --- ESTADOS DE MODALES Y EDICIÓN ---
  const [openForumModal, setOpenForumModal] = useState<boolean>(false);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false); // Modal para USUARIOS
  const [openCreateBookModal, setOpenCreateBookModal] = useState<boolean>(false); // Modal para LIBROS
  //  ESTADO CLAVE: Rastrear el libro que se está editando (null si es creación)
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false); // Para manejar carga en operaciones CRUD
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [bookToDeleteId, setBookToDeleteId] = useState<number | null>(null);
  // ---  ESTADOS DE FOROS
  const [forums, setForums] = useState<Forum[]>([]);
  const [forumsLoading, setForumsLoading] = useState<boolean>(true);
  const [forumsError, setForumsError] = useState<string | null>(null);
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [openForumDetail, setOpenForumDetail] = useState<boolean>(false);
  const [forumToEdit, setForumToEdit] = useState<Forum | null>(null);
  const [openDeleteForumConfirm, setOpenDeleteForumConfirm] = useState<boolean>(false);
  const [forumToDeleteId, setForumToDeleteId] = useState<number | null>(null);

  // Mapeo de roles para la creación de usuarios
  const rolMapping: Record<RolKey, number> = {
    alumno: 1,
    docente: 2,
    administrador: 3,
  };

  // --- FUNCIÓN FETCH PARA USUARIOS (READ) ---
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      setUserError(null);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/v1/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403)
          throw new Error('Acceso denegado. No tienes permisos para ver esta página.');
        throw new Error('Error al cargar los usuarios');
      }
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setUserError(message);
    } finally {
      setUserLoading(false);
    }
  };

  // --- FUNCIÓN FETCH PARA LIBROS
  const fetchBooks = async () => {
    try {
      setBooksLoading(true);
      setBooksError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado.');

      const res = await fetch(`${API_BASE_URL}/api/v1/libros`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Acceso denegado.');
        throw new Error('Error al cargar los libros');
      }
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setBooksError(message);
    } finally {
      setBooksLoading(false);
    }
  };

  // --- FUNCIÓN FETCH PARA FOROS
  const fetchForums = async () => {
    try {
      setForumsLoading(true);
      setForumsError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/foro`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Acceso denegado.');
        throw new Error('Error al cargar los foros');
      }

      const data: Forum[] = await res.json();
      setForums(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setForumsError(message);
    } finally {
      setForumsLoading(false);
    }
  };

  // --- useEffect para Cargar Datos ---

  useEffect(() => {
    if (activeView === 'users') {
      fetchUsers();
    } else if (activeView === 'books') {
      fetchBooks();
    } else if (activeView === 'forums') {
      fetchForums();
    }
    setUserError(null);
    setBooksError(null);
  }, [activeView]);

  // --- UI HANDLERS ---
  const handleNavigate = (viewName: DashboardView) => {
    setActiveView(viewName);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  // Cierra modal de libros y restablece el libro a editar
  const handleCloseCreateBookModal = () => {
    setOpenCreateBookModal(false);
    setBookToEdit(null);
  };

  //  HANDLER DE EDICIÓN: Abre el modal en modo edición
  const handleEditBookClick = (book: Book) => {
    setBookToEdit(book);
    setOpenCreateBookModal(true);
  };

  // --- API HANDLERS (USUARIOS) ---
  const handleSaveNewUser = async (formData: UserFormData) => {
    // Lógica para crear un nuevo usuario (POST)
    const dataToSend: UserFormData = { ...formData };
    dataToSend.rol_id = dataToSend.rol ? rolMapping[dataToSend.rol as RolKey] : undefined;
    dataToSend.contrasena = dataToSend.password;
    delete dataToSend.rol;
    delete dataToSend.password;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error('Error al crear el usuario');

      await fetchUsers();
      handleCloseCreateModal();
      setSnackbar({ open: true, message: 'Usuario creado correctamente', severity: 'success' });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setSnackbar({ open: true, message: 'Error al crear el usuario', severity: 'error' });
    }
  };

  // --- API HANDLERS (LIBROS) ---
  //  HANDLER UNIFICADO: Maneja Creación (POST) y Edición (PUT)
  const handleSaveBook = async (bookData: { libro_id?: number; [key: string]: unknown }) => {
    setIsApiLoading(true);
    const token = localStorage.getItem('token');

    // Determinar si es Edición (PUT) o Creación (POST)
    const isEditing = !!bookData.libro_id;
    const endpoint = isEditing
      ? `${API_BASE_URL}/api/v1/libros/${bookData.libro_id}`
      : `${API_BASE_URL}/api/v1/libros`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Fallo la operación (HTTP ${response.status})`);
      }

      await fetchBooks();
      handleCloseCreateBookModal();
      const successMsg = isEditing
        ? 'Libro actualizado correctamente.'
        : 'Libro creado correctamente.';
      setSnackbar({ open: true, message: `✅ ${successMsg}`, severity: 'success' });
      return Promise.resolve();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error al ${isEditing ? 'editar' : 'crear'} libro:`, error);
      setSnackbar({ open: true, message: `❌ Error: ${message}`, severity: 'error' });
      // Rechazar la promesa para que el formulario sepa que falló el guardado
      return Promise.reject(error);
    } finally {
      setIsApiLoading(false);
    }
  };

  // --- HANDLER PARA ABRIR EL MODAL DE CONFIRMACIÓN ---
  const handleOpenDeleteConfirm = (bookId: number) => {
    setBookToDeleteId(bookId); // Guarda el ID del libro
    setOpenDeleteConfirm(true); // Abre el modal
  };

  // --- HANDLER PARA CERRAR EL MODAL SIN ELIMINAR ---
  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setBookToDeleteId(null); // Limpia el ID
  };

  //  HANDLER DE ELIMINACIÓN: Lógica para la Eliminación (DELETE)
  const handleConfirmDeleteBook = async () => {
    // 1. Cierra el modal inmediatamente
    setOpenDeleteConfirm(false);

    if (!bookToDeleteId) return; // Asegura que haya un ID

    setIsApiLoading(true);
    const token = localStorage.getItem('token');
    // Usa el ID guardado en el estado
    const endpoint = `${API_BASE_URL}/api/v1/libros/${bookToDeleteId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Fallo la eliminación (HTTP ${response.status})`);
      }

      await fetchBooks(); // Refrescar la lista de libros
      setSnackbar({ open: true, message: `✅ Libro eliminado correctamente.`, severity: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al eliminar libro:', error);
      setSnackbar({ open: true, message: `❌ Error al eliminar: ${message}`, severity: 'error' });
    } finally {
      setIsApiLoading(false);
      setBookToDeleteId(null); // Limpia el ID al finalizar
    }
  };

  //foros

  //  HANDLER DE EDICIÓN: Abre el modal en modo edición y guarda los datos
  const handleEditForumClick = (forum: Forum) => {
    setForumToEdit(forum); // Guarda el objeto completo del foro
    setOpenForumModal(true); // Abre el modal de creación/edición
  };

  // MODIFICAR: Cierra el modal de foros y restablece el foro a editar
  const handleCloseForumModal = () => {
    setOpenForumModal(false);
    setForumToEdit(null); // MUY IMPORTANTE: Restablecer el foro al cerrar
  };

  const handleAddClick = () => {
    if (activeView === 'users') {
      setOpenCreateModal(true);
    } else if (activeView === 'forums') {
      setForumToEdit(null); // Asegura que el modo sea 'crear'
      setOpenForumModal(true);
    } else if (activeView === 'books') {
      setBookToEdit(null);
      setOpenCreateBookModal(true);
    }
  };

  //  MODIFICAR: Unificar la lógica de GUARDADO (POST y PUT)
  const handleSaveForum = async (forumData: { foro_id?: number; [key: string]: unknown }) => {
    setIsApiLoading(true);
    const token = localStorage.getItem('token');

    const isEditing = !!forumData.foro_id;
    const endpoint = isEditing
      ? `${API_BASE_URL}/api/v1/foro/${forumData.foro_id}`
      : `${API_BASE_URL}/api/v1/foro`;
    const method = isEditing ? 'PUT' : 'POST';

    // Asegúrate de que los datos enviados incluyan creador_id si es POST, o solo los campos editados si es PUT
    const dataToSend = isEditing
      ? forumData
      : {
          ...forumData,
          creador_id: parseInt(localStorage.getItem('userId') ?? ''), // Obtener el ID del creador solo en creación
        };

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Fallo la operación (HTTP ${response.status})`);
      }

      await fetchForums();
      handleCloseForumModal();
      const successMsg = isEditing
        ? 'Foro actualizado correctamente.'
        : 'Foro creado correctamente.';
      setSnackbar({ open: true, message: `✅ ${successMsg}`, severity: 'success' });
      return Promise.resolve();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error al ${isEditing ? 'editar' : 'crear'} foro:`, error);
      setSnackbar({ open: true, message: `❌ Error: ${message}`, severity: 'error' });
      return Promise.reject(error);
    } finally {
      setIsApiLoading(false);
    }
  };

  // 1. Handler para abrir el modal de eliminación de foros
  const handleOpenDeleteForumConfirm = (forumId: number) => {
    setForumToDeleteId(forumId);
    setOpenDeleteForumConfirm(true);
  };

  // 2. Handler para cerrar el modal de eliminación de foros sin acción
  const handleCloseDeleteForumConfirm = () => {
    setOpenDeleteForumConfirm(false);
    setForumToDeleteId(null);
  };

  // 3. Handler de eliminación definitiva de foros
  const handleConfirmDeleteForum = async () => {
    setOpenDeleteForumConfirm(false);

    if (!forumToDeleteId) return;

    setIsApiLoading(true);
    const token = localStorage.getItem('token');
    const endpoint = `${API_BASE_URL}/api/v1/foro/${forumToDeleteId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Fallo la eliminación del foro (HTTP ${response.status})`
        );
      }

      await fetchForums();
      setSnackbar({ open: true, message: `✅ Foro eliminado correctamente.`, severity: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al eliminar foro:', error);
      setSnackbar({
        open: true,
        message: `❌ Error al eliminar foro: ${message}`,
        severity: 'error',
      });
    } finally {
      setIsApiLoading(false);
      setForumToDeleteId(null);
    }
  };

  const handleSnackbarClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Función auxiliar para renderizar la tabla correcta
  const renderActiveView = () => {
    switch (activeView) {
      case 'users':
        return (
          <UserTable users={users} loading={userLoading} error={userError} onUserUpdate={fetchUsers} />
        );
      case 'books':
        return (
          <BookTable
            books={books}
            isLoading={booksLoading}
            error={booksError}
            onBookUpdate={fetchBooks}
            onEditBook={handleEditBookClick}
            onDeleteBook={handleOpenDeleteConfirm}
          />
        );
      case 'forums':
        return (
          <ForumTable
            forums={forums}
            loading={forumsLoading}
            error={forumsError}
            onForumUpdate={fetchForums}
            onEditForum={handleEditForumClick}
            onDeleteForum={handleOpenDeleteForumConfirm}
            onForumClick={(id: number) => {
              setSelectedForumId(id);
              setActiveView('forumCommentsAdmin');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardContainer
      sx={{
        width: '100%',
        minHeight: '100vh',
        padding: 4,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 1. Componente que agrupa la navegación y acciones */}
      <HeaderDashboard
        activeView={activeView}
        onNavigate={handleNavigate}
        onAddClick={handleAddClick}
        // Mostrar un loader global si hay operaciones de API pendientes (edición/eliminación)
        isLoading={isApiLoading}
      />

      {/* 2. Renderizado Condicional de la Tabla */}
      <Box sx={{ width: '100%', maxWidth: '1200px', flexGrow: 1, mt: 2 }}>{renderActiveView()}</Box>

      {/* Modal para CREAR usuario */}
      <Modal open={openCreateModal} onClose={handleCloseCreateModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
          }}
        >
          <UserForm onSave={handleSaveNewUser} onCancel={handleCloseCreateModal} />
        </Box>
      </Modal>

      {/* Modal para CREAR/EDITAR libro */}
      <Modal open={openCreateBookModal} onClose={handleCloseCreateBookModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: 24,
            p: 4,
          }}
        >
          <BookForm
            // bookToEdit determina si el formulario está en modo 'editar' o 'crear'
            bookToEdit={bookToEdit}
            title={bookToEdit ? 'Editar Libro' : 'Crear Nuevo Libro'}
            onSave={handleSaveBook} // Handler unificado (POST/PUT)
            onCancel={handleCloseCreateBookModal}
          />
        </Box>
      </Modal>

      <Modal open={openForumModal} onClose={() => setOpenForumModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
          }}
        >
          <ForumForm
            forumToEdit={forumToEdit} // Pasa el objeto del foro
            title={forumToEdit ? 'Editar Foro' : 'Crear Nuevo Foro'} // Título dinámico
            onSave={handleSaveForum} // Handler unificado (POST/PUT)
            onCancel={handleCloseForumModal} // Nuevo handler de cierre
          />
        </Box>
      </Modal>

      <Modal
        open={openForumDetail}
        onClose={() => setOpenForumDetail(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '90%',
            maxWidth: '700px',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          {selectedForumId && (
            <ForumDetail foroId={selectedForumId} onClose={() => setOpenForumDetail(false)} />
          )}
        </Box>
      </Modal>

      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="confirmar-eliminacion-titulo"
        aria-describedby="confirmar-eliminacion-descripcion"
      >
        <DialogTitle id="confirmar-eliminacion-titulo">{'Confirmar Eliminación'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmar-eliminacion-descripcion">
            Estás a punto de eliminar el libro con ID: **{bookToDeleteId}**. ¿Estás seguro de que
            quieres eliminar este libro? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* Botón "Cancelar" simplemente cierra el modal */}
          <Button onClick={handleCloseDeleteConfirm} color="primary" disabled={isApiLoading}>
            Cancelar
          </Button>
          {/* Botón "Eliminar" llama a la función de la API */}
          <Button
            onClick={handleConfirmDeleteBook}
            color="error"
            variant="contained"
            autoFocus
            disabled={isApiLoading}
          >
            {isApiLoading ? <CircularProgress size={24} color="inherit" /> : 'Sí, Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteForumConfirm}
        onClose={handleCloseDeleteForumConfirm}
        aria-labelledby="confirmar-eliminacion-foro-titulo"
      >
        <DialogTitle id="confirmar-eliminacion-foro-titulo">
          {'Confirmar Eliminación del Foro'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar el foro con ID: **{forumToDeleteId}**. ¿Estás seguro de que
            quieres eliminarlo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteForumConfirm} color="primary" disabled={isApiLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDeleteForum}
            color="error"
            variant="contained"
            autoFocus
            disabled={isApiLoading}
          >
            {isApiLoading ? <CircularProgress size={24} color="inherit" /> : 'Sí, Eliminar Foro'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default Dashboard;