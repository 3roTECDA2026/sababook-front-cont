// src/hooks/useCourseScores.ts
import { useEffect, useState } from 'react';
import { getPuntajesCurso } from '@/services/courseService';
import type { CourseScores } from '@/types';

export function useCourseScores(cursoId: number | null) {
  const [puntajes, setPuntajes] = useState<CourseScores | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cursoId === null) {
      setPuntajes(null);
      setError(null);
      setCargando(false);
      return;
    }

    let cancelado = false;
    setCargando(true);
    setError(null);

    getPuntajesCurso(cursoId)
      .then((data) => {
        if (!cancelado) setPuntajes(data);
      })
      .catch((err) => {
        if (cancelado) return;
        setPuntajes(null);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los puntajes.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cursoId]);

  return { puntajes, cargando, error };
}
