
import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Avatar,
  Modal,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';

import type { AlertColor } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

import {
  ActionButton,
  DeleteButton,
} from '@/components/ui/ActionButton';

import { API_BASE_URL } from '@/environments/api';
import UserForm from '@/components/forms/UserForm';
import type { UserFormData } from '@/components/forms/UserForm';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TeacherCoursesSelect from '@/components/users/TeacherCoursesSelect';
import { useTeacherCourses } from '@/hooks/useTeacherCourses';
import type { TeacherCoursesSaveResult } from '@/hooks/useTeacherCourses';
import StudentCourseSelect from '@/components/users/StudentCourseSelect';
import { useStudentCourse } from '@/hooks/useStudentCourse';
import type { ListFilters, User } from '@/types';
import PaginationControls from '@/components/ui/PaginationControls';
import { downloadCsv } from '@/utils/downloadCsv';
import { getUsers } from '@/services/userService';

// --------------------------------------------------
// TIPOS
// --------------------------------------------------

interface UserTableProps {
  users: User[];
  loading?: boolean;
  error?: string | null;
  onUserUpdate: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // SAB-119 / SAB-060: los filtros se aplican en el servidor (los maneja el Dashboard)
  filters: ListFilters;
  searchQuery: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const CURRENT_SCHOOL_YEAR = new Date().getFullYear();

// Texto del resultado de guardar los cursos del docente (SAB-117)
const describeCoursesResult = ({ added, removed, failed }: TeacherCoursesSaveResult) => {
  const done: string[] = [];
  if (added > 0) done.push(added === 1 ? 'se asignó 1 curso' : `se asignaron ${added} cursos`);
  if (removed > 0) done.push(removed === 1 ? 'se quitó 1 curso' : `se quitaron ${removed} cursos`);
  const failedText = failed.map((f) => `No se pudo guardar ${f.courseLabel}: ${f.message}`).join(' ');
  return [done.length > 0 ? `Además, ${done.join(' y ')}.` : '', failedText].filter(Boolean).join(' ');
};

// --------------------------------------------------
// COMPONENTE USER TABLE
// --------------------------------------------------

export default function UserTable({
  users,
  loading,
  error,
  onUserUpdate,
  page,
  totalPages,
  onPageChange,
  filters,
  searchQuery,
}: UserTableProps) {
  const hasFilters =
    Boolean(searchQuery.trim()) ||
    Object.values(filters).some((value) => value !== undefined && value !== '');

  // --------------------------------------------------
  // ESTADOS
  // --------------------------------------------------

  const [openModal, setOpenModal] = useState<boolean>(false);

  const [userToEdit, setUserToEdit] =
    useState<User | null>(null);

  // SAB-117: cursos del docente que se está editando (según el rol guardado)
  const teacherCourses = useTeacherCourses(
    userToEdit?.rol === 'DOCENTE' ? userToEdit.usuario_id : null,
    CURRENT_SCHOOL_YEAR
  );

  // SAB-116: curso del alumno que se está editando (según el rol guardado)
  const isEditingStudent = userToEdit?.rol === 'ALUMNO';
  const studentCourse = useStudentCourse(
    isEditingStudent && userToEdit ? userToEdit.usuario_id : null,
    CURRENT_SCHOOL_YEAR,
    isEditingStudent
  );

  const [isSaving, setIsSaving] =
    useState<boolean>(false);

  // Datos del usuario esperando la confirmación para quitar cursos
  const [pendingUserData, setPendingUserData] =
    useState<UserFormData | null>(null);

  const [isDownloading, setIsDownloading] =
    useState<boolean>(false);

  const [confirmModalOpen, setConfirmModalOpen] =
    useState<boolean>(false);

  const [userToDelete, setUserToDelete] =
    useState<User | null>(null);

  const [snackbar, setSnackbar] =
    useState<SnackbarState>({
      open: false,
      message: '',
      severity: 'success',
    });

  // --------------------------------------------------
  // EDITAR USUARIO
  // --------------------------------------------------

  const handleEdit = (userId: number) => {
    const user = users.find(
      (u) => u.usuario_id === userId
    );

    setUserToEdit(user ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setUserToEdit(null);
    setPendingUserData(null);
  };

  const showNotification = (
    message: string,
    severity: AlertColor
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // --------------------------------------------------
  // DESCARGAR CSV
  // --------------------------------------------------

  // Exporta todos los usuarios de la búsqueda y los filtros, no solo los de la página actual
  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const allUsers = await getUsers({ ...filters, q: searchQuery });

      downloadCsv(
        hasFilters ? 'usuarios-filtrados.csv' : 'usuarios-todos.csv',
        [
          'ID',
          'Nombre',
          'Email',
          'Rol',
          'Fecha de registro',
          'Perfil completo',
          'URL de avatar',
          'Nivel educativo',
        ],
        allUsers.map((user) => [
          user.usuario_id,
          user.nombre,
          user.email,
          user.rol,
          user.fecha_registro,
          user.perfil_completo,
          user.avatar_url,
          user.nivel_educativo,
        ])
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'No se pudo descargar el CSV.',
        severity: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // --------------------------------------------------
  // NOTIFICACIONES
  // --------------------------------------------------

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
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

  // --------------------------------------------------
  // MAPEO DE ROLES
  // --------------------------------------------------

  // --------------------------------------------------
  // GUARDAR CAMBIOS DE USUARIO
  // --------------------------------------------------

  const handleSaveUser = async (
    formData: UserFormData
  ) => {
    if (!userToEdit) return;

    const dataToSend: UserFormData = {
      ...formData,
    };

    if (dataToSend.rol) {
      dataToSend.rol = String(dataToSend.rol).toUpperCase();
    }

    // SAB-117: un docente con cursos no puede cambiar de rol (quedarían cursos sin docente válido)
    const { totalAssigned } = teacherCourses;
    if (
      userToEdit.rol === 'DOCENTE' &&
      dataToSend.rol !== 'DOCENTE' &&
      totalAssigned > 0
    ) {
      showNotification(
        `Este docente tiene ${totalAssigned} ${totalAssigned === 1 ? 'curso asignado' : 'cursos asignados'}. Quitáselos antes de cambiar el rol.`,
        'error'
      );
      return;
    }

    // SAB-116: un alumno inscripto en un curso no puede cambiar de rol
    if (
      userToEdit.rol === 'ALUMNO' &&
      dataToSend.rol !== 'ALUMNO' &&
      studentCourse.currentId !== null
    ) {
      showNotification(
        `Este alumno está inscripto en ${studentCourse.currentLabel}. Quitalo del curso antes de cambiar el rol.`,
        'error'
      );
      return;
    }

    dataToSend.contrasena = dataToSend.password;

    delete dataToSend.password;

    if (!dataToSend.contrasena) {
      delete dataToSend.contrasena;
    }

    // Quitar cursos pide confirmación antes de guardar
    if (teacherCourses.toRemoveLabels.length > 0 || studentCourse.needsConfirmation) {
      setPendingUserData(dataToSend);
      return;
    }

    await saveUserAndCourses(dataToSend);
  };

  const saveUserAndCourses = async (
    dataToSend: UserFormData
  ) => {
    if (!userToEdit) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${userToEdit.usuario_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Error al actualizar el usuario'
        );
      }

      // SAB-117: después de guardar el usuario, se aplican los cambios de cursos
      const coursesResult =
        userToEdit.rol === 'DOCENTE' && teacherCourses.hasChanges
          ? await teacherCourses.save()
          : null;
      const coursesText = coursesResult ? describeCoursesResult(coursesResult) : '';

      // SAB-116: después de guardar el usuario, se aplica el cambio de curso del alumno
      const studentResult =
        userToEdit.rol === 'ALUMNO' && studentCourse.hasChanges
          ? await studentCourse.save()
          : null;

      const hasFailures =
        (!!coursesResult && coursesResult.failed.length > 0) || !!studentResult?.failed;

      onUserUpdate();
      showNotification(
        ['Usuario actualizado correctamente.', coursesText, studentResult?.text ?? '']
          .filter(Boolean)
          .join(' '),
        hasFailures ? 'warning' : 'success'
      );

      // Si algún curso falló, el modal queda abierto para ver cómo quedó
      if (!hasFailures) handleCloseModal();

    } catch (error) {
      console.error(
        'Error al guardar:',
        error
      );

      showNotification('Error al guardar el usuario', 'error');
    } finally {
      setIsSaving(false);
      setPendingUserData(null);
    }
  };

  // --------------------------------------------------
  // ELIMINAR USUARIO
  // --------------------------------------------------

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${userToDelete.usuario_id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          'Error al eliminar el usuario'
        );
      }

      onUserUpdate();

      setSnackbar({
        open: true,
        message: 'Usuario eliminado correctamente',
        severity: 'success',
      });

    } catch (error) {
      console.error(
        'Error al eliminar:',
        error
      );

      setSnackbar({
        open: true,
        message: 'Error al eliminar el usuario',
        severity: 'error',
      });

    } finally {
      handleCloseConfirmModal();
    }
  };

  // --------------------------------------------------
  // ESTADO DE CARGA
  // --------------------------------------------------

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
      >
        <CircularProgress />
      </Box>
    );
  }

  // --------------------------------------------------
  // ESTADO DE ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <Typography
        color="error"
        align="center"
        mt={4}
      >
        Error: {error}
      </Typography>
    );
  }

  // --------------------------------------------------
  // RENDERIZADO
  // --------------------------------------------------

  return (
    <>
      {/* DESCARGA CSV (los filtros están en el Dashboard) */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          mt: 3,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={users.length === 0 || isDownloading}
          sx={{
            backgroundColor: 'button.main',
            textTransform: 'none',
          }}
        >
          {isDownloading ? 'Descargando...' : 'Descargar CSV'}
        </Button>
      </Box>

      {/* TABLA DE USUARIOS */}

      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          maxWidth: 1200,
          mt: 3,
        }}
      >
        <Table aria-label="tabla de usuarios">
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>
                Fecha de Registro
              </TableCell>
              <TableCell>
                Nivel Educativo
              </TableCell>
              <TableCell align="center">
                Editar
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                >
                  {hasFilters
                    ? 'No hay usuarios que coincidan con los filtros.'
                    : 'No hay usuarios para mostrar.'}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: User) => (
                <TableRow key={user.usuario_id}>
                  <TableCell>
                    <Avatar
                      alt={user.nombre}
                      src={
                        user.avatar_url ??
                        undefined
                      }
                    >
                      {user.nombre
                        ? user.nombre[0].toUpperCase()
                        : '?'}
                    </Avatar>
                  </TableCell>

                  <TableCell>
                    {user.nombre}
                  </TableCell>

                  <TableCell>
                    {user.email}
                  </TableCell>

                  <TableCell>
                    {user.rol}
                  </TableCell>

                  <TableCell>
                    {user.fecha_registro
                      ? new Date(
                          user.fecha_registro
                        ).toLocaleDateString('es-ES')
                      : '-'}
                  </TableCell>

                  <TableCell>
                    {user.nivel_educativo || '-'}
                  </TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'center',
                      }}
                    >
                      <ActionButton
                        onClick={() =>
                          handleEdit(user.usuario_id)
                        }
                        title="Editar"
                        size="small"
                      >
                        <EditIcon
                          sx={{
                            fontSize: '1.1rem',
                          }}
                        />
                      </ActionButton>

                      <DeleteButton
                        onClick={() =>
                          handleDelete(user)
                        }
                        title="Eliminar"
                        size="small"
                      >
                        <DeleteIcon
                          sx={{
                            fontSize: '1.1rem',
                          }}
                        />
                      </DeleteButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINACIÓN REUTILIZABLE */}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
      />

      {/* MODAL EDITAR USUARIO */}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
            width: { xs: '95vw', sm: 600 },
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <UserForm
            userToEdit={userToEdit}
            onSave={handleSaveUser}
            onCancel={handleCloseModal}
            isSaving={isSaving}
            extraFields={
              // SAB-117: cursos del docente (según el rol guardado, no el del formulario)
              userToEdit?.rol === 'DOCENTE' ? (
                <TeacherCoursesSelect
                  courses={teacherCourses.availableCourses}
                  selectedIds={teacherCourses.selectedIds}
                  onChange={teacherCourses.setSelectedIds}
                  schoolYear={CURRENT_SCHOOL_YEAR}
                  isLoading={teacherCourses.isLoading}
                  error={teacherCourses.error}
                  onRetry={teacherCourses.reload}
                  disabled={isSaving}
                />
              ) : isEditingStudent ? (
                // SAB-116: curso del alumno (según el rol guardado)
                <StudentCourseSelect
                  courses={studentCourse.courses}
                  selectedId={studentCourse.selectedId}
                  onChange={studentCourse.setSelectedId}
                  schoolYear={CURRENT_SCHOOL_YEAR}
                  isLoading={studentCourse.isLoading}
                  error={studentCourse.error}
                  onRetry={studentCourse.reload}
                  disabled={isSaving}
                />
              ) : null
            }
          />
        </Box>
      </Modal>

      {/* SAB-117 / SAB-116: CONFIRMAR QUITAR CURSOS */}

      <ConfirmationModal
        open={pendingUserData !== null}
        onClose={() => setPendingUserData(null)}
        onConfirm={() => {
          if (pendingUserData) void saveUserAndCourses(pendingUserData);
        }}
        loading={isSaving}
        title={studentCourse.needsConfirmation ? 'Cambiar curso' : 'Quitar cursos'}
        message={
          studentCourse.needsConfirmation
            ? studentCourse.selectedId === null
              ? `¿Querés quitar a "${userToEdit?.nombre ?? ''}" de ${studentCourse.currentLabel}?`
              : `¿Querés pasar a "${userToEdit?.nombre ?? ''}" de ${studentCourse.currentLabel} a ${studentCourse.selectedLabel}?`
            : `¿Querés quitar a "${userToEdit?.nombre ?? ''}" de ${teacherCourses.toRemoveLabels.join(', ')}?`
        }
      />

      {/* NOTIFICACIONES */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* CONFIRMAR ELIMINACIÓN */}

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.nombre || userToDelete?.email || ''}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}