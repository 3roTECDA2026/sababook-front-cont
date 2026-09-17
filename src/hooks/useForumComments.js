import { useState, useEffect } from "react";
import { API_BASE_URL } from "../environments/api";

export const useForumComments = (foroId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async (signal) => {
    if (!foroId) return;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token"); // <- Token agregado
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comentario/${foroId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });
      if (!res.ok) throw new Error("Error al cargar comentarios del foro.");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchComments(controller.signal);
    return () => controller.abort();
  }, [foroId]);

  return { comments, loading, error, refetch: fetchComments };
};
