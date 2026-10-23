
import { Box, Button, styled, Typography } from '@mui/material';
import NavButton from '@/components/ui/NavButton';
import ReadingStreak from './ReadingStreak';
import { useReadingStreak } from '@/hooks/useReadingStreak';

export type DashboardView =
  | 'users'
  | 'books'
  | 'forums'
  | 'goals'
  | 'forumCommentsAdmin'
  | 'moderation';

const titleMap: Partial<Record<DashboardView, string>> = {
  users: 'Usuarios',
  books: 'Libros',
  forums: 'Foros',
  goals: 'Metas de Lectura',
  moderation: 'Moderación IA',
};

const StyledAddButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  color: '#FFFFFF',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 20px',
  textTransform: 'none',
}));

const getAddButtonText = (activeView: DashboardView): string => {
  switch (activeView) {
    case 'users':
      return 'Agregar Usuario';
    case 'books':
      return 'Agregar Libro';
    case 'forums':
      return 'Agregar Foro';
    default:
      return 'Agregar';
  }
};

interface HeaderDashboardProps {
  activeView?: DashboardView;
  onNavigate?: (view: DashboardView) => void;
  onAddClick?: () => void;
  isLoading?: boolean;
  rachaActual?: number;
  recordRacha?: number;
  mostrarRacha?: boolean;
}

const HeaderDashboard = ({
  activeView = 'users',
  onNavigate = () => console.log('Navegación Desactivada'),
  onAddClick = () => console.log('Agregar Desactivado'),
  rachaActual: rachaProp,
  recordRacha: recordProp,
  mostrarRacha = true,
}: HeaderDashboardProps) => {
  const { rachaActual: rachaReal, recordRacha: recordReal } = useReadingStreak();
  const rachaActual = rachaProp !== undefined ? rachaProp : rachaReal;
  const recordRacha = recordProp !== undefined ? recordProp : recordReal;
  const currentTitle = titleMap[activeView] || 'Título Desconocido';

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', mb: 4 }}>
      {/* BARRA DE NAVEGACIÓN */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 4 }}>
        <NavButton onClick={() => onNavigate('users')} isActive={activeView === 'users'}>
          Usuarios
        </NavButton>

        <NavButton onClick={() => onNavigate('books')} isActive={activeView === 'books'}>
          Libros
        </NavButton>

        <NavButton onClick={() => onNavigate('forums')} isActive={activeView === 'forums'}>
          Foros
        </NavButton>

        <NavButton onClick={() => onNavigate('moderation')} isActive={activeView === 'moderation'}>
          Moderación IA
        </NavButton>
      </Box>

      {/* BARRA DE ACCIONES */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        {/* Espacio reservado para búsqueda */}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          {/* TÍTULO */}
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#555555', mb: 2 }}>
            {currentTitle}
          </Typography>

          {/* BOTÓN AGREGAR */}
          {activeView !== 'moderation' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <StyledAddButton onClick={onAddClick}>
                {getAddButtonText(activeView)}
              </StyledAddButton>
            </Box>
          )}
        </Box>

        {/* RACHA DE LECTURA */}
        {mostrarRacha && (
          <ReadingStreak rachaActual={rachaActual} recordRacha={recordRacha} />
        )}
      </Box>
    </Box>
  );
};

export default HeaderDashboard;
