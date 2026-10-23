import { useEffect, useState } from 'react';
import { getPanelDocente } from '@/services/courseService';
import type { PanelCourse, TeacherPanel } from '@/types';


export const DIAS_ABANDONO_POR_DEFECTO = 30;

export function useTeacherPanel() {
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [dias, setDias] = useState<number>(DIAS_ABANDONO_POR_DEFECTO);
  const [panel, setPanel] = useState<TeacherPanel | null>(null);
  // Los cursos se guardan aparte: si una consulta falla, el selector sigue disponible
  const [cursos, setCursos] = useState<PanelCourse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recargas, setRecargas] = useState<number>(0);

  useEffect(() => {
    // Evita que una respuesta vieja pise a la nueva si se cambia el filtro rápido
    let cancelado = false;
    setCargando(true);
    setError(null);

    getPanelDocente(cursoId, dias)
      .then((data) => {
        if (cancelado) return;
        setPanel(data);
        setCursos(data.cursos);
      })
      .catch((err) => {
        if (cancelado) return;
        // Se descartan las métricas anteriores para no mostrarlas como si fueran del filtro actual
        setPanel(null);
        setError(err instanceof Error ? err.message : 'No se pudo cargar el panel.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cursoId, dias, recargas]);

  const reintentar = () => setRecargas((n) => n + 1);

  return { cursoId, setCursoId, dias, setDias, cursos, panel, cargando, error, reintentar };
}
