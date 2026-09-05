// src/components/BookTable.tsx
import React, { useState, ChangeEvent, MouseEvent } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';

// Se eliminan imports relacionados con la API, Dialogs, Snackbar, y useNavigate
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// 1. Definición de las constantes
const ROWS_PER_PAGE = 5;

interface Column {
  id: string;
  label: string;
}

const columns: Column[] = [
  { id: 'titulo', label: 'Título' },
  { id: 'autor', label: 'Autor' },
  { id: 'genero', label: 'Género' },
  { id: 'nivel_educativo', label: 'Nivel Educativo' },
  { id: 'acciones', label: 'Acciones' }, // Renombrado a 'acciones' para claridad
];

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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

type BookRow = Book & { id?: number };

interface BookTableProps {
  books?: BookRow[];
  isLoading?: boolean;
  error?: string | null;
  onBookUpdate?: () => void;
  onEditBook: (book: BookRow) => void;
  onDeleteBook: (libroId: number) => void;
}

// 3. Componente Principal
// 💡 Acepta los nuevos handlers de edición y eliminación
const BookTable = ({
  books = [],
  isLoading,
  error,
  onEditBook, // 💡 Nuevo prop: función que abre el modal de edición en el padre
  onDeleteBook, // 💡 Nuevo prop: función que ejecuta el DELETE en el padre
}: BookTableProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Estados de UI (Paginación)
  const [page, setPage] = useState<number>(1);

  // Lógica de Paginación
  const pageCount = Math.ceil(books.length / ROWS_PER_PAGE);
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const currentBooks = books.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  // 💡 Handlers que DELEGAN la acción al componente padre (Dashboard)
  const handleEdit = (book: BookRow) => {
    // Llama a la función del padre pasando todo el objeto 'book'
    onEditBook(book);
  };

  const handleDelete = (libro_id: number) => {
    // Llama a la función del padre pasando solo el ID
    onDeleteBook(libro_id);
  };

  // Handler para navegar a la administración de comentarios
  const handleRowClick = (bookId: number) => {
    navigate(`/dashboard/book-comments/${bookId}`);
  };

  // 🚨 Nota: Toda la lógica de DELETE, confirmación (Dialog), Snackbar y estados de loading/error internos
  // ha sido eliminada de este componente para simplificar y centralizar el estado en DashboardPage.jsx.

  //  Renderizado
  return (
    <StyledTableContainer>
      <TableContainer>
        <Table stickyHeader aria-label="tabla de libros">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCellHeader
                  key={column.id}
                  align={column.id === 'acciones' ? 'center' : 'left'}
                >
                  {column.label}
                </StyledTableCellHeader>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Se usa el prop isLoading que viene del Dashboard, que cubre fetch y acciones CRUD */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <CircularProgress
                    size={30}
                    sx={{ color: theme.palette.button?.main || '#f25600' }}
                  />
                  <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
                    Cargando libros...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <Typography variant="subtitle1" color="error">
                    🚨 {error}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    No se encontraron libros.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentBooks.map((row) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={row.libro_id || row.id}
                  onClick={() => handleRowClick(row.libro_id || (row.id as number))}
                  sx={{ cursor: 'pointer' }}
                >
                  {columns.map((column) => {
                    if (column.id === 'acciones') {
                      return (
                        <TableCell key={column.id} align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {/* 💡 Llama a onEditBook del padre, pasando toda la fila (row) */}
                            <ActionButton
                              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation(); // Evita que se active el onClick de la fila
                                handleEdit(row);
                              }}
                              title="Editar"
                            >
                              <EditIcon sx={{ fontSize: '1.1rem' }} />
                            </ActionButton>

                            {/* 💡 Llama a onDeleteBook del padre, pasando solo el ID */}
                            <ActionButton
                              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation(); // Evita que se active el onClick de la fila
                                handleDelete(row.libro_id || (row.id as number));
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
                    return <TableCell key={column.id}> {value as React.ReactNode} </TableCell>;
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer y Paginación */}
      {books.length > ROWS_PER_PAGE && !error && (
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
      )}
    </StyledTableContainer>
  );
};

export default BookTable;