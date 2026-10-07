// src/components/ui/BookTriviaSection.tsx
import { useState } from 'react';
import { Typography, Button } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EventNoteIcon from '@mui/icons-material/EventNote';
import moment from 'moment';
import 'moment/locale/es';
import { useBookTrivia } from '@/hooks/useBookTrivia';
import type { Book, TriviaModo } from '@/types';
import TriviaQuestionCard from '@/components/ui/TriviaQuestionCard';
import TriviaQuestionForm from '@/components/forms/TriviaQuestionForm';
import styles from '@/styles/trivia.module.css';

moment.locale('es');

interface BookTriviaSectionProps {
  book: Book;
  mode?: TriviaModo;
  deadline?: string | null;
  evaluationId?: number | null;
}

const BookTriviaSection = ({
  book,
  mode = 'trivia',
  deadline = null,
  evaluationId = null,
}: BookTriviaSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { questions, loading, error, addQuestion, deleteQuestion } = useBookTrivia(
    book.libro_id,
    mode,
    evaluationId,
  );

  const isEvaluation = mode === 'evaluacion';
  const evaluationEnded =
    isEvaluation && deadline
      ? moment(`${deadline}T23:59:59`).isBefore(moment())
      : false;

  return (
    <div>
      {isEvaluation && (
        <div className={styles.evalBanner}>
          <EventNoteIcon className={styles.evalBannerIcon} />
          <Typography variant="body2">
            <b>Modo evaluación</b> — límite:{' '}
            {deadline ? moment(deadline).format('DD/MM/YYYY') : 'sin fecha'}.
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

      {error && (
        <Typography variant="body2" color="error" mb={2}>
          {error}
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
              onDelete={evaluationEnded ? undefined : deleteQuestion}
            />
          ))}
        </div>
      )}

      <TriviaQuestionForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addQuestion}
        mode={mode}
        deadline={deadline}
      />
    </div>
  );
};

export default BookTriviaSection;