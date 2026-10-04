// src/hooks/useForumComments.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/environments/api';
import type { ForumComment } from '@/types';

export const useForumComments = (forumId: number | string | undefined) => {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!forumId || forumId === 'undefined' || forumId === 'null') return;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comments/forum/${forumId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error loading forum comments.');
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
  }, [forumId]);

  return { comments, loading, error, refetch: fetchComments };
};