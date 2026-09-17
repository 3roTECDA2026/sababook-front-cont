import { useState, useEffect } from "react";
import { API_BASE_URL } from "../environments/api";

export const useBookDetails = (id) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const controller = new AbortController();
    const { signal } = controller;

    fetch(`${API_BASE_URL}/api/v1/libros/${id}`, { signal })
      .then((res) => {
        if (!res.ok) throw new Error("No se encontró el libro.");
        return res.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { book, loading, error };
};
