// src/components/users/StudentCourseSelect.tsx
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { formatCourseLabel } from '@/utils/course';
import type { CourseSummary } from '@/types';

interface StudentCourseSelectProps {
  courses: CourseSummary[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
  schoolYear: number;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  disabled?: boolean;
}

// Valor del Select para "Sin curso"
const NO_COURSE = '';

// Desplegable con los cursos del año lectivo para inscribir a un alumno (SAB-116).
// Cada alumno está en un solo curso por año.
export default function StudentCourseSelect({
  courses,
  selectedId,
  onChange,
  schoolYear,
  isLoading,
  error,
  onRetry,
  disabled = false,
}: StudentCourseSelectProps) {
  const helperText = isLoading
    ? 'Cargando cursos...'
    : courses.length === 0
      ? `No hay cursos cargados en ${schoolYear}.`
      : `Curso del alumno en ${schoolYear}. Cada alumno está en un solo curso por año.`;

  return (
    <FormControl fullWidth error={!!error} disabled={disabled || isLoading}>
      <InputLabel id="student-course-label" shrink>
        Curso
      </InputLabel>
      <Select
        labelId="student-course-label"
        label="Curso"
        notched
        displayEmpty
        value={selectedId === null ? NO_COURSE : String(selectedId)}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value === NO_COURSE ? null : Number(value));
        }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
      >
        <MenuItem value={NO_COURSE}>
          <em>Sin curso</em>
        </MenuItem>
        {courses.map((course) => (
          <MenuItem key={course.curso_id} value={String(course.curso_id)}>
            {`${formatCourseLabel(course)} · ${course.materia.nombre}`}
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