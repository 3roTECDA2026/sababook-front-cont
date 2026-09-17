import { useState, useEffect } from "react";
import { API_BASE_URL } from "../environments/api";

export const useBookOpinion = (libroId) => {
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpinions = async (signal) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/opinion/libro/${libroId}`, { signal });
      if (!res.ok) throw new Error("Error al cargar opiniones.");
      const data = await res.json();

      const transformed = data.map((op) => ({
        id: op.opinion_id,
        comentario: op.comentario,
        calificacion: op.calificacion,
        usuario: {
          nombre: op.usuario_nombre || "Usuario",
          rol: op.usuario_rol || "Lector",
        },
        destacado: op.destacado || false,
        fecha: op.fecha,
      }));

      setOpinions(transformed);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchOpinions(controller.signal);
    return () => controller.abort();
  }, [libroId]);

  return { opinions, setOpinions, loading, error };
};
