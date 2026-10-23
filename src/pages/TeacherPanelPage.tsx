// src/pages/TeacherPanelPage.tsx
import { useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import AppHeader from '@/components/layout/AppHeader';
import SideMenu from '@/components/layout/SideMenu';
import AbandonedReadingsTable from '@/components/teacherPanel/AbandonedReadingsTable';
import TeacherPanelRankings from '@/components/teacherPanel/TeacherPanelRankings';
import TeacherPanelStats from '@/components/teacherPanel/TeacherPanelStats';
import { useTeacherPanel } from '@/hooks/useTeacherPanel';
import { etiquetaCursoPanel } from '@/utils/course';
import { AppButton } from '@/components/atoms/AppButton';

const OPCIONES_DIAS = [15, 30, 60, 90];

export default function TeacherPanelPage() {
  const theme = useTheme();
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const { cursoId, setCursoId, dias, setDias, cursos, panel, cargando, error, reintentar } =
    useTeacherPanel();

  const renderContenido = () => {
    if (error) {
      return (
        <Alert
          severity="error"
          action={
            <AppButton variant="text" size="small" onClick={reintentar}>
              Reintentar
            </AppButton>
          }
        >
          {error}
        </Alert>
      );
    }

    if (!panel) {
      return (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress sx={{ color: theme.palette.button?.main || '#f25600' }} />
        </Box>
      );
    }

    if (cursos.length === 0) {
      return (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No tenés cursos asignados.
        </Typography>
      );
    }

    // Mientras se actualiza un filtro, los datos anteriores se muestran atenuados
    return (
      <Box sx={{ opacity: cargando ? 0.5 : 1, transition: 'opacity 0.2s' }} aria-busy={cargando}>
        <TeacherPanelStats resumen={panel.resumen} />
        <TeacherPanelRankings
          libros={panel.libros_mas_elegidos}
          generos={panel.generos_mas_elegidos}
        />
        <AbandonedReadingsTable
          abandonados={panel.abandonados}
          cursos={cursos}
          dias={panel.resumen.dias_abandono}
        />
      </Box>
    );
  };

  return (
    <Box py={2} px={1} sx={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <AppHeader
        onMenuClick={() => setMenuAbierto(true)}
        title="Panel docente"
        subtitle="Cómo leen los alumnos de tus cursos"
      />
      <SideMenu open={menuAbierto} onClose={() => setMenuAbierto(false)} active="Panel docente" />

      <Box display="flex" gap={2} flexWrap="wrap" mt={2} mb={3}>
        <TextField
          select
          id="curso"
          name="curso"
          label="Curso"
          value={cursoId ?? ''}
          onChange={(e) => setCursoId(e.target.value === '' ? null : Number(e.target.value))}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          sx={{ minWidth: 240, flexGrow: 1 }}
        >
          <MenuItem value="">Todos mis cursos</MenuItem>
          {cursos.map((curso) => (
            <MenuItem key={curso.curso_id} value={curso.curso_id}>
              {etiquetaCursoPanel(curso)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          id="dias"
          name="dias"
          label="Abandonado después de"
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
          sx={{ minWidth: 200 }}
        >
          {OPCIONES_DIAS.map((opcion) => (
            <MenuItem key={opcion} value={opcion}>
              {`${opcion} días en "Leyendo"`}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {renderContenido()}
    </Box>
  );
}
