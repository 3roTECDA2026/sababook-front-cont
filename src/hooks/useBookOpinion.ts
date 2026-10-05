// src/hooks/useBookOpinion.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/environments/api';
import type { Opinion, OpinionAPI } from '@/types';

export const useBookOpinion = (bookId: number | string | undefined) => {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpinions = async () => {
    if (!bookId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reviews/book/${bookId}`);
      if (!res.ok) throw new Error('Error al cargar reseñas.');
      const data: Opinion[] = await res.json();
      setOpinions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, [bookId]);

  return { opinions, setOpinions, loading, error };
};