// src/hooks/useForumCommentsAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../environments/api';
import type { Forum } from '../types';

export const useForumCommentsAdmin = (foroId: string | undefined, refetchComments?: () => Promise<void>) => {
  const [forumInfo, setForumInfo] = useState<Partial<Forum> | null>(null);
  const [loadingForum, setLoadingForum] = useState<boolean>(true);
  const [errorForum, setErrorForum] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!foroId) {
      setLoadingForum(false);
      return;
    }

    const controller = new AbortController();

    const fetchForum = async () => {
      setLoadingForum(true);
      setErrorForum(null);

      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/forums/${foroId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) {
          await res.text();
          throw new Error('Error al cargar el foro');
        }

        const data = await res.json();
        setForumInfo(data);
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : String(err);
        console.error('🚨 ERROR FETCH FORO:', err);
        setErrorForum(message);
      } finally {
        setLoadingForum(false);
      }
    };

    fetchForum();
    return () => controller.abort();
  }, [foroId]);

  const updateComment = useCallback(
    async (comentarioId: number, comentario: string) => {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/comments/${comentarioId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ comentario }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al actualizar comentario');
        }
        if (refetchComments) {
          await refetchComments();
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [refetchComments]
  );

  const deleteComment = useCallback(
    async (comentarioId: number) => {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/comments/${comentarioId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al eliminar comentario');
        }
        if (refetchComments) {
          await refetchComments();
        }
      } finally {
        setIsDeleting(false);
      }
    },
    [refetchComments]
  );

  return {
    forumInfo,
    loadingForum,
    errorForum,
    updateComment,
    deleteComment,
    isUpdating,
    isDeleting,
  };
};
