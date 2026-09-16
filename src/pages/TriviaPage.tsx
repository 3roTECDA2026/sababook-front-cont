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
  modo: TriviaModo;
  fechaLimite: string | null;
  evaluacionId: number | null;
}

const TriviaPage = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [selection, setSelection] = useState<TriviaSelection | null>(null);
  const { books, loading } = useBookData();

  const [evalDialogOpen, setEvalDialogOpen] = useState(false);
  const [evalBusy, setEvalBusy] = useState(false);
  const [evalBook, setEvalBook] = useState<Book | null>(null);
  const [evalDate, setEvalDate] = useState('');

  const handleMenuClose = () => setMenuOpen(false);

  const openOrResumeEval = async (book: Book) => {
    setEvalBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/trivia/evaluacion/libro/${book.libro_id}`);
      const evaluaciones: Evaluacion[] = await res.json();

      if (evaluaciones.length > 0) {
        const evaluacion = evaluaciones[0];
        setSelection({
          book,
          modo: 'evaluacion',
          fechaLimite: evaluacion.fecha_limite,
          evaluacionId: evaluacion.evaluacion_id,
        });
        return;
      }

      setEvalBook(book);
      setEvalDate('');
      setEvalDialogOpen(true);
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
      alert('No se pudieron cargar las evaluaciones del libro.');
    } finally {
      setEvalBusy(false);
    }
  };

  const enterEvalMode = async () => {
    if (!evalBook) return;
    if (!evalDate) {
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
        body: JSON.stringify({ libro_id: evalBook.libro_id, fecha_limite: evalDate }),
      });
      if (!res.ok) {
        throw new Error('No se pudo crear la evaluación.');
      }
      const evaluacion: Evaluacion = await res.json();

      setSelection({
        book: evalBook,
        modo: 'evaluacion',
        fechaLimite: evaluacion.fecha_limite,
        evaluacionId: evaluacion.evaluacion_id,
      });
      setEvalDialogOpen(false);
      setEvalBook(null);
      setEvalDate('');
    } catch (err) {
      console.error('Error creando evaluación:', err);
      alert(err instanceof Error ? err.message : 'No se pudo crear la evaluación.');
    }
  };

  const selectBook = (book: Book) => {
    setSelection({ book, modo: 'trivia', fechaLimite: null, evaluacionId: null });
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
                    disabled={evalBusy}
                    onClick={() => openOrResumeEval(book)}
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
              {selection.modo === 'evaluacion' &&
                selection.fechaLimite &&
                ` · límite: ${selection.fechaLimite}`}
            </Typography>
            <Typography component="span" className={styles.changeLink} onClick={() => setSelection(null)}>
              Cambiar libro
            </Typography>
          </div>
          <BookTriviaSection
            key={`${selection.book.libro_id}-${selection.modo}-${selection.evaluacionId ?? 'n'}`}
            book={selection.book}
            modo={selection.modo}
            fechaLimite={selection.fechaLimite}
            evaluacionId={selection.evaluacionId}
          />
        </>
      )}

      <Dialog open={evalDialogOpen} onClose={() => setEvalDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nueva evaluación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Generá preguntas de evaluación para <b>{evalBook?.titulo}</b>. Elegí la fecha límite:
            al pasar esa fecha la evaluación termina.
          </Typography>
          <TextField
            type="date"
            label="Fecha límite"
            value={evalDate}
            onChange={(event) => setEvalDate(event.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvalDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" className={styles.buttonOrange} onClick={enterEvalMode}>
            Crear evaluación
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TriviaPage;