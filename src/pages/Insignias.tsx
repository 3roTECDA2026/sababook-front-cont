// src/pages/Insignias.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Importa los componentes de la carpeta 'components'
import AppHeader from '../components/AppHeader';
import InsigniaUnica from '../components/InsigniaUnica';

// Importa el hook de autenticación
import { useAuth } from '../hooks/useAuth';
import { getUserMedals } from '../services/apiService';
import type { Medal } from '../types';

const Insignias = () => {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { user } = useAuth();

  // ----------------------------------------------------
  // DATOS DINÁMICOS (Se simula la obtención de datos del usuario)
  // ----------------------------------------------------

  const username = user ? user.nombre : 'Usuario'; // Obtener nombre real del usuario logueado

  // Estado para las medallas del usuario
  const [insigniasUsuario, setInsigniasUsuario] = useState<Medal[]>([]);

  useEffect(() => {
    if (user?.usuario_id) {
      getUserMedals(user.usuario_id)
        .then((medals) => {
          // Si el endpoint devuelve un array de strings o de objetos, ajusta aquí
          setInsigniasUsuario(Array.isArray(medals) ? medals : []);
          console.log(medals, user);
        })
        .catch(() => setInsigniasUsuario([]));
    }
  }, [user?.usuario_id]);

  // Fecha dinámica (formato en español, con mayúscula inicial)
  const formattedDate = (() => {
    const d = new Date();
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    // Usamos locale 'es-ES' y capitalizamos la primera letra
    return d.toLocaleDateString('es-ES', opts).replace(/^./, (c) => c.toUpperCase());
  })();

  // ----------------------------------------------------

  return (
    // Box principal para simular el contenedor de la pantalla de la app
    <Box
      sx={{
        maxWidth: {
          xs: 400, // Móvil
          sm: 600, // Tablet pequeña
          md: 800, // Tablet grande / Desktop pequeño
          lg: 1000, // Desktop
        },
        margin: '0 auto',
        height: '100vh',
        // Fondo general sutil
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* 1. COMPONENTE DE ENCABEZADO */}
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title={`Hola, ${username || 'Usuario'}`}
        subtitle={formattedDate}
      />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Paper contenedor con estilo similar a CommentSection */}
        <Paper sx={{ mx: 0, px: 0, display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: 'none' }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ color: theme.palette.body?.main || '#4A4C52' }}
          >
            Insignias
          </Typography>

          {/* 2. COMPONENTES DE LAS INSIGNIAS */}
          {(() => {
            const rows: Medal[][] = [];
            for (let i = 0; i < insigniasUsuario.length; i += 2) {
              rows.push(insigniasUsuario.slice(i, i + 2));
            }
            return rows.map((row, rowIndex) => (
              <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {row.map((insignia, index) => (
                  <Box key={insignia.medalla_id ?? index} sx={{ mx: 1 }}>
                    <InsigniaUnica insignia={insignia} />
                  </Box>
                ))}
              </Box>
            ));
          })()}
        </Paper>
      </Box>
    </Box>
  );
};

export default Insignias;