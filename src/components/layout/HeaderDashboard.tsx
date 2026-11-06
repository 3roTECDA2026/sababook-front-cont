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

// En el celular, los botones de secciones van de a dos por fila y ocupan todo el ancho
// de su columna. Desde 'sm' se ven como antes (SAB-142).
// Se ajusta acá y no en NavButton porque NavButton también se usa en otras pantallas.
const navButtonSx = {
  width: { xs: '100%', sm: 'auto' },
  minWidth: { xs: 0, sm: '150px' },
  m: { xs: 0, sm: 1 },
  px: { xs: 1, sm: '30px' },
};

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
  const {
    rachaActual: rachaReal,
    recordRacha: recordReal,
    cargando,
  } = useReadingStreak(mostrarRacha && rachaProp === undefined);
  const rachaActual = rachaProp !== undefined ? rachaProp : rachaReal;
  const recordRacha = recordProp !== undefined ? recordProp : recordReal;
  const currentTitle = titleMap[activeView] || 'Título Desconocido';

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', mb: 4 }}>
      {/* BARRA DE NAVEGACIÓN */}
      <Box
        sx={{
          display: { xs: 'grid', sm: 'flex' },
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 2 },
          marginBottom: 4,
        }}
      >
        <NavButton onClick={() => onNavigate('users')} isActive={activeView === 'users'} sx={navButtonSx}>
          Usuarios
        </NavButton>

        <NavButton onClick={() => onNavigate('books')} isActive={activeView === 'books'} sx={navButtonSx}>
          Libros
        </NavButton>

        <NavButton onClick={() => onNavigate('forums')} isActive={activeView === 'forums'} sx={navButtonSx}>
          Foros
        </NavButton>

        <NavButton
          onClick={() => onNavigate('moderation')}
          isActive={activeView === 'moderation'}
          sx={navButtonSx}
        >
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
          <ReadingStreak
            rachaActual={rachaActual}
            recordRacha={recordRacha}
            cargando={cargando}
          />
        )}
      </Box>
    </Box>
  );
};

export default HeaderDashboard;