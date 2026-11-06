// src/hooks/useCourseScores.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPuntajesCurso } from '@/services/courseService';
import type { CourseScores } from '@/types';

export function useCourseScores(cursoId: number | null) {
  const [puntajes, setPuntajes] = useState<CourseScores | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canceladoRef = useRef<boolean>(false);

  const cargarPuntajes = useCallback(() => {
    if (cursoId === null) {
      setPuntajes(null);
      setError(null);
      setCargando(false);
      return;
    }

    canceladoRef.current = false;
    setCargando(true);
    setError(null);

    getPuntajesCurso(cursoId)
      .then((data) => {
        if (!canceladoRef.current) setPuntajes(data);
      })
      .catch((err) => {
        if (canceladoRef.current) return;
        setPuntajes(null);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los puntajes.');
      })
      .finally(() => {
        if (!canceladoRef.current) setCargando(false);
      });
  }, [cursoId]);

  useEffect(() => {
    cargarPuntajes();
    return () => {
      canceladoRef.current = true;
    };
  }, [cargarPuntajes]);

  const recargar = useCallback(() => {
    cargarPuntajes();
  }, [cargarPuntajes]);

  return { puntajes, cargando, error, recargar };
}
