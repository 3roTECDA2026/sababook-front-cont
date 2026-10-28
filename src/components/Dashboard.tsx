// src/components/Dashboard.tsx

import { useState, useEffect, useCallback } from 'react';
import type { SyntheticEvent } from 'react';

import {
  Box,
  Modal,
  Snackbar,
  Alert,
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
import ForumTable from './tables/ForumTable';
import GoalTable from './tables/GoalTable';

import SearchFilterBar from '@/components/ui/SearchFilterBar';
import { usePagination } from '@/hooks/usePagination';
import { getHistorialAsignaciones } from '@/services/courseService';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const DashboardContainer = Box;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('users');

  // =========================================================
  // BÚSQUEDA Y FILTROS
  // =========================================================

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentFilter, setCurrentFilter] = useState<string>('');

  // =========================================================
  // PAGINACIÓN DE USUARIOS
  // =========================================================

  const fetchUsersPage = useCallback(
    (page: number, limit: number, signal?: AbortSignal) => {
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();

      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (currentQuery) {
        params.append('q', currentQuery);
      }

      if (currentFilter) {
        params.append('filter', currentFilter);
      }

      return fetch(
        `${API_BASE_URL}/api/v1/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      ).then(async (res) => {
        if (!res.ok) {
          throw new Error('Error al cargar usuarios');
        }

        return res.json();
      });
    },
    [currentQuery, currentFilter]
  );

  const resetKey = JSON.stringify({
    q: currentQuery,
    filter: currentFilter,
  });

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

  // =========================================================
  // LIBROS
  // =========================================================

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  // =========================================================
  // MODALES
  // =========================================================

  const [openForumModal, setOpenForumModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openCreateBookModal, setOpenCreateBookModal] = useState(false);

  // =========================================================
  // METAS DE LECTURA
  // =========================================================

  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  const [openGoalModal, setOpenGoalModal] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<ReadingGoal | null>(null);
  const [openDeleteGoalConfirm, setOpenDeleteGoalConfirm] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<ReadingGoal | null>(null);

  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [isApiLoading, setIsApiLoading] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // =========================================================
  // FOROS
  // =========================================================

  const [forums, setForums] = useState<Forum[]>([]);
  const [forumsLoading, setForumsLoading] = useState(true);
  const [forumsError, setForumsError] = useState<string | null>(null);

  const [selectedForumId, setSelectedForumId] =
    useState<number | null>(null);

  const [openForumDetail, setOpenForumDetail] = useState(false);
  const [forumToEdit, setForumToEdit] = useState<Forum | null>(null);
  const [openDeleteForumConfirm, setOpenDeleteForumConfirm] = useState(false);
  const [forumToDelete, setForumToDelete] = useState<Forum | null>(null);

  // =========================================================
  // CARGAR LIBROS
  // =========================================================

  const fetchBooks = async (signal?: AbortSignal) => {
    try {
      setBooksLoading(true);
      setBooksError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No autenticado.');
      }

      const params = new URLSearchParams();

      if (currentQuery) {
        params.append('q', currentQuery);
      }

      if (currentFilter) {
        params.append('filter', currentFilter);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/v1/books?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Acceso denegado.');
        }

        throw new Error('Error al cargar los libros');
      }

      const data: Book[] = await res.json();

      if (!signal?.aborted) {
        setBooks(data);
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        return;
      }

      setBooksError(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      if (!signal?.aborted) {
        setBooksLoading(false);
      }
    }
  };

  // =========================================================
  // CARGAR FOROS
  // =========================================================

  const fetchForums = async (signal?: AbortSignal) => {
    try {
      setForumsLoading(true);
      setForumsError(null);

      const token = localStorage.getItem('token');

      const params = new URLSearchParams();

      if (currentQuery) {
        params.append('q', currentQuery);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/v1/forums?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Acceso denegado.');
        }

        throw new Error('Error al cargar los foros');
      }

      const data: Forum[] = await res.json();

      if (!signal?.aborted) {
        setForums(data);
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        return;
      }

      setForumsError(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      if (!signal?.aborted) {
        setForumsLoading(false);
      }
    }
  };

  // =========================================================
  // CARGAR METAS DE LECTURA
  // =========================================================

  const fetchGoals = async () => {
    try {
      setGoalsLoading(true);
      setGoalsError(null);

      const token = localStorage.getItem('token');

      const res = await fetch(
        `${API_BASE_URL}/api/v1/metas-lectura`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Acceso denegado.');
        }

        throw new Error('Error al cargar las metas de lectura');
      }

      const data: ReadingGoal[] = await res.json();

      setGoals(data);
    } catch (err) {
      setGoalsError(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setGoalsLoading(false);
    }
  };

  // =========================================================
  // BUSCADOR Y FILTROS
  // =========================================================

  const handleDashboardSearch = (
    searchTerm: string,
    filterValue?: string
  ) => {
    setCurrentQuery(searchTerm);

    if (filterValue !== undefined) {
      setCurrentFilter(filterValue);
    }
  };

  // =========================================================
  // CARGAR DATOS SEGÚN LA VISTA
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    if (activeView === 'books') {
      void fetchBooks(controller.signal);
    } else if (activeView === 'forums') {
      void fetchForums(controller.signal);
    } else if (activeView === 'goals') {
      void fetchGoals();
    }

    return () => {
      controller.abort();
    };
  }, [activeView, currentQuery, currentFilter]);

  // =========================================================
  // NAVEGACIÓN
  // =========================================================

  const handleNavigate = (viewName: DashboardView) => {
    setActiveView(viewName);

    setCurrentQuery('');
    setCurrentFilter('');
  };

  // =========================================================
  // CERRAR MODALES
  // =========================================================

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  const handleCloseCreateBookModal = () => {
    setOpenCreateBookModal(false);
    setBookToEdit(null);
  };

  const handleCloseForumModal = () => {
    setOpenForumModal(false);
    setForumToEdit(null);
  };

  // =========================================================
  // EDITAR LIBRO
  // =========================================================

  const handleEditBookClick = (book: Book) => {
    setBookToEdit(book);
    setOpenCreateBookModal(true);
  };

  // =========================================================
  // CREAR USUARIO
  // =========================================================

  const handleSaveNewUser = async (formData: UserFormData) => {
    const dataToSend: UserFormData = {
      ...formData,
    };

    if (dataToSend.rol) {
      dataToSend.rol = String(dataToSend.rol).toUpperCase();
    }

    dataToSend.contrasena = dataToSend.password;
    delete dataToSend.password;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear el usuario');
      }

      reloadUsers();
      handleCloseCreateModal();

      setSnackbar({
        open: true,
        message: 'Usuario creado correctamente',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);

      setSnackbar({
        open: true,
        message: 'Error al crear el usuario',
        severity: 'error',
      });
    }
  };

  // =========================================================
  // CREAR O EDITAR LIBRO
  // =========================================================

  const handleSaveBook = async (
    bookData: {
      libro_id?: number;
      [key: string]: unknown;
    }
  ) => {
    setIsApiLoading(true);

    const token = localStorage.getItem('token');

    const isEditing = !!bookData.libro_id;

    const endpoint = isEditing
      ? `${API_BASE_URL}/api/v1/books/${bookData.libro_id}`
      : `${API_BASE_URL}/api/v1/books`;

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.message ||
            `Falló la operación (HTTP ${response.status})`
        );
      }

      await fetchBooks();

      handleCloseCreateBookModal();

      setSnackbar({
        open: true,
        message: isEditing
          ? 'Libro actualizado correctamente.'
          : 'Libro creado correctamente.',
        severity: 'success',
      });

      return Promise.resolve();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        `Error al ${isEditing ? 'editar' : 'crear'} libro:`,
        error
      );

      setSnackbar({
        open: true,
        message: `Error: ${message}`,
        severity: 'error',
      });

      return Promise.reject(error);
    } finally {
      setIsApiLoading(false);
    }
  };

  // --- HANDLER PARA ABRIR EL MODAL DE CONFIRMACIÓN ---
  // Antes de pedir confirmación, revisa si el libro fue asignado a algún curso:
  // en ese caso no se puede eliminar y se avisa directamente
  const handleOpenDeleteConfirm = async (bookId: number) => {
    try {
      const historial = await getHistorialAsignaciones({ libro_id: bookId });
      if (historial.length > 0) {
        setSnackbar({
          open: true,
          message:
            'Este libro no se puede eliminar porque fue asignado a cursos y forma parte del historial.',
          severity: 'warning',
        });
        return;
      }
    } catch {
      // Si no se pudo consultar el historial, se sigue con la confirmación:
      // el back igual valida y responde 409 si corresponde
    }

    setBookToDelete(books.find((book) => book.libro_id === bookId) ?? null);
    setOpenDeleteConfirm(true); // Abre el modal
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setBookToDelete(null);
  };

  const handleConfirmDeleteBook = async () => {
    const bookId = bookToDelete?.libro_id;
    if (!bookId) return;

    setIsApiLoading(true);

    const token = localStorage.getItem('token');
    const endpoint = `${API_BASE_URL}/api/v1/books/${bookId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.mensaje ||
            errorData.message ||
            `Falló la eliminación (HTTP ${response.status})`
        );
      }

      await fetchBooks();

      setSnackbar({
        open: true,
        message: 'Libro eliminado correctamente.',
        severity: 'success',
      });
      setOpenDeleteConfirm(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      setSnackbar({
        open: true,
        message: `Error al eliminar: ${message}`,
        severity: 'error',
      });
    } finally {
      setIsApiLoading(false);
      setBookToDelete(null);
    }
  };

  // =========================================================
  // EDITAR FORO
  // =========================================================

  const handleEditForumClick = (forum: Forum) => {
    setForumToEdit(forum);
    setOpenForumModal(true);
  };

  // =========================================================
  // ELIMINAR META
  // =========================================================

  const handleOpenDeleteGoalConfirm = (goalId: number) => {
    const foundGoal = goals.find((g) => (g.meta_id ?? g.id) === goalId) ?? null;
    setGoalToDelete(foundGoal);
    setOpenDeleteGoalConfirm(true);
  };

  const handleCloseDeleteGoalConfirm = () => {
    setOpenDeleteGoalConfirm(false);
    setGoalToDelete(null);
  };

  const handleConfirmDeleteGoal = async () => {
    const goalId = goalToDelete?.meta_id ?? goalToDelete?.id;
    if (!goalId) return;

    setIsApiLoading(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/metas-lectura/${goalId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.message ||
            `Falló la eliminación (HTTP ${response.status})`
        );
      }

      await fetchGoals();

      setSnackbar({
        open: true,
        message: 'Meta de lectura eliminada correctamente.',
        severity: 'success',
      });
      setOpenDeleteGoalConfirm(false);
    } catch (err) {
      setGoalsError(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setIsApiLoading(false);
      setGoalToDelete(null);
    }
  };

  // =========================================================
  // BOTÓN AGREGAR
  // =========================================================

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

  // =========================================================
  // CREAR O EDITAR FORO
  // =========================================================

  const handleSaveForum = async (
    forumData: {
      foro_id?: number;
      [key: string]: unknown;
    }
  ) => {
    setIsApiLoading(true);

    const token = localStorage.getItem('token');

    const isEditing = !!forumData.foro_id;

    const endpoint = isEditing
      ? `${API_BASE_URL}/api/v1/forums/${forumData.foro_id}`
      : `${API_BASE_URL}/api/v1/forums`;

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(forumData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.message ||
            `Falló la operación (HTTP ${response.status})`
        );
      }

      await fetchForums();

      handleCloseForumModal();

      setSnackbar({
        open: true,
        message: isEditing
          ? 'Foro actualizado correctamente.'
          : 'Foro creado correctamente.',
        severity: 'success',
      });

      return Promise.resolve();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      setSnackbar({
        open: true,
        message: `Error: ${message}`,
        severity: 'error',
      });

      return Promise.reject(error);
    } finally {
      setIsApiLoading(false);
    }
  };

  // =========================================================
  // ELIMINAR FORO
  // =========================================================

  const handleOpenDeleteForumConfirm = (forumId: number) => {
    const foundForum = forums.find((f) => f.foro_id === forumId) ?? null;
    setForumToDelete(foundForum);
    setOpenDeleteForumConfirm(true);
  };

  const handleCloseDeleteForumConfirm = () => {
    setOpenDeleteForumConfirm(false);
    setForumToDelete(null);
  };

  const handleConfirmDeleteForum = async () => {
    const forumId = forumToDelete?.foro_id;
    if (!forumId) return;

    setIsApiLoading(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/forums/${forumId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.message ||
            `Falló la eliminación del foro (HTTP ${response.status})`
        );
      }

      await fetchForums();

      setSnackbar({
        open: true,
        message: 'Foro eliminado correctamente.',
        severity: 'success',
      });
      setOpenDeleteForumConfirm(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      setSnackbar({
        open: true,
        message: `Error al eliminar foro: ${message}`,
        severity: 'error',
      });
    } finally {
      setIsApiLoading(false);
      setForumToDelete(null);
    }
  };

  // =========================================================
  // SNACKBAR
  // =========================================================

  const handleSnackbarClose = (
    _event?: SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // =========================================================
  // ACTUALIZAR META DE LECTURA
  // =========================================================

  const handleSaveGoal = async (
    goalData: {
      meta_id?: number;
      id?: number;
      [key: string]: unknown;
    }
  ) => {
    setIsApiLoading(true);

    const token = localStorage.getItem('token');

    const endpoint =
      `${API_BASE_URL}/api/v1/metas-lectura/` +
      `${goalData.meta_id || goalData.id}`;

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
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.message ||
            `Falló la actualización (HTTP ${response.status})`
        );
      }

      await fetchGoals();

      setOpenGoalModal(false);
      setGoalToEdit(null);

      setSnackbar({
        open: true,
        message: 'Meta de lectura actualizada correctamente.',
        severity: 'success',
      });
    } catch (err) {
      setGoalsError(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setIsApiLoading(false);
    }
  };

  // =========================================================
  // RENDERIZAR VISTA ACTIVA
  // =========================================================

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
              setOpenForumDetail(true);
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

  // =========================================================
  // INTERFAZ PRINCIPAL
  // =========================================================

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
      {/* NAVEGACIÓN */}

      <HeaderDashboard
        activeView={activeView}
        onNavigate={handleNavigate}
        onAddClick={handleAddClick}
        isLoading={isApiLoading}
      />

      {/* BUSCADOR */}

      {['users', 'books', 'forums'].includes(activeView) && (
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            mt: 2,
          }}
        >
          <SearchFilterBar
            key={activeView}
            placeholder={`Buscar en ${
              activeView === 'users'
                ? 'usuarios'
                : activeView === 'books'
                  ? 'libros'
                  : 'foros'
            }...`}
            onSearch={handleDashboardSearch}
          />
        </Box>
      )}

      {/* TABLA ACTIVA */}

      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          flexGrow: 1,
          mt: 2,
          minHeight: '400px',
        }}
      >
        {renderActiveView()}
      </Box>

      {/* =====================================================
          MODAL CREAR USUARIO
      ===================================================== */}

      <Modal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
          }}
        >
          <UserForm
            onSave={handleSaveNewUser}
            onCancel={handleCloseCreateModal}
          />
        </Box>
      </Modal>

      {/* =====================================================
          MODAL CREAR O EDITAR LIBRO
      ===================================================== */}

      <Modal
        open={openCreateBookModal}
        onClose={handleCloseCreateBookModal}
      >
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
            title={
              bookToEdit
                ? 'Editar Libro'
                : 'Crear Nuevo Libro'
            }
            onSave={handleSaveBook}
            onCancel={handleCloseCreateBookModal}
          />
        </Box>
      </Modal>

      {/* =====================================================
          MODAL CREAR O EDITAR FORO
      ===================================================== */}

      <Modal
        open={openForumModal}
        onClose={handleCloseForumModal}
      >
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
            title={
              forumToEdit
                ? 'Editar Foro'
                : 'Crear Nuevo Foro'
            }
            onSave={handleSaveForum}
            onCancel={handleCloseForumModal}
          />
        </Box>
      </Modal>

      {/* =====================================================
          MODAL EDITAR META
      ===================================================== */}

      <Modal
        open={openGoalModal}
        onClose={() => {
          setOpenGoalModal(false);
          setGoalToEdit(null);
        }}
      >
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
              onCancel={() => {
                setOpenGoalModal(false);
                setGoalToEdit(null);
              }}
            />
          )}
        </Box>
      </Modal>

      {/* =====================================================
          DETALLE DEL FORO
      ===================================================== */}

      <Modal
        open={openForumDetail}
        onClose={() => {
          setOpenForumDetail(false);
          setSelectedForumId(null);
        }}
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
          {selectedForumId !== null && (
            <ForumDetail
              foroId={selectedForumId}
              onClose={() => {
                setOpenForumDetail(false);
                setSelectedForumId(null);
              }}
            />
          )}
        </Box>
      </Modal>

      {/* Confirmación eliminar libro */}
      <ConfirmationModal
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDeleteBook}
        title="Confirmar eliminación"
        loading={isApiLoading}
        message={
          bookToDelete
            ? `¿Estás seguro de que querés eliminar el libro "${bookToDelete.titulo}"? Esta acción no se puede deshacer.`
            : ''
        }
      />

      {/* Confirmación eliminar foro */}
      <ConfirmationModal
        open={openDeleteForumConfirm}
        onClose={handleCloseDeleteForumConfirm}
        onConfirm={handleConfirmDeleteForum}
        title="Confirmar eliminación del foro"
        loading={isApiLoading}
        message={
          forumToDelete
            ? `¿Estás seguro de que querés eliminar el foro "${forumToDelete.titulo}"? Esta acción no se puede deshacer.`
            : ''
        }
      />

      {/* Confirmación eliminar meta */}
      <ConfirmationModal
        open={openDeleteGoalConfirm}
        onClose={handleCloseDeleteGoalConfirm}
        onConfirm={handleConfirmDeleteGoal}
        title="Confirmar eliminación de la meta"
        loading={isApiLoading}
        message={
          goalToDelete
            ? `¿Estás seguro de que querés eliminar la meta de lectura "${goalToDelete.periodo_nombre || (goalToDelete.usuario_nombre ? `de ${goalToDelete.usuario_nombre}` : '') || goalToDelete.meta_id || goalToDelete.id}"? Esta acción no se puede deshacer.`
            : ''
        }
      />

      {/* =====================================================
          NOTIFICACIONES
      ===================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default Dashboard;