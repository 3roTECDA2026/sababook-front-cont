import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../environments/api';

export function useFavorites() {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth() || {};

  // Fetch favoritos del usuario
  const fetchFavorites = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error('Error al obtener favoritos');
      const data = await res.json();
      setFavoriteBooks(data);
      console.log("FAVORITOS", data);
      
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      console.error("Error al cargar favoritos:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFavorites(controller.signal);
    return () => controller.abort();
  }, [fetchFavorites]);

  // Agregar favorito
  const addFavorite = async (libro_id) => {
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
      console.error("Error al agregar favorito:", err);
      return false;
    }
  };

  // Quitar favorito
  const removeFavorite = async (libro_id) => {
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
      console.error("Error al quitar favorito:", err);
      return false;
    }
  };

  // Toggle favorito (combina add/remove)
  const toggleFavorite = async (libro_id, isFavorite) => {
    return isFavorite ? await removeFavorite(libro_id) : await addFavorite(libro_id);
  };

  // Función para verificar si un libro es favorito
  const isBookFavorite = (libro_id) => {
    return favoriteBooks.some(book => book.libro_id === libro_id);
  };

  return { 
    favoriteBooks, 
    loading, 
    error, 
    addFavorite, 
    removeFavorite, 
    toggleFavorite, 
    isBookFavorite 
  };
}