// src/hooks/useForumDetail.ts
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../environments/api';
import type { ForumDetail } from '../types';

/**
 * Hook para obtener los datos de un foro por ID
 */
const useForumDetail = (foroId: number | string | undefined) => {
  const [foro, setForo] = useState<ForumDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!foroId) return;
    const controller = new AbortController();
    const fetchForo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/foro/${foroId}/comentarios`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('Error al cargar el foro');
        }
        const data: ForumDetail = await res.json();
        setForo(data);
        console.log('Datos del foro desde API:', data);
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setForo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchForo();
    return () => controller.abort();
  }, [foroId]);

  return { foro, loading, error };
};

export default useForumDetail;