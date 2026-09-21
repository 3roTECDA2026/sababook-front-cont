import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, CircularProgress, Typography, LinearProgress, Box,
  Pagination, TextField, InputAdornment, useTheme, styled
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

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

const GoalTable = ({ goals, loading, error, onDeleteGoal, onEditGoal }) => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reiniciar a la primera página cuando se busca
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: '#f25600' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" py={4}>
        {error}
      </Typography>
    );
  }

  // Helper para resolver el nombre del usuario según cómo devuelva los datos el backend
  const getUserName = (goal) => {
    if (goal.usuario?.nombre) return goal.usuario.nombre;
    if (goal.usuario_nombre) return goal.usuario_nombre;
    if (typeof goal.usuario_id === 'object' && goal.usuario_id?.nombre) return goal.usuario_id.nombre;
    return goal.usuario_id ? `Estudiante ID: ${goal.usuario_id}` : 'N/A';
  };

  // Filtrado por nombre de estudiante
  const filteredGoals = (goals || []).filter((goal) => {
    const studentName = getUserName(goal).toLowerCase();
    return studentName.includes(searchTerm.toLowerCase());
  });

  const pageCount = Math.ceil(filteredGoals.length / ROWS_PER_PAGE);
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const currentGoals = filteredGoals.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <>
      {/* BARRA DE BÚSQUEDA CON LUPA */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 280, backgroundColor: '#FFFFFF', borderRadius: '8px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#f25600' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* TABLA DE METAS */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID Meta</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usuario / Estudiante</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Período</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Objetivo (Libros)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Progreso</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha Fin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentGoals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {searchTerm ? 'No se encontraron metas para el estudiante buscado.' : 'No hay metas de lectura registradas.'}
                </TableCell>
              </TableRow>
            ) : (
              currentGoals.map((goal) => {
                const currentProgress = goal.libros_leidos || goal.progreso || 0;
                const target = goal.cantidad_libros || 1;
                const percentage = Math.min(Math.round((currentProgress / target) * 100), 100);

                return (
                  <TableRow key={goal.meta_id || goal.id} hover>
                    <TableCell>{goal.meta_id || goal.id}</TableCell>
                    <TableCell>{getUserName(goal)}</TableCell>
                    <TableCell>{goal.periodo_nombre || 'Sin definir'}</TableCell>
                    <TableCell>{goal.cantidad_libros}</TableCell>
                    <TableCell style={{ width: '20%' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box width="100%">
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#FFE0B2',
                              '& .MuiLinearProgress-bar': { backgroundColor: '#f25600' }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary">{`${percentage}%`}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{goal.fecha_fin ? new Date(goal.fecha_fin).toLocaleDateString("es-ES") : 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <ActionButton onClick={() => onEditGoal(goal)} title="Editar" size="small">
                          <EditIcon sx={{ fontSize: '1.1rem' }} />
                        </ActionButton>
                        <ActionButton onClick={() => onDeleteGoal(goal.meta_id || goal.id)} title="Eliminar" size="small" color="error">
                          <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                        </ActionButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINACIÓN IDÉNTICA A LA TABLA DE USUARIOS */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handleChangePage}
            shape="rounded"
            color="primary"
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: theme.palette.button?.main || '#f25600',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#cc4800',
                },
              },
            }}
          />
        </Box>
      )}
    </>
  );
};

export default GoalTable;