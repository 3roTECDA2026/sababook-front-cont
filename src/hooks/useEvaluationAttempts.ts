// src/hooks/useEvaluationAttempts.ts
import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/environments/api';
import { useAuth } from '@/hooks/useAuth';
import type { TriviaAttempt } from '@/types';

/**
 * Hook para cargar los intentos de una evaluación (vista del docente).
 * Solo pide datos cuando el diálogo está abierto y hay evaluación seleccionada.
 */
export const useEvaluationAttempts = (open: boolean, evaluationId: number | null) => {
  const [attempts, setAttempts] = useState<TriviaAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAttempts = useCallback(async () => {
    if (!open || !evaluationId) {
      setAttempts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/trivia/evaluacion/${evaluationId}/attempts`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (!res.ok) throw new Error('Error al cargar las respuestas de la evaluación.');
      setAttempts(await res.json());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message, err);
      setError(message);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, [open, evaluationId, token]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  return { attempts, loading, error, refetch: fetchAttempts };
};
