// Tarjeta con el estilo general de Sababook (bordes redondeados y sombra suave)
import { Paper, styled } from '@mui/material';

export const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  padding: theme.spacing(2),
}));

export default StyledCard;
