// src/hooks/useBookOpinion.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../environments/api';
import type { Opinion, OpinionAPI } from '../types';

export const useBookOpinion = (libroId: number | string | undefined) => {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpinions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/opinion/libro/${libroId}`);
      if (!res.ok) throw new Error('Error al cargar opiniones.');
      const data: OpinionAPI[] = await res.json();

      const transformed: Opinion[] = data.map((op) => ({
        id: op.opinion_id,
        comentario: op.comentario,
        calificacion: op.calificacion,
        usuario: {
          nombre: op.usuario_nombre || 'Usuario',
          rol: op.usuario_rol || 'Lector',
        },
        destacado: op.destacado || false,
        fecha: op.fecha,
      }));

      setOpinions(transformed);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, [libroId]);

  return { opinions, setOpinions, loading, error };
};