// src/hooks/useForumDetail.ts
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/environments/api';
import type { ForumDetail } from '@/types';

const useForumDetail = (forumId: number | string | undefined) => {
  const [forum, setForum] = useState<ForumDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!forumId || forumId === 'undefined' || forumId === 'null') return;
    const fetchForum = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/forums/${forumId}/comments`);
        if (!res.ok) {
          throw new Error('Error loading forum details');
        }
        const data: ForumDetail = await res.json();
        setForum(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setForum(null);
      } finally {
        setLoading(false);
      }
    };
    fetchForum();
  }, [forumId]);

  return { forum, loading, error };
};

export default useForumDetail;