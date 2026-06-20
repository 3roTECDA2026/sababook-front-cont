import { useEffect, useState } from "react";
import { API_BASE_URL } from "../environments/api";

/**
 * Hook para obtener los datos de un foro por ID
 * @param {string|number} foroId - ID del foro
 * @returns {object} { foro, loading, error }
 */
const useForumDetail = (foroId) => {
  const [foro, setForo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!foroId) return;
    const fetchForo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/foro/${foroId}/comentarios`);
        if (!res.ok) {
          throw new Error("Error al cargar el foro");
        }
        const data = await res.json();
        setForo(data);
        console.log("Datos del foro desde API:", data);
      } catch (err) {
        setError(err.message);
        setForo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchForo();
  }, [foroId]);

  return { foro, loading, error };
};

export default useForumDetail;
