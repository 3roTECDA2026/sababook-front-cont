// src/hooks/useForum.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../environments/api';
import type { Forum } from '../types';

export const useForums = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch(`${API_BASE_URL}/api/v1/foro`, { signal })
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar los foros');
        return res.json();
      })
      .then((data: Forum[]) => {
        setForums(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : String(err);
        console.error(err);
        setError(message);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { forums, loading, error };
};