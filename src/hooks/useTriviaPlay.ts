// src/hooks/useTriviaPlay.ts
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { API_BASE_URL } from '../environments/api';
import { useAuth } from './useAuth';
import type { Evaluacion, PlayAnswer, PlayCheckResponse, PlayQuestion, TriviaModo } from '../types';

export type TriviaPlayPhase = 'entry' | 'play' | 'result';

/**
 * Hook que maneja el juego de trivia/evaluación del alumno: carga el contenido
 * del libro, controla la navegación entre preguntas, guarda las respuestas y
 * las envía para su corrección.
 */
export const useTriviaPlay = (bookId: number) => {
  const { token, user } = useAuth();

  const [triviaQuestions, setTriviaQuestions] = useState<PlayQuestion[]>([]);
  const [activeEvaluation, setActiveEvaluation] = useState<Evaluacion | null>(null);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [phase, setPhase] = useState<TriviaPlayPhase>('entry');
  const [playMode, setPlayMode] = useState<TriviaModo>('trivia');
  const [playQuestions, setPlayQuestions] = useState<PlayQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, PlayAnswer>>({});
  const [checking, setChecking] = useState<boolean>(false);
  const [result, setResult] = useState<PlayCheckResponse | null>(null);

  // Carga la trivia libre y la evaluación vigente del libro
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/trivia/jugar/libro/${bookId}`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/v1/trivia/evaluacion/libro/${bookId}`).then((res) => res.json()),
    ])
      .then(([questions, evaluations]: [PlayQuestion[], Evaluacion[]]) => {
        if (!mounted) return;
        setTriviaQuestions(questions);
        const active = evaluations.find((evaluation) => {
          if (!evaluation.deadline) return true;
          return moment(`${evaluation.deadline}T23:59:59`).isSameOrAfter(moment());
        });
        setActiveEvaluation(active ?? null);
      })
      .catch((err) => {
        console.error('Error cargando trivia del libro:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [bookId]);

  // Consulta si el alumno ya respondió la evaluación activa
  useEffect(() => {
    if (!activeEvaluation || !token) {
      setAnswered(null);
      return;
    }
    let mounted = true;
    fetch(`${API_BASE_URL}/api/v1/trivia/jugar/evaluacion/${activeEvaluation.evaluationId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { answered: false }))
      .then((data: { answered: boolean }) => {
        if (mounted) setAnswered(data.answered);
      })
      .catch(() => {
        if (mounted) setAnswered(null);
      });
    return () => {
      mounted = false;
    };
  }, [activeEvaluation, token]);

  const hasContent = triviaQuestions.length > 0 || !!activeEvaluation;
  const isStudent = Number(user?.rol) === 1 || user?.rol_id === 1;
  const current = playQuestions[currentIndex];

  const startPlay = async (mode: TriviaModo) => {
    let questions: PlayQuestion[] = [];
    if (mode === 'evaluacion' && activeEvaluation) {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/trivia/jugar/evaluacion/${activeEvaluation.evaluationId}`,
      );
      questions = await res.json();
    } else {
      questions = triviaQuestions;
    }

    setPlayQuestions(questions);
    setPlayMode(mode);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setChecking(false);
    setPhase('play');
  };

  const setAnswerFor = useCallback((questionId: number, answer: PlayAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const goToNext = () => setCurrentIndex((prev) => Math.min(prev + 1, playQuestions.length - 1));
  const goToPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const backToEntry = () => setPhase('entry');

  const submit = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/jugar/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          answers: playQuestions.map((question) => ({
            questionId: question.id,
            answer: answers[question.id] ?? {},
          })),
          evaluationId: playMode === 'evaluacion' ? activeEvaluation?.evaluationId : undefined,
        }),
      });

      if (res.status === 409) {
        setPhase('entry');
        setAnswered(true);
        alert('Ya respondiste esta evaluación. No se pueden volver a enviar respuestas.');
        return;
      }
      if (!res.ok) {
        throw new Error('No se pudo corregir la trivia.');
      }

      const data: PlayCheckResponse = await res.json();
      setResult(data);
      setPhase('result');
      if (playMode === 'evaluacion') setAnswered(true);
    } catch (err) {
      console.error('Error corrigiendo respuestas:', err);
      alert('No se pudo corregir la trivia.');
    } finally {
      setChecking(false);
    }
  };

  return {
    triviaQuestions,
    activeEvaluation,
    answered,
    loading,
    hasContent,
    isStudent,
    phase,
    playMode,
    playQuestions,
    currentIndex,
    current,
    answers,
    checking,
    result,
    startPlay,
    setAnswerFor,
    goToNext,
    goToPrev,
    backToEntry,
    submit,
  };
};
