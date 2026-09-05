// src/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../environments/api';
import type { Book } from '../types';

export function useFavorites() {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth() || {};

  // Fetch favoritos del usuario
  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al obtener favoritos');
      const data: Book[] = await res.json();
      setFavoriteBooks(data);
      console.log('FAVORITOS', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error('Error al cargar favoritos:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Agregar favorito
  const addFavorite = async (libro_id: number): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ libro_id }),
      });
      if (!res.ok) throw new Error('Error al agregar favorito');

      // Refrescar la lista completa de favoritos
      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('Error al agregar favorito:', err);
      return false;
    }
  };

  // Quitar favorito
  const removeFavorite = async (libro_id: number): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ libro_id }),
      });
      if (!res.ok) throw new Error('Error al quitar favorito');

      // Refrescar la lista completa de favoritos
      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('Error al quitar favorito:', err);
      return false;
    }
  };

  // Toggle favorito (combina add/remove)
  const toggleFavorite = async (libro_id: number, isFavorite: boolean): Promise<boolean> => {
    return isFavorite ? await removeFavorite(libro_id) : await addFavorite(libro_id);
  };

  // Función para verificar si un libro es favorito
  const isBookFavorite = (libro_id: number): boolean => {
    return favoriteBooks.some((book) => book.libro_id === libro_id);
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