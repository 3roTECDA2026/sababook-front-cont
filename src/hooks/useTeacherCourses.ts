import { useEffect, useState } from 'react';
import {
  assignTeacher,
  getCoursesByYear,
  getTeacherCourses,
  removeTeacher,
} from '@/services/courseService';
import { formatCourseLabel } from '@/utils/course';
import type { CourseSummary } from '@/types';

export interface TeacherCoursesSaveResult {
  added: number;
  removed: number;
  failed: { courseLabel: string; message: string }[];
}

// Cursos de un año lectivo y cuáles tiene un docente (SAB-117).
// Cada curso tiene un solo docente: los que tiene otro no se pueden tildar.
export function useTeacherCourses(teacherId: number | null, schoolYear: number, enabled = true) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Cursos del docente en todos los años: para no dejar cambiarle el rol si tiene alguno
  const [totalAssigned, setTotalAssigned] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloads, setReloads] = useState<number>(0);

  useEffect(() => {
    if (!enabled || teacherId === null) return;

    // Evita que una respuesta vieja pise a la nueva si se cambia de año o de usuario rápido
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([getCoursesByYear(schoolYear), getTeacherCourses(teacherId)])
      .then(([yearCourses, teacherCourses]) => {
        if (cancelled) return;
        setCourses(yearCourses);
        setSelectedIds(
          yearCourses.filter((c) => c.docente?.usuario_id === teacherId).map((c) => c.curso_id)
        );
        setTotalAssigned(teacherCourses.length);
      })
      .catch((err) => {
        if (cancelled) return;
        // Se descartan los cursos anteriores para no mostrarlos como si fueran del año elegido
        setCourses([]);
        setSelectedIds([]);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los cursos.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teacherId, schoolYear, enabled, reloads]);

  const assignedIds = courses
    .filter((c) => teacherId !== null && c.docente?.usuario_id === teacherId)
    .map((c) => c.curso_id);

  const toAdd = selectedIds.filter((id) => !assignedIds.includes(id));
  const toRemove = assignedIds.filter((id) => !selectedIds.includes(id));
  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  const isTakenByOther = (course: CourseSummary) =>
    course.docente !== null && course.docente.usuario_id !== teacherId;

  const toggle = (courseId: number) => {
    setSelectedIds((ids) =>
      ids.includes(courseId) ? ids.filter((id) => id !== courseId) : [...ids, courseId]
    );
  };

  const labelOf = (courseId: number) => {
    const course = courses.find((c) => c.curso_id === courseId);
    return course ? formatCourseLabel(course) : `Curso ${courseId}`;
  };

  // Aplica los cambios en paralelo: si alguno falla, los demás quedan guardados igual
  const save = async (): Promise<TeacherCoursesSaveResult> => {
    if (teacherId === null) return { added: 0, removed: 0, failed: [] };

    const operations = [
      ...toAdd.map((id) => ({ id, kind: 'add' as const, run: () => assignTeacher(id, teacherId) })),
      ...toRemove.map((id) => ({ id, kind: 'remove' as const, run: () => removeTeacher(id, teacherId) })),
    ];

    setIsSaving(true);
    const results = await Promise.allSettled(operations.map((op) => op.run()));
    setIsSaving(false);

    const result: TeacherCoursesSaveResult = { added: 0, removed: 0, failed: [] };
    results.forEach((r, i) => {
      const op = operations[i];
      if (r.status === 'fulfilled') {
        if (op.kind === 'add') result.added += 1;
        else result.removed += 1;
      } else {
        result.failed.push({
          courseLabel: labelOf(op.id),
          message: r.reason instanceof Error ? r.reason.message : 'Error desconocido.',
        });
      }
    });

    // Se recarga desde el back para mostrar lo que realmente quedó guardado
    setReloads((n) => n + 1);
    return result;
  };

  const reload = () => setReloads((n) => n + 1);

  return {
    courses,
    selectedIds,
    totalAssigned,
    isLoading,
    isSaving,
    error,
    hasChanges,
    toRemoveLabels: toRemove.map(labelOf),
    isTakenByOther,
    toggle,
    save,
    reload,
  };
}
