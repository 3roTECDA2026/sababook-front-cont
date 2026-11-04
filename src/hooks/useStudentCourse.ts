// src/hooks/useStudentCourse.ts
import { useEffect, useState } from 'react';
import {
  getCoursesByYear,
  getStudentCourses,
  moveStudent,
  unenrollStudent,
} from '@/services/courseService';
import { formatCourseLabel } from '@/utils/course';
import type { CourseSummary } from '@/types';

export interface StudentCourseSaveResult {
  text: string;
  failed: boolean;
}

// Curso de un alumno en un año lectivo (SAB-116). Cada alumno está en un solo curso por año.
// Con studentId = null (alta de usuario) solo se cargan los cursos del año para elegir.
// Con enabled = false no se carga nada (por ejemplo, si el usuario no es alumno).
export function useStudentCourse(studentId: number | null, schoolYear: number, enabled: boolean) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Inscripciones del alumno en todos los años: para no dejar cambiarle el rol si tiene alguna
  const [totalEnrollments, setTotalEnrollments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloads, setReloads] = useState<number>(0);

  useEffect(() => {
    setCourses([]);
    setCurrentId(null);
    setSelectedId(null);
    setTotalEnrollments(0);
    setError(null);
    if (!enabled) return;

    // Evita que una respuesta vieja pise a la nueva si se cambia de usuario rápido
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      getCoursesByYear(schoolYear),
      studentId !== null ? getStudentCourses(studentId) : Promise.resolve<CourseSummary[]>([]),
    ])
      .then(([yearCourses, studentCourses]) => {
        if (cancelled) return;
        setCourses(
          [...yearCourses].sort((a, b) => a.anio - b.anio || a.division.localeCompare(b.division))
        );
        const current = studentCourses.find((c) => c.anio_lectivo === schoolYear)?.curso_id ?? null;
        setCurrentId(current);
        setSelectedId(current);
        setTotalEnrollments(studentCourses.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los cursos.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId, schoolYear, enabled, reloads]);

  const labelOf = (courseId: number | null) => {
    if (courseId === null) return '';
    const course = courses.find((c) => c.curso_id === courseId);
    return course ? formatCourseLabel(course) : `Curso ${courseId}`;
  };

  const hasChanges = selectedId !== currentId;

  // Sacarlo de su curso actual (o pasarlo a otro) pide confirmación
  const needsConfirmation = currentId !== null && hasChanges;

  // Guarda el curso elegido. Elegir un curso lo inscribe o lo pasa de curso en una sola operación del back,
  // así nunca queda sin curso a mitad de camino. "Sin curso" lo quita del actual.
  // En el alta se pasa el ID del usuario recién creado.
  const save = async (targetStudentId: number | null = studentId): Promise<StudentCourseSaveResult> => {
    if (targetStudentId === null || !hasChanges) return { text: '', failed: false };

    try {
      if (selectedId !== null) {
        await moveStudent(selectedId, targetStudentId);
      } else if (currentId !== null) {
        await unenrollStudent(currentId, targetStudentId);
      }

      const text =
        selectedId === null
          ? `Además, se quitó del curso ${labelOf(currentId)}.`
          : `Además, se inscribió en ${labelOf(selectedId)}.`;
      return { text, failed: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido.';
      return { text: `No se pudo guardar el curso: ${message}`, failed: true };
    } finally {
      // Se recarga desde el back para mostrar lo que realmente quedó guardado
      setReloads((n) => n + 1);
    }
  };

  return {
    courses,
    currentId,
    currentLabel: labelOf(currentId),
    selectedId,
    selectedLabel: labelOf(selectedId),
    totalEnrollments,
    setSelectedId,
    isLoading,
    error,
    hasChanges,
    needsConfirmation,
    save,
    reload: () => setReloads((n) => n + 1),
  };
}