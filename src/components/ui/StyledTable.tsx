// Estilos compartidos de las tablas de la app (contenedor con bordes redondeados y encabezado)
import { Paper, TableCell, styled } from '@mui/material';

export const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  marginTop: theme.spacing(1),
}));

export const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
  color: theme.palette.body?.main || '#4A4C52',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  borderBottom: `2px solid ${theme.palette.grey[200]}`,
}));
