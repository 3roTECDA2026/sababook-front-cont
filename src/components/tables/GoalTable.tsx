

import React, { useState } from 'react';
import type { ReadingGoal } from '@/types/goal';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  LinearProgress,
  Box,
  Pagination,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import {
  ActionButton,
  DeleteButton,
} from '@/components/ui/ActionButton';

const ROWS_PER_PAGE = 5;

interface Goal extends ReadingGoal {
  id?: number;
  usuario?: { nombre: string };
  usuario_nombre?: string;
}

interface GoalTableProps {
  goals: ReadingGoal[];
  loading: boolean;
  error?: string | null;
  onDeleteGoal: (goalId: number) => void;
  onEditGoal: (goal: ReadingGoal) => void;
}

const GoalTable: React.FC<GoalTableProps> = ({
  goals,
  loading,
  error,
  onDeleteGoal,
  onEditGoal,
}) => {
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const getUserName = (goal: Goal): string => {
    if (goal.usuario?.nombre) {
      return goal.usuario.nombre;
    }

    if (goal.usuario_nombre) {
      return goal.usuario_nombre;
    }

    return goal.usuario_id
      ? `Estudiante ID: ${goal.usuario_id}`
      : 'N/A';
  };

  const filteredGoals = (goals || []).filter((goal) => {
    const studentName = getUserName(goal).toLowerCase();

    return studentName.includes(
      searchTerm.toLowerCase()
    );
  });

  const pageCount = Math.ceil(
    filteredGoals.length / ROWS_PER_PAGE
  );

  const startIndex = (page - 1) * ROWS_PER_PAGE;

  const currentGoals = filteredGoals.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        py={6}
      >
        <CircularProgress
          sx={{ color: '#f25600' }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography
        color="error"
        align="center"
        py={4}
      >
        {error}
      </Typography>
    );
  }

  return (
    <>
      {/* BUSCADOR */}
      <Box
        display="flex"
        justifyContent="flex-end"
        mb={2}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            width: 280,
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: '#f25600' }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* TABLA DE METAS */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          boxShadow: 3,
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead
            sx={{ backgroundColor: '#F5F5F5' }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                ID Meta
              </TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>
                Usuario / Estudiante
              </TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>
                Período
              </TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>
                Objetivo (Libros)
              </TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>
                Progreso
              </TableCell>

              <TableCell sx={{ fontWeight: 'bold' }}>
                Fecha Fin
              </TableCell>

              <TableCell
                sx={{ fontWeight: 'bold' }}
                align="center"
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentGoals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{
                    py: 4,
                    color: 'text.secondary',
                  }}
                >
                  {searchTerm
                    ? 'No se encontraron metas para el estudiante buscado.'
                    : 'No hay metas de lectura registradas.'}
                </TableCell>
              </TableRow>
            ) : (
              currentGoals.map((goal) => {
                const currentProgress =
                  goal.libros_leidos ??
                  goal.progreso ??
                  0;

                const target =
                  goal.cantidad_libros || 1;

                const percentage = Math.max(
                  0,
                  Math.min(
                    Math.round(
                      (currentProgress / target) * 100
                    ),
                    100
                  )
                );

                const goalId =
                  goal.meta_id ?? goal.id;

                return (
                  <TableRow
                    key={goalId}
                    hover
                  >
                    <TableCell>
                      {goalId ?? 'N/A'}
                    </TableCell>

                    <TableCell>
                      {getUserName(goal)}
                    </TableCell>

                    <TableCell>
                      {goal.periodo_nombre || 'Sin definir'}
                    </TableCell>

                    <TableCell>
                      {goal.cantidad_libros}
                    </TableCell>

                    {/* PROGRESO */}
                    <TableCell
                      sx={{ width: '20%' }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Box width="100%">
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#FFE0B2',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#f25600',
                              },
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {percentage}%
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* FECHA */}
                    <TableCell>
                      {goal.fecha_fin
                        ? new Date(
                            goal.fecha_fin
                          ).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <ActionButton
                          onClick={() => onEditGoal(goal)}
                          title="Editar"
                          size="small"
                        >
                          <EditIcon
                            sx={{ fontSize: '1.1rem' }}
                          />
                        </ActionButton>

                        <DeleteButton
                          onClick={() => {
                            if (goalId !== undefined) {
                              onDeleteGoal(goalId);
                            }
                          }}
                          title="Eliminar"
                          size="small"
                          disabled={goalId === undefined}
                        >
                          <DeleteIcon
                            sx={{ fontSize: '1.1rem' }}
                          />
                        </DeleteButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINACIÓN */}
      {pageCount > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3,
          }}
        >
          <Pagination
            count={pageCount}
            page={Math.min(page, pageCount)}
            onChange={handleChangePage}
            shape="rounded"
            color="primary"
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor:
                  theme.palette.button?.main || '#f25600',
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
