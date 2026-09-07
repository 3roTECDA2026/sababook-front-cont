// src/hooks/useBookDetails.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../environments/api';
import type { Book } from '../types';

export const useBookDetails = (id: number | string | undefined) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/v1/libros/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se encontró el libro.');
        return res.json();
      })
      .then((data: Book) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setLoading(false);
      });
  }, [id]);

  return { book, loading, error };
};