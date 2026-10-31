// src/components/users/TeacherCoursesSection.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useTeacherCourses } from '@/hooks/useTeacherCourses';
import type { TeacherCoursesSaveResult } from '@/hooks/useTeacherCourses';
import { formatCourseLabel } from '@/utils/course';
import type { CourseSummary } from '@/types';

interface TeacherCoursesSectionProps {
  teacher: { usuario_id: number; nombre: string };
  onNotify: (message: string, severity: AlertColor) => void;
  // Cantidad de cursos del docente en todos los años (para bloquear el cambio de rol)
  onAssignedCountChange?: (count: number) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const SCHOOL_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1];

const describeResult = ({ added, removed, failed }: TeacherCoursesSaveResult) => {
  const done: string[] = [];
  if (added > 0) done.push(added === 1 ? 'se asignó 1 curso' : `se asignaron ${added} cursos`);
  if (removed > 0) done.push(removed === 1 ? 'se quitó 1 curso' : `se quitaron ${removed} cursos`);

  let message = done.length > 0 ? `${done.join(' y ')}.` : '';
  if (failed.length > 0) {
    const detail = failed.map((f) => `${f.courseLabel}: ${f.message}`).join(' ');
    message += `${message ? ' ' : ''}No se pudo guardar ${detail}`;
  }
  message = message.charAt(0).toUpperCase() + message.slice(1);

  const severity: AlertColor = failed.length === 0 ? 'success' : done.length > 0 ? 'warning' : 'error';
  return { message, severity };
};

export default function TeacherCoursesSection({
  teacher,
  onNotify,
  onAssignedCountChange,
}: TeacherCoursesSectionProps) {
  const [schoolYear, setSchoolYear] = useState<number>(CURRENT_YEAR);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const {
    courses,
    selectedIds,
    totalAssigned,
    isLoading,
    isSaving,
    error,
    hasChanges,
    toRemoveLabels,
    isTakenByOther,
    toggle,
    save,
    reload,
  } = useTeacherCourses(teacher.usuario_id, schoolYear);

  useEffect(() => {
    if (!isLoading) onAssignedCountChange?.(totalAssigned);
  }, [isLoading, totalAssigned, onAssignedCountChange]);

  // Cursos agrupados por año (1°, 2°, ...) y ordenados por división
  const coursesByYear = useMemo(() => {
    const groups = new Map<number, CourseSummary[]>();
    [...courses]
      .sort((a, b) => a.anio - b.anio || a.division.localeCompare(b.division))
      .forEach((course) => {
        groups.set(course.anio, [...(groups.get(course.anio) ?? []), course]);
      });
    return [...groups.entries()];
  }, [courses]);

  const runSave = async () => {
    const result = await save();
    setConfirmOpen(false);
    const { message, severity } = describeResult(result);
    onNotify(message, severity);
  };

  // Quitar cursos pide confirmación; asignar se guarda directo
  const handleSaveClick = () => {
    if (toRemoveLabels.length > 0) setConfirmOpen(true);
    else void runSave();
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 600,
        mx: 'auto',
        mt: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="secondary.main">
          Cursos asignados
        </Typography>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="teacher-courses-year-label">Año lectivo</InputLabel>
          <Select
            labelId="teacher-courses-year-label"
            label="Año lectivo"
            value={schoolYear}
            onChange={(e) => setSchoolYear(Number(e.target.value))}
            disabled={isSaving}
          >
            {SCHOOL_YEARS.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={reload}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      ) : courses.length === 0 ? (
        <Typography color="text.secondary">{`No hay cursos cargados para ${schoolYear}.`}</Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Cada curso tiene un solo docente. Los cursos de otro docente aparecen deshabilitados.
          </Typography>

          {coursesByYear.map(([year, yearCourses]) => (
            <Box key={year} sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {`${year}° año · ${yearCourses[0].materia.nombre}`}
              </Typography>
              <FormGroup row>
                {yearCourses.map((course) => {
                  const takenBy = isTakenByOther(course) ? course.docente : null;
                  const label = takenBy
                    ? `${formatCourseLabel(course)} · ${takenBy.nombre}`
                    : formatCourseLabel(course);

                  const control = (
                    <FormControlLabel
                      label={label}
                      control={
                        <Checkbox
                          checked={selectedIds.includes(course.curso_id)}
                          onChange={() => toggle(course.curso_id)}
                          disabled={takenBy !== null || isSaving}
                        />
                      }
                    />
                  );

                  return takenBy ? (
                    <Tooltip
                      key={course.curso_id}
                      title={`Este curso ya tiene docente. Para cambiarlo, quitáselo primero a ${takenBy.nombre}.`}
                    >
                      <span>{control}</span>
                    </Tooltip>
                  ) : (
                    <Box key={course.curso_id} component="span">
                      {control}
                    </Box>
                  );
                })}
              </FormGroup>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleSaveClick} disabled={!hasChanges || isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cursos'}
            </Button>
          </Box>
        </>
      )}

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void runSave()}
        loading={isSaving}
        title="Quitar cursos"
        message={`¿Querés quitar a "${teacher.nombre}" de ${toRemoveLabels.join(', ')}?`}
      />
    </Box>
  );
}
