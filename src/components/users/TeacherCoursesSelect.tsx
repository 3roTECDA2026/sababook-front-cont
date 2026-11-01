// src/components/users/TeacherCoursesSelect.tsx
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material';
import { formatCourseLabel } from '@/utils/course';
import type { CourseSummary } from '@/types';

interface TeacherCoursesSelectProps {
  courses: CourseSummary[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  schoolYear: number;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  disabled?: boolean;
}

// Desplegable de selección múltiple con los cursos que se le pueden asignar a un docente (SAB-117)
export default function TeacherCoursesSelect({
  courses,
  selectedIds,
  onChange,
  schoolYear,
  isLoading,
  error,
  onRetry,
  disabled = false,
}: TeacherCoursesSelectProps) {
  const labelOf = (id: number) => {
    const course = courses.find((c) => c.curso_id === id);
    return course ? formatCourseLabel(course) : `Curso ${id}`;
  };

  const helperText = isLoading
    ? 'Cargando cursos...'
    : courses.length === 0
      ? `No hay cursos disponibles en ${schoolYear}.`
      : `Cursos de ${schoolYear} sin docente asignado. Cada curso tiene un solo docente.`;

  return (
    <FormControl fullWidth error={!!error} disabled={disabled || isLoading}>
      <InputLabel id="teacher-courses-label">Asignar cursos</InputLabel>
      <Select
        labelId="teacher-courses-label"
        multiple
        value={selectedIds}
        onChange={(e) => {
          const value = e.target.value;
          onChange(typeof value === 'string' ? value.split(',').map(Number) : value);
        }}
        input={<OutlinedInput label="Asignar cursos" />}
        renderValue={(ids) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {ids.map((id) => (
              <Chip key={id} label={labelOf(id)} size="small" />
            ))}
          </Box>
        )}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
      >
        {courses.map((course) => (
          <MenuItem key={course.curso_id} value={course.curso_id}>
            <Checkbox checked={selectedIds.includes(course.curso_id)} />
            <ListItemText
              primary={formatCourseLabel(course)}
              secondary={course.materia.nombre}
            />
          </MenuItem>
        ))}
      </Select>

      {error ? (
        <FormHelperText component="div">
          {error}{' '}
          <Button size="small" onClick={onRetry} sx={{ ml: 1 }}>
            Reintentar
          </Button>
        </FormHelperText>
      ) : (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
