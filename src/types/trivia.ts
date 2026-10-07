// src/types/trivia.ts

export type TriviaModo = 'trivia' | 'evaluacion';

export type TriviaFormato = 'multiple' | 'truefalse' | 'conexion' | 'completar';

export interface TriviaPar {
  left: string;
  right: string;
}

export interface TriviaQuestion {
  id: number;
  mode: TriviaModo;
  format: TriviaFormato;
  question: string;
  deadline?: string | null;
  evaluationId?: number | null;
  options?: string[];
  correctAnswer?: number;
  pairs?: TriviaPar[];
  text?: string;
  answers?: string[];
}

export interface Evaluacion {
  evaluationId: number;
  bookId: number;
  deadline: string | null;
  createdAt: string;
  questionCount: number;
}

export interface EvaluacionDetalle {
  evaluation: Evaluacion;
  questions: TriviaQuestion[];
}

export interface PlayQuestion {
  id: number;
  mode: TriviaModo;
  format: TriviaFormato;
  question: string;
  text?: string;
  options?: string[];
  lefts?: string[];
  rights?: string[];
  wordBank?: string[];
}

export interface PlayAnswer {
  optionIndex?: number;
  pairs?: TriviaPar[];
  texts?: string[];
}

export interface PlayCheckResponse {
  total: number;
  correctCount: number;
  percentage: number;
  results: {
    questionId: number;
    correct: boolean;
    solution: PlayAnswer | null;
  }[];
}

export interface TriviaAttempt {
  attemptId: number;
  evaluationId: number;
  userId: number;
  studentName: string;
  correctCount: number;
  total: number;
  percentage: number;
  submittedAt: string;
  payload: {
    questions: PlayQuestion[];
    answers: { questionId: number; answer: PlayAnswer }[];
    result: PlayCheckResponse;
  };
}