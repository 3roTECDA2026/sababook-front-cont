// src/components/ui/BookTriviaSection.tsx
import { useState } from 'react';
import { Typography, Button } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useBookTrivia } from '@/hooks/useBookTrivia';
import { useAuth } from '@/hooks/useAuth';
import type { Book, TriviaModo, TriviaQuestion } from '@/types';
import TriviaQuestionCard from '@/components/ui/TriviaQuestionCard';
import TriviaQuestionForm from '@/components/forms/TriviaQuestionForm';
import { formatDate, isDeadlineExpired } from '@/utils/formatDate';
import styles from '@/styles/trivia.module.css';

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
  const [editingQuestion, setEditingQuestion] = useState<TriviaQuestion | null>(null);
  const { user, isAdmin } = useAuth();
  const { questions, loading, error, addQuestion, updateQuestion, deleteQuestion } = useBookTrivia(
    book.libro_id,
    mode,
    evaluationId,
  );

  const isEvaluation = mode === 'evaluacion';
  const evaluationEnded = isEvaluation && isDeadlineExpired(deadline);

  const canEdit = (question: TriviaQuestion) =>
    isAdmin || (user != null && question.docenteId === user.usuario_id);

  const handleEdit = (question: TriviaQuestion) => setEditingQuestion(question);

  const handleCloseForm = () => {
    setModalOpen(false);
    setEditingQuestion(null);
  };

  return (
    <div>
      {isEvaluation && (
        <div className={styles.evalBanner}>
          <EventNoteIcon className={styles.evalBannerIcon} />
          <Typography variant="body2">
            <b>Modo evaluación</b> — límite:{' '}
            {formatDate(deadline)}.
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
              onEdit={
                !evaluationEnded && canEdit(question) ? handleEdit : undefined
              }
              onDelete={evaluationEnded ? undefined : deleteQuestion}
            />
          ))}
        </div>
      )}

      <TriviaQuestionForm
        key={editingQuestion ? `edit-${editingQuestion.id}` : 'create'}
        open={modalOpen || editingQuestion !== null}
        onClose={handleCloseForm}
        onAdd={addQuestion}
        onUpdate={updateQuestion}
        initialQuestion={editingQuestion}
        mode={mode}
        deadline={deadline}
      />
    </div>
  );
};

export default BookTriviaSection;