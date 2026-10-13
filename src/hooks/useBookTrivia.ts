// src/hooks/useBookTrivia.ts
import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/environments/api';
import { useAuth } from '@/hooks/useAuth';
import type { TriviaQuestion, TriviaModo } from '@/types';

/**
 * Hook para administrar las preguntas de trivia de un libro, filtradas por
 * modo (trivia o evaluación). Expone la carga, el alta y el borrado.
 */
export const useBookTrivia = (
  bookId: number | undefined,
  mode: TriviaModo,
  evaluationId?: number | null,
) => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchQuestions = useCallback(async () => {
    if (!bookId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/libro/${bookId}`);
      if (!res.ok) throw new Error('Error al cargar las preguntas de trivia.');
      const data: TriviaQuestion[] = await res.json();

      setQuestions(
        data.filter(
          (question) =>
            question.mode === mode &&
            (mode !== 'evaluacion' || question.evaluationId === evaluationId),
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message, err);
      setError(message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [bookId, mode, evaluationId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Crear pregunta
  const addQuestion = async (input: Omit<TriviaQuestion, 'id'>): Promise<boolean> => {
    if (!bookId) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookId, evaluationId, ...input }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Error al guardar la pregunta.');
      }

      const created: TriviaQuestion = await res.json();
      setQuestions((prev) => [...prev, created]);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message, err);
      setError(message);
      return false;
    }
  };

  // Eliminar pregunta
  const deleteQuestion = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Error al eliminar la pregunta.');

      setQuestions((prev) => prev.filter((question) => question.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message, err);
      setError(message);
      return false;
    }
  };

  return { questions, loading, error, addQuestion, deleteQuestion };
};
