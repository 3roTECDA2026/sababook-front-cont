// src/hooks/useEvaluations.ts
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '@/environments/api';
import { useAuth } from '@/hooks/useAuth';
import type { Evaluacion } from '@/types';

/**
 * Hook para listar las evaluaciones de un libro y crear nuevas.
 * Se usa desde la vista de docentes (TriviaPage).
 */
export const useEvaluations = () => {
  const [evaluations, setEvaluations] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Evaluaciones de un libro (la más reciente es la primera)
  const fetchEvaluations = useCallback(async (bookId: number): Promise<Evaluacion[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/evaluacion/libro/${bookId}`);
      if (!res.ok) throw new Error('No se pudieron cargar las evaluaciones del libro.');
      const data: Evaluacion[] = await res.json();
      setEvaluations(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message, err);
      setError(message);
      setEvaluations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una evaluación con fecha límite
  const createEvaluation = async (bookId: number, deadline: string): Promise<Evaluacion | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/evaluacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookId, deadline }),
      });
      if (!res.ok) throw new Error('No se pudo crear la evaluación.');

      const evaluacion: Evaluacion = await res.json();
      setEvaluations((prev) => [...prev, evaluacion]);
      return evaluacion;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message, err);
      setError(message);
      return null;
    }
  };

  return { evaluations, loading, error, fetchEvaluations, createEvaluation };
};
