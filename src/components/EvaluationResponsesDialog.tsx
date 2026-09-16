// src/components/EvaluationResponsesDialog.tsx
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import moment from 'moment';
import 'moment/locale/es';
import { API_BASE_URL } from '../environments/api';
import type { TriviaAttempt, PlayAnswer, PlayQuestion } from '../types';
import styles from '../styles/trivia.module.css';

moment.locale('es');

interface EvaluationResponsesDialogProps {
  open: boolean;
  onClose: () => void;
  evaluationId: number | null;
}

const formatLabels: Record<string, string> = {
  multiple: 'Opción múltiple',
  truefalse: 'Verdadero/Falso',
  conexion: 'Conexión de nodos',
  completar: 'Completar el texto',
};

const renderStudentAnswer = (question: PlayQuestion, answer?: PlayAnswer): string => {
  if (question.format === 'multiple' || question.format === 'truefalse') {
    const index = answer?.optionIndex ?? -1;
    return index >= 0 ? (question.options?.[index] ?? `Opción ${index + 1}`) : 'Sin responder';
  }
  if (question.format === 'conexion') {
    const pairs = answer?.pairs ?? [];
    if (pairs.length === 0) return 'Sin responder';
    return pairs.map((pair) => `${pair.left}: ${pair.right || '—'}`).join(', ');
  }
  if (question.format === 'completar') {
    const texts = answer?.texts ?? [];
    return texts.length === 0 ? 'Sin responder' : texts.join(', ');
  }
  return 'Sin responder';
};

const renderCorrectAnswer = (question: PlayQuestion, solution: PlayAnswer | null): string => {
  if (question.format === 'multiple' || question.format === 'truefalse') {
    const index = solution?.optionIndex ?? -1;
    return index >= 0 ? (question.options?.[index] ?? `Opción ${index + 1}`) : '—';
  }
  if (question.format === 'conexion') {
    const pairs = solution?.pairs ?? [];
    if (pairs.length === 0) return '—';
    return pairs.map((pair) => `${pair.left}: ${pair.right}`).join(', ');
  }
  if (question.format === 'completar') {
    const texts = solution?.texts ?? [];
    return texts.length === 0 ? '—' : texts.join(', ');
  }
  return '—';
};

const EvaluationResponsesDialog = ({ open, onClose, evaluationId }: EvaluationResponsesDialogProps) => {
  const [attempts, setAttempts] = useState<TriviaAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<TriviaAttempt | null>(null);

  useEffect(() => {
    if (!open || !evaluationId) return;
    let mounted = true;
    setLoading(true);
    setSelected(null);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/v1/trivia/evaluacion/${evaluationId}/attempts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TriviaAttempt[]) => {
        if (mounted) setAttempts(data);
      })
      .catch((err) => {
        console.error('Error cargando respuestas:', err);
        if (mounted) setAttempts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [open, evaluationId]);

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {selected ? `Respuestas de ${selected.studentName}` : 'Respuestas de la evaluación'}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Typography variant="body2" className={styles.emptyText}>
            Cargando respuestas...
          </Typography>
        ) : selected ? (
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              size="small"
              onClick={() => setSelected(null)}
              sx={{ mb: 2, textTransform: 'none' }}
            >
              Volver al listado
            </Button>

            <Box mb={2}>
              <Chip
                icon={selected.percentage >= 60 ? <CheckIcon /> : <CloseIcon />}
                label={`${selected.correctCount}/${selected.total} · ${selected.percentage}%`}
                color={selected.percentage >= 60 ? 'success' : 'error'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography component="span" variant="caption" color="text.secondary">
                {moment(selected.submittedAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>

            {selected.payload.questions.map((question, index) => {
              const entry = selected.payload.answers.find((answer) => answer.questionId === question.id);
              const review = selected.payload.result.results.find((result) => result.questionId === question.id);
              const correct = review?.correct ?? false;
              return (
                <Box key={question.id} className={styles.qCard} mb={2}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    {correct ? (
                      <CheckIcon color="success" fontSize="small" />
                    ) : (
                      <CloseIcon color="error" fontSize="small" />
                    )}
                    <Typography variant="body2" fontWeight={700}>
                      {index + 1}. {question.question || formatLabels[question.format]}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatLabels[question.format]}
                  </Typography>
                  <Typography variant="body2" className={styles.qOption}>
                    Respondió: {renderStudentAnswer(question, entry?.answer)}
                  </Typography>
                  <Typography variant="body2" className={styles.qOptionCorrect}>
                    Correcta: {renderCorrectAnswer(question, review?.solution ?? null)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : !evaluationId ? (
          <Typography variant="body2" className={styles.emptyText}>
            Este libro todavía no tiene una evaluación creada.
          </Typography>
        ) : attempts.length === 0 ? (
          <Typography variant="body2" className={styles.emptyText}>
            Todavía no hay alumnos que hayan respondido esta evaluación.
          </Typography>
        ) : (
          <List disablePadding>
            {attempts.map((attempt) => (
              <ListItemButton key={attempt.attemptId} onClick={() => setSelected(attempt)} divider>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <Box flexGrow={1}>
                  <Typography variant="body2" fontWeight={700}>
                    {attempt.studentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {moment(attempt.submittedAt).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </Box>
                <Chip
                  label={`${attempt.correctCount}/${attempt.total} · ${attempt.percentage}%`}
                  color={attempt.percentage >= 60 ? 'success' : 'error'}
                  size="small"
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvaluationResponsesDialog;