// src/components/teacherPanel/CourseStudentsCard.tsx
import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';

import StyledCard from '@/components/ui/StyledCard';
import PaginationControls from '@/components/ui/PaginationControls';
import { useCourseStudents } from '@/hooks/useCourseStudents';

// Alumnos por página: con un curso completo (25 o 30 alumnos), la tarjeta no empuja el resto del panel
const STUDENTS_PER_PAGE = 6;

interface CourseStudentsCardProps {
  courseId: number;
}

// Tarjeta "Alumnos del curso" del Panel docente (SAB-135).
// Usa StyledCard, como el resto de las tarjetas del panel.
// La lista llega completa del back y se pagina acá.
export default function CourseStudentsCard({ courseId }: CourseStudentsCardProps) {
  const theme = useTheme();
  const { students, isLoading, error, retry } = useCourseStudents(courseId);
  const [page, setPage] = useState<number>(1);

  const totalPages = Math.max(1, Math.ceil(students.length / STUDENTS_PER_PAGE));
  // Si al reintentar la lista quedó más corta, no se queda en una página que ya no existe
  const currentPage = Math.min(page, totalPages);
  const visibleStudents = students.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} sx={{ color: theme.palette.button?.main }} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      );
    }

    if (students.length === 0) {
      return (
        <Typography color="text.secondary">
          Este curso todavía no tiene alumnos inscriptos.
        </Typography>
      );
    }

    return (
      <>
        <List disablePadding>
          {visibleStudents.map((student, index) => (
            <ListItem
              key={student.usuario_id}
              divider={index < visibleStudents.length - 1}
              disableGutters
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.button?.main }}>
                  {student.nombre.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={student.nombre} secondary={student.email} />
            </ListItem>
          ))}
        </List>

        {/* Se oculta sola si hay una sola página */}
        <PaginationControls page={currentPage} totalPages={totalPages} onChange={setPage} />
      </>
    );
  };

  return (
    <StyledCard sx={{ mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Alumnos del curso
        </Typography>
        {!isLoading && !error && students.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {`${students.length} ${students.length === 1 ? 'alumno' : 'alumnos'}`}
          </Typography>
        )}
      </Box>
      {renderContent()}
    </StyledCard>
  );
}