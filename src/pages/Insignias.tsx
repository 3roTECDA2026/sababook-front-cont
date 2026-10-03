// src/pages/Insignias.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AppHeader from '@/components/layout/AppHeader';
import InsigniaUnica from '@/components/ui/InsigniaUnica';

import { useAuth } from '@/hooks/useAuth';
import { getCatalogMedals } from '@/services/apiService';
import type { Medal } from '@/types';

const Insignias = () => {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { user } = useAuth();

  const username = user ? (user.name || (user as any).nombre) : 'Usuario';

  const [userMedals, setUserMedals] = useState<Medal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const currentUserId = user?.userId || (user as any)?.usuario_id;
    if (currentUserId) {
      setLoading(true);
      getCatalogMedals(currentUserId)
        .then((medals) => {
          setUserMedals(Array.isArray(medals) ? medals : []);
        })
        .catch(() => setUserMedals([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const formattedDate = (() => {
    const d = new Date();
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('es-ES', opts).replace(/^./, (c) => c.toUpperCase());
  })();

  return (
    <Box
      sx={{
        maxWidth: {
          xs: 400,
          sm: 600,
          md: 800,
          lg: 1000,
        },
        margin: '0 auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title={`Hola, ${username || 'Usuario'}`}
        subtitle={formattedDate}
      />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Paper sx={{ mx: 0, px: 0, display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: 'none' }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ color: theme.palette.body?.main || '#4A4C52' }}
          >
            Insignias
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Cargando insignias...
              </Typography>
            </Box>
          ) : userMedals.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                Todavía no tenés insignias
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Participá en foros y comentá libros para empezar a ganarlas.
              </Typography>
            </Box>
          ) : (
            (() => {
              const rows: Medal[][] = [];
              for (let i = 0; i < userMedals.length; i += 2) {
                rows.push(userMedals.slice(i, i + 2));
              }
              return rows.map((row, rowIndex) => (
                <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {row.map((insignia, index) => (
                    <Box key={insignia.medalId ?? index} sx={{ mx: 1 }}>
                      <InsigniaUnica insignia={insignia} />
                    </Box>
                  ))}
                </Box>
              ));
            })()
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Insignias;