// src/components/Dashboard.tsx
import { useState, useEffect, SyntheticEvent, useCallback } from 'react';
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

import HeaderDashboard from './layout/HeaderDashboard';
import type { DashboardView } from './layout/HeaderDashboard';
import ForumDetail from './ui/ForumDetail';
import UserForm from './forms/UserForm';
import type { UserFormData } from './forms/UserForm';
import ForumForm from './forms/ForumForm';
import BookForm from './forms/BookForm';
import GoalForm from './GoalForm';
import ModerationAdmin from './ModerationAdmin';
import { API_BASE_URL } from '@/environments/api';
import type { Book, Forum, User, ReadingGoal } from '@/types';
import UserTable from './tables/UserTable';
import BookTable from './tables/BookTable';
import { CrearListaModal } from './CrearListaModal';
import ForumTable from './tables/ForumTable';
import GoalTable from './tables/GoalTable';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import { usePagination } from '@/hooks/usePagination';

const DashboardContainer = Box;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

type RolKey = 'alumno' | 'docente' | 'administrador';

const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('users');

  // --- ESTADOS DE BÚSQUEDA Y FILTRO ---
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentFilter, setCurrentFilter] = useState<string>('');

  // --- PAGINACIÓN DE USUARIOS CONECTADA A BÚSQUEDA ---
  const fetchUsersPage = useCallback(
    (page: number, limit: number, signal?: AbortSignal) => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (currentQuery) params.append('q', currentQuery);
      if (currentFilter) params.append('filter', currentFilter);

      return fetch(`${API_BASE_URL}/api/v1/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      }).then(async (res) => {
        if (!res.ok) throw new Error('Error al cargar usuarios');
        return res.json();
      });
    },
    [currentQuery, currentFilter]
  );

  const resetKey = JSON.stringify({ q: currentQuery, filter: currentFilter });

  const {
    items: users,
    page: userPage,
    totalPages: userTotalPages,
    loading: userLoading,
    error: userError,
    goToPage: goToUserPage,
    reload: reloadUsers,
  } = usePagination<User>({
    fetchPage: fetchUsersPage,
    limit: 5,
    mode: 'replace',
    resetKey,
    enabled: activeView === 'users',
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  // --- ESTADOS DE MODALES Y EDICIÓN ---
  const [openForumModal, setOpenForumModal] = useState<boolean>(false);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [openCreateBookModal, setOpenCreateBookModal] = useState<boolean>(false);
  const [openRecommendModal, setOpenRecommendModal] = useState<boolean>(false);

  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState<boolean>(true);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [openGoalModal, setOpenGoalModal] = useState<boolean>(false);
  const [goalToEdit, setGoalToEdit] = useState<ReadingGoal | null>(null);
  const [openDeleteGoalConfirm, setOpenDeleteGoalConfirm] = useState<boolean>(false);
  const [goalToDeleteId, setGoalToDeleteId] = useState<number | null>(null);

  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [bookToDeleteId, setBookToDeleteId] = useState<number | null>(null);

  // --- ESTADOS DE FOROS ---
  const [forums, setForums] = useState<Forum[]>([]);
  const [forumsLoading, setForumsLoading] = useState<boolean>(true);
  const [forumsError, setForumsError] = useState<string | null>(null);
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [openForumDetail, setOpenForumDetail] = useState<boolean>(false);
  const [forumToEdit, setForumToEdit] = useState<Forum | null>(null);
  const [openDeleteForumConfirm, setOpenDeleteForumConfirm] = useState<boolean>(false);
  const [forumToDeleteId, setForumToDeleteId] = useState<number | null>(null);

  const rolMapping: Record<RolKey, number> = {
    alumno: 1,
    docente: 2,
    administrador: 3,
  };

  // --- FETCH LIBROS ---
  const fetchBooks = async (signal?: AbortSignal) => {
    try {
      setBooksLoading(true);
      setBooksError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado.');

      const params = new URLSearchParams();
      if (currentQuery) params.append('q', currentQuery);
      if (currentFilter) params.append('filter', currentFilter);

      const res = await fetch(`${API_BASE_URL}/api/v1/books?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Acceso denegado.');
        throw new Error('Error al cargar los libros');
      }
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : String(err);
      setBooksError(message);
    } finally {
      setBooksLoading(false);
    }
  };

  // --- FETCH FOROS ---
  const fetchForums = async (signal?: AbortSignal) => {
    try {
      setForumsLoading(true);
      setForumsError(null);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (currentQuery) params.append('q', currentQuery);

      const res = await fetch(`${API_BASE_URL}/api/v1/forums?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Acceso denegado.');
        throw new Error('Error al cargar los foros');
      }

      const data: Forum[] = await res.json();
      setForums(data);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : String(err);
      setForumsError(message);
    } finally {
      setForumsLoading(false);
    }
  };

  // --- FETCH METAS ---
  const fetchGoals = async () => {
    try {
      setGoalsLoading(true);
      setGoalsError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/metas-lectura`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error('Acceso denegado.');
        throw new Error('Error al cargar las metas de lectura');
      }

      const data: ReadingGoal[] = await res.json();
      setGoals(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGoalsError(msg);
    } finally {
      setGoalsLoading(false);
    }
  };

  // --- HANDLER DE BÚSQUEDA Y FILTRO UNIFICADO ---
  const handleDashboardSearch = (searchTerm: string, filterValue?: string) => {
    setCurrentQuery(searchTerm);
    if (filterValue !== undefined) {
      setCurrentFilter(filterValue);
    }
  };

  // --- useEffect para Cargar Datos según la vista activa o cambios en búsqueda ---
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    if (activeView === 'books') {
      fetchBooks(signal);
    } else if (activeView === 'forums') {
      fetchForums(signal);
    } else if (activeView === 'goals') {
      fetchGoals();
    }
    setBooksError(null);
    setForumsError(null);
    setGoalsError(null);

    return () => controller.abort();
  }, [activeView, currentQuery, currentFilter]);

  // --- UI HANDLERS ---
  const handleNavigate = (viewName: DashboardView) => {
    setActiveView(viewName);
    setCurrentQuery('');
    setCurrentFilter('');
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  const handleCloseCreateBookModal = () => {
    setOpenCreateBookModal(false);
    setBookToEdit(null);
  };

  const handleEditBookClick = (book: Book) => {
    setBookToEdit(book);
    setOpenCreateBookModal(true);
  };

  const handleSaveNewUser = async (formData: UserFormData) => {
    const dataToSend: UserFormData = { ...formData };
    dataToSend.rol_id = dataToSend.rol ? rolMapping[dataToSend.rol as RolKey] : undefined;
    dataToSend.contrasena = dataToSend.password;
    delete dataToSend.rol;
    delete dataToSend.password;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error('Error al crear el usuario');

      reloadUsers();
      handleCloseCreateModal();
      setSnackbar({ open: true, message: 'Usuario creado correctamente', severity: 'success' });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setSnackbar({ open: true, message: 'Error al crear el usuario', severity: 'error' });
    }
  };

  const handleSaveBook = async (bookData: { libro_id?: number; [key: string]: unknown }) => {
    setIsApiLoading(true);
    const token = localStorage.getItem('token');

    const isEditing = !!bookData.libro_id;
    const endpoint = isEditing
      ? `${API_BASE_URL}/api/v1/books/${bookData.libro_id}`
      : `${API_BASE_URL}/api/v1/books`;
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
      return Promise.reject(error);
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (bookId: number) => {
    setBookToDeleteId(bookId);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setBookToDeleteId(null);
  };

  const handleConfirmDeleteBook = async () => {
    setOpenDeleteConfirm(false);
    if (!bookToDeleteId) return;

    setIsApiLoading(true);
    const token = localStorage.getItem('token');
    const endpoint = `${API_BASE_URL}/api/v1/books/${bookToDeleteId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Fallo la eliminación (HTTP ${response.status})`);
      }

      await fetchBooks();
      setSnackbar({ open: true, message: `✅ Libro eliminado correctamente.`, severity: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al eliminar libro:', error);
      setSnackbar({ open: true, message: `❌ Error al eliminar: ${message}`, severity: 'error' });
    } finally {
      setIsApiLoading(false);
      setBookToDeleteId(null);
    }
  };

  const handleEditForumClick = (forum: Forum) => {
    setForumToEdit(forum);
    setOpenForumModal(true);
    setBookToDeleteId(null);
  };

  const handleOpenDeleteGoalConfirm = (goalId: number) => {
    setGoalToDeleteId(goalId);
    setOpenDeleteGoalConfirm(true);
  };

  const handleCloseDeleteGoalConfirm = () => {
    setOpenDeleteGoalConfirm(false);
    setGoalToDeleteId(null);
  };

  const handleConfirmDeleteGoal = async () => {
    setOpenDeleteGoalConfirm(false);
    if (!goalToDeleteId) return;

    setIsApiLoading(true);
    const token = localStorage.getItem('token');
    const endpoint = `${API_BASE_URL}/api/v1/metas-lectura/${goalToDeleteId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Fallo al eliminar la meta (HTTP ${response.status})`);
      }

      await fetchGoals();
      setSnackbar({ open: true, message: `✅ Meta de lectura eliminada correctamente.`, severity: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGoalsError(msg);
    } finally {
      setIsApiLoading(false);
      setGoalToDeleteId(null);
    }
  };

  const handleCloseForumModal = () => {
    setOpenForumModal(false);
    setForumToEdit(null);
  };

  const handleAddClick = () => {
    if (activeView === 'users') {
      setOpenCreateModal(true);
    } else if (activeView === 'forums') {
      setForumToEdit(null);
      setOpenForumModal(true);
    } else if (activeView === 'books') {
      setBookToEdit(null);
      setOpenCreateBookModal(true);
    }
  };

  const handleSaveForum = async (forumData: { foro_id?: number; [key: string]: unknown }) => {
    setIsApiLoading(true);
    const token = localStorage.getItem('token');

    const isEditing = !!forumData.foro_id;
    const endpoint = isEditing
      ? `${API_BASE_URL}/api/v1/forums/${forumData.foro_id}`
      : `${API_BASE_URL}/api/v1/forums`;
    const method = isEditing ? 'PUT' : 'POST';

    const dataToSend = isEditing
      ? forumData
      : {
          ...forumData,
          creador_id: parseInt(localStorage.getItem('userId') ?? ''),
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

  const handleOpenDeleteForumConfirm = (forumId: number) => {
    setForumToDeleteId(forumId);
    setOpenDeleteForumConfirm(true);
  };

  const handleCloseDeleteForumConfirm = () => {
    setOpenDeleteForumConfirm(false);
    setForumToDeleteId(null);
  };

  const handleConfirmDeleteForum = async () => {
    setOpenDeleteForumConfirm(false);

    if (!forumToDeleteId) return;

    setIsApiLoading(true);
    const token = localStorage.getItem('token');
    const endpoint = `${API_BASE_URL}/api/v1/forums/${forumToDeleteId}`;

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

  const handleSaveGoal = async (goalData: { meta_id?: number; id?: number; [key: string]: unknown }) => {
    setIsApiLoading(true);
    const token = localStorage.getItem('token');
    const endpoint = `${API_BASE_URL}/api/v1/metas-lectura/${goalData.meta_id || goalData.id}`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Fallo al actualizar la meta (HTTP ${response.status})`);
      }

      await fetchGoals();
      setOpenGoalModal(false);
      setGoalToEdit(null);
      setSnackbar({ open: true, message: '✅ Meta de lectura actualizada correctamente.', severity: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGoalsError(msg);
    } finally {
      setIsApiLoading(false);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'users':
        return (
          <UserTable
            users={users}
            loading={userLoading && users.length === 0}
            error={userError}
            onUserUpdate={reloadUsers}
            page={userPage}
            totalPages={userTotalPages}
            onPageChange={goToUserPage}
          />
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
              setActiveView('forumCommentsAdmin' as unknown as DashboardView);
            }}
          />
        );
      case 'goals':
        return (
          <GoalTable
            goals={goals}
            loading={goalsLoading}
            error={goalsError}
            onDeleteGoal={handleOpenDeleteGoalConfirm}
            onEditGoal={(goal: ReadingGoal) => {
              setGoalToEdit(goal);
              setOpenGoalModal(true);
            }}
          />
        );
      case 'moderation':
        return <ModerationAdmin />;
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
      {/* 1. Navegación y Acciones */}
      <HeaderDashboard
        activeView={activeView}
        onNavigate={handleNavigate}
        onAddClick={handleAddClick}
        onRecommendClick={() => setOpenRecommendModal(true)}
        isLoading={isApiLoading}
      />

      {/* 2. Buscador Reutilizable */}
      {['users', 'books', 'forums'].includes(activeView) && (
        <Box sx={{ width: '100%', maxWidth: '1200px', mt: 2 }}>
          <SearchFilterBar
            key={activeView}
            placeholder={`Buscar en ${
              activeView === 'users' ? 'usuarios' : activeView === 'books' ? 'libros' : 'foros'
            }...`}
            onSearch={handleDashboardSearch}
          />
        </Box>
      )}

      {/* 3. Renderizado de la Tabla Actual */}
      <Box sx={{ width: '100%', maxWidth: '1200px', flexGrow: 1, mt: 2, minHeight: '400px' }}>
        {renderActiveView()}
      </Box>

      {/* Modal Usuario */}
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

      {/* Modal Recomendaciones */}
      <CrearListaModal
        open={openRecommendModal}
        onClose={() => setOpenRecommendModal(false)}
        onListaCreada={() => {
          setOpenRecommendModal(false);
          setSnackbar({
            open: true,
            message: 'Libro recomendado correctamente',
            severity: 'success',
          });
        }}
      />

      {/* Modal Libro */}
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
            bookToEdit={bookToEdit}
            title={bookToEdit ? 'Editar Libro' : 'Crear Nuevo Libro'}
            onSave={handleSaveBook}
            onCancel={handleCloseCreateBookModal}
          />
        </Box>
      </Modal>

      {/* Modal Foro */}
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
            forumToEdit={forumToEdit}
            title={forumToEdit ? 'Editar Foro' : 'Crear Nuevo Foro'}
            onSave={handleSaveForum}
            onCancel={handleCloseForumModal}
          />
        </Box>
      </Modal>

      {/* Modal Meta de Lectura */}
      <Modal open={openGoalModal} onClose={() => setOpenGoalModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
          }}
        >
          {goalToEdit && (
            <GoalForm
              goalToEdit={goalToEdit}
              onSave={handleSaveGoal}
              onCancel={() => setOpenGoalModal(false)}
            />
          )}
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

      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>{'Confirmar Eliminación'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar el libro con ID: **{bookToDeleteId}**. ¿Estás seguro de que deseas eliminar este libro?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary" disabled={isApiLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDeleteBook} color="error" variant="contained" disabled={isApiLoading}>
            {isApiLoading ? <CircularProgress size={24} color="inherit" /> : 'Sí, Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteForumConfirm} onClose={handleCloseDeleteForumConfirm}>
        <DialogTitle>{'Confirmar Eliminación del Foro'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar el foro con ID: **{forumToDeleteId}**. ¿Estás seguro de que deseas eliminarlo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteForumConfirm} color="primary" disabled={isApiLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDeleteForum} color="error" variant="contained" disabled={isApiLoading}>
            {isApiLoading ? <CircularProgress size={24} color="inherit" /> : 'Sí, Eliminar Foro'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteGoalConfirm} onClose={handleCloseDeleteGoalConfirm}>
        <DialogTitle>Confirmar Eliminación de la Meta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar la meta de lectura con ID: **{goalToDeleteId}**. ¿Estás seguro de que deseas eliminarla?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteGoalConfirm} color="primary" disabled={isApiLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDeleteGoal} color="error" variant="contained" disabled={isApiLoading}>
            {isApiLoading ? <CircularProgress size={24} color="inherit" /> : 'Sí, Eliminar Meta'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default Dashboard;