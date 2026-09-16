// src/components/BookTriviaSection.tsx
import { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EventNoteIcon from '@mui/icons-material/EventNote';
import moment from 'moment';
import 'moment/locale/es';
import { API_BASE_URL } from '../environments/api';
import type { Book, TriviaQuestion, TriviaModo } from '../types';
import TriviaQuestionCard from './TriviaQuestionCard';
import TriviaQuestionForm from './TriviaQuestionForm';
import styles from '../styles/trivia.module.css';

moment.locale('es');

interface BookTriviaSectionProps {
  book: Book;
  modo?: TriviaModo;
  fechaLimite?: string | null;
  evaluacionId?: number | null;
}

const BookTriviaSection = ({
  book,
  modo = 'trivia',
  fechaLimite = null,
  evaluacionId = null,
}: BookTriviaSectionProps) => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isEvaluation = modo === 'evaluacion';
  const evaluationEnded =
    isEvaluation && fechaLimite
      ? moment(`${fechaLimite}T23:59:59`).isBefore(moment())
      : false;

  const loadQuestions = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/trivia/libro/${book.libro_id}`)
      .then((res) => res.json())
      .then((data: TriviaQuestion[]) => {
        setQuestions(
          data.filter(
            (question) =>
              question.modo === modo &&
              (modo !== 'evaluacion' || question.evaluacion_id === evaluacionId),
          ),
        );
      })
      .catch((err) => {
        console.error('Error cargando trivia:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.libro_id, modo, evaluacionId]);

  const handleAdd = (input: Omit<TriviaQuestion, 'id'>) => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/v1/trivia`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ libro_id: book.libro_id, evaluacion_id: evaluacionId, ...input }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || 'Error al guardar la pregunta.');
        }
        return res.json();
      })
      .then((created: TriviaQuestion) => {
        setQuestions((prev) => [...prev, created]);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleDelete = (id: number) => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/v1/trivia/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al eliminar la pregunta.');
        }
        setQuestions((prev) => prev.filter((question) => question.id !== id));
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div>
      {isEvaluation && (
        <div className={styles.evalBanner}>
          <EventNoteIcon className={styles.evalBannerIcon} />
          <Typography variant="body2">
            <b>Modo evaluación</b> — límite:{' '}
            {fechaLimite ? moment(fechaLimite).format('DD/MM/YYYY') : 'sin fecha'}.
            {evaluationEnded && ' La fecha límite ya pasó: la evaluación finalizó.'}
          </Typography>
        </div>
      )}

      <Typography variant="subtitle1" className={styles.sectionHeader}>
        {isEvaluation ? 'Evaluación del libro' : 'Trivia del libro'}: {book.titulo}
      </Typography>

      <Button
        variant="contained"
        className={`${styles.buttonOrange} ${styles.buttonTop} ${evaluationEnded ? styles.buttonDisabled : ''}`}
        onClick={() => setModalOpen(true)}
        disabled={evaluationEnded}
        startIcon={isEvaluation ? <EventNoteIcon /> : <QuizIcon />}
      >
        {isEvaluation ? 'Generar preguntas de evaluación' : 'Generar preguntas'}
      </Button>

      {evaluationEnded && (
        <Typography variant="caption" className={styles.endedText}>
          No se pueden agregar preguntas porque la evaluación ya finalizó.
        </Typography>
      )}

      {loading ? (
        <Typography variant="body2" className={styles.emptyText} mb={2}>
          Cargando preguntas...
        </Typography>
      ) : questions.length === 0 ? (
        <Typography variant="body2" className={styles.emptyText} mb={2}>
          Todavía no hay preguntas {isEvaluation ? 'de evaluación' : 'de trivia'} para este libro.
        </Typography>
      ) : (
        <div className={styles.qList}>
          {questions.map((question, index) => (
            <TriviaQuestionCard
              key={question.id}
              question={question}
              index={index}
              onDelete={evaluationEnded ? undefined : handleDelete}
            />
          ))}
        </div>
      )}

      <TriviaQuestionForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        modo={modo}
        fechaLimite={fechaLimite}
      />
    </div>
  );
};

export default BookTriviaSection;