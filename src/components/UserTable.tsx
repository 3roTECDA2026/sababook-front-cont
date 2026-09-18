// src/components/UserTable.tsx
import { useState, ChangeEvent } from 'react';
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
  IconButton,
  Modal,
  Pagination,
  useTheme,
  Snackbar,
  styled,
  Alert,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '../environments/api';
import UserForm from './UserForm';
import type { UserFormData } from './UserForm';
import ConfirmationModal from './ConfirmationModal';
import type { User } from '../types';

const ROWS_PER_PAGE = 5;

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  color: '#FFFFFF',
  borderRadius: '8px',
  padding: '6px',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
}));

type RolKey = 'alumno' | 'docente' | 'administrador';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  error?: string | null;
  onUserUpdate: () => void;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export default function UserTable({ users, loading, error, onUserUpdate }: UserTableProps) {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [page, setPage] = useState<number>(1);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleEdit = (userId: number) => {
    const user = users.find((u) => u.usuario_id === userId);
    setUserToEdit(user ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setUserToEdit(null);
  };

  const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Mapeo para convertir el nombre del rol a su ID, según la base de datos.
  // ¡Asegúrate de que estos IDs coincidan con los de tu tabla `rol` en el backend!
  const rolMapping: Record<RolKey, number> = {
    alumno: 1,
    docente: 2,
    administrador: 3,
  };

  const handleSaveUser = async (formData: UserFormData) => {
    console.log('Guardando datos del usuario:', formData);
    if (!userToEdit) return;

    // 1. Preparamos los datos para el backend.
    const dataToSend: UserFormData = { ...formData };

    // 2. Convertimos el rol a rol_id y renombramos la contraseña.
    dataToSend.rol_id = dataToSend.rol ? rolMapping[dataToSend.rol as RolKey] : undefined;
    dataToSend.contrasena = dataToSend.password;

    // 3. Eliminamos los campos que el backend no espera.
    delete dataToSend.rol;
    delete dataToSend.password;
    if (!dataToSend.contrasena) {
      delete dataToSend.contrasena;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${userToEdit.usuario_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      // Actualizamos el estado local para que el cambio se vea al instante
      handleCloseModal();
      onUserUpdate(); // Llamamos a la función del padre para refrescar los datos
      setSnackbar({ open: true, message: 'Usuario actualizado correctamente', severity: 'success' });
    } catch (error) {
      console.error('Error al guardar:', error);
      setSnackbar({ open: true, message: 'Error al guardar el usuario', severity: 'error' });
    }
  };

  const handleDelete = async (userId: number) => {
    // Abre el modal de confirmación y guarda el ID del usuario a eliminar
    setUserToDeleteId(userId);
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setUserToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDeleteId) return;

    try {
      const token = localStorage.getItem('token');
      // 2. Llamar a la API con el método DELETE
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${userToDeleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      // 3. Actualizar el estado para reflejar la eliminación en la UI
      setSnackbar({ open: true, message: 'Usuario eliminado correctamente', severity: 'success' });
      onUserUpdate(); // Llamamos a la función del padre para refrescar los datos
    } catch (error) {
      console.error('Error al eliminar:', error);
      setSnackbar({ open: true, message: 'Error al eliminar el usuario', severity: 'error' });
    } finally {
      // Cierra el modal independientemente del resultado
      handleCloseConfirmModal();
    }
  };

  // Mostramos un spinner mientras se cargan los datos.
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostramos un mensaje si hubo un error.
  if (error) {
    return (
      <Typography color="error" align="center" mt={4}>
        Error: {error}
      </Typography>
    );
  }

  const pageCount = Math.ceil(users.length / ROWS_PER_PAGE);
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const currentUsers = users.slice(startIndex, startIndex + ROWS_PER_PAGE);

  // 5. Renderizamos la tabla con los datos de los usuarios.
  return (
    <>
      <TableContainer component={Paper} sx={{ width: '100%', maxWidth: 1200, mt: 3 }}>
        <Table aria-label="tabla de usuarios">
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Fecha de Registro</TableCell>
              <TableCell>Nivel Educativo</TableCell>
              <TableCell align="center">Editar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user.usuario_id}>
                <TableCell>
                  <Avatar alt={user.nombre} src={user.avatar_url ?? undefined}>
                    {user.nombre ? user.nombre[0].toUpperCase() : '?'}
                  </Avatar>
                </TableCell>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.rol}</TableCell>
                <TableCell>
                  {user.fecha_registro
                    ? new Date(user.fecha_registro).toLocaleDateString('es-ES')
                    : '-'}
                </TableCell>
                <TableCell>{user.nivel_educativo || '-'}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <ActionButton onClick={() => handleEdit(user.usuario_id)} title="Editar" size="small">
                      <EditIcon sx={{ fontSize: '1.1rem' }} />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDelete(user.usuario_id)}
                      title="Eliminar"
                      size="small"
                      color="error"
                    >
                      <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                    </ActionButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handleChangePage}
            shape="rounded"
            color="primary" // Se mantiene por si sx falla, pero sx tiene prioridad
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: theme.palette.button?.main || '#f25600',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#cc4800', // Un naranja un poco más oscuro para el hover
                },
              },
            }}
          />
        </Box>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        {/* Este Box centra el formulario en la pantalla */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none', // Evita el borde de foco en el contenedor
          }}
        >
          <UserForm userToEdit={userToEdit} onSave={handleSaveUser} onCancel={handleCloseModal} />
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar al usuario con ID ${userToDeleteId}? Esta acción no se puede deshacer.`}
      />
    </>
  );
}