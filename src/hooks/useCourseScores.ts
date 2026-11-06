// src/hooks/useCourseScores.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPuntajesCurso, updateAnnualScoreVisibility } from '@/services/courseService';
import type { CourseScores } from '@/types';

export function useCourseScores(cursoId: number | null) {
  const [puntajes, setPuntajes] = useState<CourseScores | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cargaIdRef = useRef<number>(0);
  const [isSavingVisibility, setIsSavingVisibility] = useState<boolean>(false);

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

  // SAB-144: cambia el valor en pantalla enseguida y lo revierte si el back falla.
  // Solo toca el curso que se cambió, por si mientras tanto se eligió otro.
  const updateScoreVisibility = useCallback(async (courseId: number, visible: boolean) => {
    const applyVisibility = (value: boolean) =>
      setPuntajes((current) =>
        current?.curso.curso_id === courseId
          ? { ...current, curso: { ...current.curso, show_annual_score: value } }
          : current
      );

    setIsSavingVisibility(true);
    applyVisibility(visible);
    try {
      await updateAnnualScoreVisibility(courseId, visible);
    } catch (err) {
      applyVisibility(!visible);
      throw err;
    } finally {
      setIsSavingVisibility(false);
    }
  }, []);

  return { puntajes, cargando, error, recargar, isSavingVisibility, updateScoreVisibility };
}
