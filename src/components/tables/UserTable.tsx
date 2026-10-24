
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import type { User } from '@/types';
import PaginationControls from '@/components/ui/PaginationControls';
import { downloadCsv } from '@/utils/downloadCsv';

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
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

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
}: UserTableProps) {

  // --------------------------------------------------
  // ESTADOS
  // --------------------------------------------------

  const [openModal, setOpenModal] = useState<boolean>(false);

  const [userToEdit, setUserToEdit] =
    useState<User | null>(null);

  const [roleFilter, setRoleFilter] =
    useState<string>('todos');

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
  };

  // --------------------------------------------------
  // FILTRAR USUARIOS POR ROL
  // --------------------------------------------------

  const filteredUsers: User[] =
    roleFilter === 'todos'
      ? users
      : users.filter(
          (user) => user.rol === roleFilter
        );

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    onPageChange(1);
  };

  // --------------------------------------------------
  // DESCARGAR CSV
  // --------------------------------------------------

  const handleDownload = () => {
    downloadCsv(
      `usuarios-${roleFilter}.csv`,
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
      filteredUsers.map((user) => [
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

    dataToSend.contrasena = dataToSend.password;

    delete dataToSend.password;

    if (!dataToSend.contrasena) {
      delete dataToSend.contrasena;
    }

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

      handleCloseModal();
      onUserUpdate();

      setSnackbar({
        open: true,
        message: 'Usuario actualizado correctamente',
        severity: 'success',
      });

    } catch (error) {
      console.error(
        'Error al guardar:',
        error
      );

      setSnackbar({
        open: true,
        message: 'Error al guardar el usuario',
        severity: 'error',
      });
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
      {/* FILTROS Y DESCARGA CSV */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mt: 3,
          flexWrap: 'wrap',
        }}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 180 }}
        >
          <InputLabel id="users-role-filter-label">
            Filtrar por rol
          </InputLabel>

          <Select
            labelId="users-role-filter-label"
            value={roleFilter}
            label="Filtrar por rol"
            onChange={(event) =>
              handleRoleFilterChange(
                event.target.value
              )
            }
          >
            <MenuItem value="todos">
              Todos los roles
            </MenuItem>

            <MenuItem value="ALUMNO">
              Alumno
            </MenuItem>

            <MenuItem value="DOCENTE">
              Docente
            </MenuItem>

            <MenuItem value="ADMINISTRADOR">
              Administrador
            </MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={filteredUsers.length === 0}
          sx={{
            backgroundColor: 'button.main',
            textTransform: 'none',
          }}
        >
          Descargar CSV
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                >
                  No hay usuarios para el rol seleccionado.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: User) => (
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
          }}
        >
          <UserForm
            userToEdit={userToEdit}
            onSave={handleSaveUser}
            onCancel={handleCloseModal}
          />
        </Box>
      </Modal>

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
