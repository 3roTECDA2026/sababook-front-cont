// src/pages/TriviaPage.tsx
import { useState } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EventNoteIcon from '@mui/icons-material/EventNote';

import AppHeader from '../components/AppHeader';
import SideMenu from '../components/SideMenu';
import BookTriviaSection from '../components/BookTriviaSection';
import { useBookData } from '../hooks/useBookData';
import { API_BASE_URL } from '../environments/api';
import type { Book, Evaluacion, TriviaModo } from '../types';
import styles from '../styles/trivia.module.css';

interface TriviaSelection {
  book: Book;
  mode: TriviaModo;
  deadline: string | null;
  evaluationId: number | null;
}

const TriviaPage = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [selection, setSelection] = useState<TriviaSelection | null>(null);
  const { books, loading } = useBookData();

  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [evaluationBusy, setEvaluationBusy] = useState(false);
  const [evaluationBook, setEvaluationBook] = useState<Book | null>(null);
  const [deadline, setDeadline] = useState('');

  const handleMenuClose = () => setMenuOpen(false);

  const openOrResumeEvaluation = async (book: Book) => {
    setEvaluationBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/evaluacion/libro/${book.libro_id}`);
      const evaluaciones: Evaluacion[] = await res.json();

      if (evaluaciones.length > 0) {
        const evaluacion = evaluaciones[0];
        setSelection({
          book,
          mode: 'evaluacion',
          deadline: evaluacion.deadline,
          evaluationId: evaluacion.evaluationId,
        });
        return;
      }

      setEvaluationBook(book);
      setDeadline('');
      setEvaluationDialogOpen(true);
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
      alert('No se pudieron cargar las evaluaciones del libro.');
    } finally {
      setEvaluationBusy(false);
    }
  };

  const enterEvaluationMode = async () => {
    if (!evaluationBook) return;
    if (!deadline) {
      alert('Elegí una fecha límite para la evaluación.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/evaluacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: evaluationBook.libro_id, deadline }),
      });
      if (!res.ok) {
        throw new Error('No se pudo crear la evaluación.');
      }
      const evaluacion: Evaluacion = await res.json();

      setSelection({
        book: evaluationBook,
        mode: 'evaluacion',
        deadline: evaluacion.deadline,
        evaluationId: evaluacion.evaluationId,
      });
      setEvaluationDialogOpen(false);
      setEvaluationBook(null);
      setDeadline('');
    } catch (err) {
      console.error('Error creando evaluación:', err);
      alert(err instanceof Error ? err.message : 'No se pudo crear la evaluación.');
    }
  };

  const selectBook = (book: Book) => {
    setSelection({ book, mode: 'trivia', deadline: null, evaluationId: null });
  };

  return (
    <div className={styles.page}>
      <AppHeader
        onMenuClick={() => setMenuOpen(true)}
        title="Trivia"
        subtitle="Generá preguntas por libro"
      />
      <SideMenu open={menuOpen} onClose={handleMenuClose} active="Trivia" />

      {!selection && (
        <>
          <Typography variant="h6" className={styles.sectionTitle}>
            Seleccioná un libro para cargar sus preguntas
          </Typography>

          {!loading && books.length === 0 ? (
            <Typography variant="body2" className={styles.emptyText}>
              No hay libros disponibles.
            </Typography>
          ) : (
            <ul className={styles.bookList}>
              {books.map((book) => (
                <li key={book.libro_id} className={styles.bookRow}>
                  <button type="button" className={styles.bookItem} onClick={() => selectBook(book)}>
                    <img className={styles.bookCover} src={book.portada_url} alt="" />
                    <span className={styles.bookInfo}>
                      <span className={styles.bookTitle}>{book.titulo}</span>
                      <span className={styles.bookMeta}>
                        {book.autor} · {book.genero}
                      </span>
                    </span>
                    <QuizIcon className={styles.bookIcon} />
                  </button>
                  <Button
                    variant="outlined"
                    size="small"
                    className={styles.evalButton}
                    startIcon={<EventNoteIcon />}
                    disabled={evaluationBusy}
                    onClick={() => openOrResumeEvaluation(book)}
                  >
                    Evaluación
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    className={styles.responsesButton}
                    disabled
                  >
                    Respuestas
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selection && (
        <>
          <div className={styles.selectedHeader}>
            <Typography variant="subtitle2" className={styles.subtitle}>
              Libro seleccionado: <b>{selection.book.titulo}</b>
              {selection.mode === 'evaluacion' &&
                selection.deadline &&
                ` · límite: ${selection.deadline}`}
            </Typography>
            <Typography component="span" className={styles.changeLink} onClick={() => setSelection(null)}>
              Cambiar libro
            </Typography>
          </div>
          <BookTriviaSection
            key={`${selection.book.libro_id}-${selection.mode}-${selection.evaluationId ?? 'n'}`}
            book={selection.book}
            mode={selection.mode}
            deadline={selection.deadline}
            evaluationId={selection.evaluationId}
          />
        </>
      )}

      <Dialog open={evaluationDialogOpen} onClose={() => setEvaluationDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nueva evaluación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Generá preguntas de evaluación para <b>{evaluationBook?.titulo}</b>. Elegí la fecha límite:
            al pasar esa fecha la evaluación termina.
          </Typography>
          <TextField
            type="date"
            label="Fecha límite"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvaluationDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" className={styles.buttonOrange} onClick={enterEvaluationMode}>
            Crear evaluación
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TriviaPage;