// src/components/ForumTable.tsx
import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  IconButton,
  styled,
  useTheme,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Forum } from '../types';

const ROWS_PER_PAGE = 5;

interface Column {
  id: string;
  label: string;
}

const columns: Column[] = [
  { id: 'titulo', label: 'Título' },
  { id: 'fecha_creacion', label: 'Fecha' },
  { id: 'creador_id', label: 'Creador' },
  { id: 'editar', label: 'Editar' },
];

// Estilos
const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  margin: theme.spacing(3),
  maxWidth: '1200px',
  width: '100%',
}));

const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
  color: theme.palette.body?.main || '#4A4C52',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  borderBottom: `2px solid ${theme.palette.grey[200]}`,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  color: '#FFFFFF',
  borderRadius: '8px',
  padding: '6px',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
}));

interface ForumTableProps {
  forums: Forum[];
  loading?: boolean;
  error?: string | null;
  onForumUpdate?: () => void;
  onForumClick?: (id: number) => void;
  onDeleteForum: (id: number) => void;
  onEditForum: (forum: Forum) => void;
}

const ForumTable = ({
  forums,
  loading,
  onDeleteForum,
  onEditForum,
}: ForumTableProps) => {
  const theme = useTheme();
  const [page, setPage] = useState<number>(1);
  const pageCount = Math.ceil(forums.length / ROWS_PER_PAGE);
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const currentForums = forums.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const navigate = useNavigate();

  const handleRowClick = (foroId: number) => {
    navigate(`/dashboard/forum-comments/${foroId}`);
  };

  if (loading) return <Typography sx={{ padding: 3 }}>Cargando foros...</Typography>;

  return (
    <StyledTableContainer>
      <Box sx={{ padding: theme.spacing(3), borderBottom: `1px solid ${theme.palette.grey[100]}` }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ color: theme.palette.body?.main || '#4A4C52' }}
        >
          Foros
        </Typography>
      </Box>

      <TableContainer>
        <Table stickyHeader aria-label="tabla de foros">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCellHeader
                  key={column.id}
                  align={column.id === 'editar' ? 'center' : 'left'}
                >
                  {column.label}
                </StyledTableCellHeader>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {currentForums.map((row) => (
              <TableRow
                hover
                key={row.foro_id}
                onClick={() => handleRowClick(row.foro_id)}
                sx={{ cursor: 'pointer' }}
              >
                {columns.map((column) => {
                  if (column.id === 'editar') {
                    return (
                      <TableCell key={column.id} align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <ActionButton
                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              onEditForum(row);
                            }}
                            title="Editar"
                          >
                            <EditIcon sx={{ fontSize: '1.1rem' }} />
                          </ActionButton>
                          <ActionButton
                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              onDeleteForum(row.foro_id);
                            }}
                            title="Eliminar"
                          >
                            <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                          </ActionButton>
                        </Box>
                      </TableCell>
                    );
                  }

                  const value = (row as unknown as Record<string, unknown>)[column.id];
                  return <TableCell key={column.id}>{value as React.ReactNode}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: theme.spacing(2),
          borderTop: `1px solid ${theme.palette.grey[100]}`,
        }}
      >
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
              borderRadius: '20px',
              '&:hover': {
                backgroundColor: '#cc4800',
              },
            },
            '& .MuiPaginationItem-root': {
              borderRadius: '20px',
              margin: '0 4px',
            },
          }}
        />
      </Box>
    </StyledTableContainer>
  );
};

export default ForumTable;