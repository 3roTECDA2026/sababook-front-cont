// src/hooks/useForumComments.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../environments/api';
import type { ForumComment } from '../types';

export const useForumComments = (foroId: number | string | undefined) => {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!foroId) return;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token'); // <- Token agregado
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comentario/${foroId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al cargar comentarios del foro.');
      const data: ForumComment[] = await res.json();
      setComments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [foroId]);

  return { comments, loading, error, refetch: fetchComments };
};