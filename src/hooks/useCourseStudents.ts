// src/hooks/useCourseStudents.ts
import { useEffect, useState } from 'react';
import { getCourseStudents } from '@/services/courseService';
import type { CourseStudent } from '@/types';

// Alumnos inscriptos en un curso (SAB-135).
// La página monta la tarjeta con key={courseId}, así que al cambiar de curso
// el hook arranca de cero y nunca muestra alumnos del curso anterior.
export function useCourseStudents(courseId: number) {
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState<number>(0);

  useEffect(() => {
    // Cancela la consulta si el componente se desmonta o se reintenta antes de que responda
    const controller = new AbortController();

    getCourseStudents(courseId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setStudents(data);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los alumnos.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [courseId, reloadCount]);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    setReloadCount((n) => n + 1);
  };

  return { students, isLoading, error, retry };
}