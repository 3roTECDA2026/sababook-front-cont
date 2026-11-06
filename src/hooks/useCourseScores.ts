// src/hooks/useCourseScores.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPuntajesCurso } from '@/services/courseService';
import type { CourseScores } from '@/types';

export function useCourseScores(cursoId: number | null) {
  const [puntajes, setPuntajes] = useState<CourseScores | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cargaIdRef = useRef<number>(0);

  const cargarPuntajes = useCallback(() => {
    if (cursoId === null) {
      setPuntajes(null);
      setError(null);
      setCargando(false);
      return;
    }

    const miCarga = ++cargaIdRef.current;
    setCargando(true);
    setError(null);

    getPuntajesCurso(cursoId)
      .then((data) => {
        if (miCarga === cargaIdRef.current) setPuntajes(data);
      })
      .catch((err) => {
        if (miCarga === cargaIdRef.current) {
          setPuntajes(null);
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los puntajes.');
        }
      })
      .finally(() => {
        if (miCarga === cargaIdRef.current) setCargando(false);
      });
  }, [cursoId]);

  useEffect(() => {
    cargarPuntajes();
  }, [cargarPuntajes]);

  const recargar = useCallback(() => {
    cargarPuntajes();
  }, [cargarPuntajes]);

  return { puntajes, cargando, error, recargar };
}
