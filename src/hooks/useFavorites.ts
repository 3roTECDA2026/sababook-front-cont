// src/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '@/environments/api';
import type { Book } from '@/types';

export function useFavorites() {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth() || {};

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error fetching favorites');
      const data: Book[] = await res.json();
      setFavoriteBooks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (bookId: number): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error('Error adding favorite');

      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('Error adding favorite:', err);
      return false;
    }
  };

  const removeFavorite = async (bookId: number): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error('Error removing favorite');

      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('Error removing favorite:', err);
      return false;
    }
  };

  const toggleFavorite = async (bookId: number, isFavorite: boolean): Promise<boolean> => {
    return isFavorite ? await removeFavorite(bookId) : await addFavorite(bookId);
  };

  const isBookFavorite = (bookId: number): boolean => {
    return favoriteBooks.some((book) => (book.bookId || (book as any).libro_id) === bookId);
  };

  return {
    favoriteBooks,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isBookFavorite,
  };
}