// src/components/TriviaPlaySection.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Modal,
  Tooltip,
  Chip,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import 'moment/locale/es';
import { API_BASE_URL } from '../environments/api';
import { useAuth } from '../hooks/useAuth';
import type { Evaluacion, PlayAnswer, PlayCheckResponse, PlayQuestion, TriviaModo } from '../types';
import styles from '../styles/trivia.module.css';

moment.locale('es');

const BLANK_MARKER = '{blank}';

interface TriviaPlaySectionProps {
  bookId: number;
}

interface OptionControlProps {
  options: string[];
  selected: number;
  onSelect: (index: number) => void;
}

const OptionControl = ({ options, selected, onSelect }: OptionControlProps) => (
  <ToggleButtonGroup
    value={selected}
    exclusive
    fullWidth
    sx={{ flexWrap: 'wrap', gap: 1 }}
  >
    {options.map((option, index) => (
      <ToggleButton
        key={index}
        value={index}
        onClick={() => onSelect(index)}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          flex: '1 1 45%',
          py: 1,
          borderColor: 'rgba(0,0,0,0.23)',
          '&.Mui-selected': {
            backgroundColor: '#FF6633',
            color: '#fff',
            fontWeight: 700,
            borderColor: '#FF6633',
            '&:hover': { backgroundColor: '#cc5200' },
          },
        }}
      >
        {String.fromCharCode(65 + index)}. {option}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

interface ConnectionControlProps {
  lefts: string[];
  rights: string[];
  values: string[];
  onChange: (values: string[]) => void;
}

const ConnectionControl = ({ lefts, rights, values, onChange }: ConnectionControlProps) => (
  <Box>
    {lefts.map((left, index) => (
      <Box key={index} className={styles.connectionRow}>
        <Typography variant="body1" fontWeight={700} flexGrow={1}>
          {left}
        </Typography>
        <Select
          size="small"
          value={values[index] ?? ''}
          onChange={(event) => {
            const next = [...values];
            next[index] = event.target.value as string;
            onChange(next);
          }}
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="" disabled>
            Elegí...
          </MenuItem>
          {rights.map((right, rightIndex) => (
            <MenuItem key={rightIndex} value={right}>
              {right}
            </MenuItem>
          ))}
        </Select>
      </Box>
    ))}
  </Box>
);

interface ClozeControlProps {
  text: string;
  values: string[];
  wordBank?: string[];
  onChange: (values: string[]) => void;
}

const ClozeControl = ({ text, values, wordBank, onChange }: ClozeControlProps) => {
  const parts = text.split(BLANK_MARKER);

  const fillWord = (word: string) => {
    const next = [...values];
    const emptyIndex = next.findIndex((value) => !value);
    if (emptyIndex === -1) return;
    next[emptyIndex] = word;
    onChange(next);
  };

  return (
    <Box>
      {wordBank && wordBank.length > 0 && (
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Palabras disponibles:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {wordBank.map((word, index) => (
              <Chip
                key={index}
                label={word}
                size="small"
                onClick={() => fillWord(word)}
                sx={{
                  backgroundColor: 'rgba(255, 102, 51, 0.12)',
                  color: '#cc4800',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(255, 102, 51, 0.24)' },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      <Typography variant="body1">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <TextField
                size="small"
                value={values[index] ?? ''}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                sx={{ mx: 1, width: 160 }}
              />
            )}
          </span>
        ))}
      </Typography>
    </Box>
  );
};

const TriviaPlaySection = ({ bookId }: TriviaPlaySectionProps) => {
  const { token, user, loading: authLoading } = useAuth();
  const [triviaQuestions, setTriviaQuestions] = useState<PlayQuestion[]>([]);
  const [activeEvaluation, setActiveEvaluation] = useState<Evaluacion | null>(null);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'entry' | 'play' | 'result'>('entry');
  const [playMode, setPlayMode] = useState<TriviaModo>('trivia');
  const [playQuestions, setPlayQuestions] = useState<PlayQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, PlayAnswer>>({});
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PlayCheckResponse | null>(null);

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

  const startPlay = async (mode: 'trivia' | 'evaluacion') => {
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

  const setAnswerFor = (questionId: number, answer: PlayAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const current: PlayQuestion | undefined = playQuestions[currentIndex];

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

  const isStudent = Number(user?.rol) === 1 || user?.rol_id === 1;
  if (authLoading || !isStudent || loading || !hasContent) return null;

  const formatLabels: Record<string, string> = {
    multiple: 'Opción múltiple',
    truefalse: 'Verdadero/Falso',
    conexion: 'Conexión de nodos',
    completar: 'Completar el texto',
  };

  if (phase === 'entry') {
    return (
      <>
        {triviaQuestions.length > 0 && (
          <Button
            variant="contained"
            className={styles.buttonOrange}
            size="small"
            startIcon={<QuizIcon />}
            sx={{ px: 1.5, py: 0.4 }}
            onClick={() => startPlay('trivia')}
          >
            Jugar trivia ({triviaQuestions.length})
          </Button>
        )}
        {activeEvaluation && token && answered !== true && (
          <Tooltip
            title={
              activeEvaluation.deadline
                ? `Fecha límite: ${moment(activeEvaluation.deadline).format('DD/MM/YYYY')}`
                : 'Evaluación del libro'
            }
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<EventNoteIcon />}
              sx={{
                px: 1.5,
                py: 0.4,
                backgroundColor: '#d32f2f !important',
                boxShadow: '0 4px 10px rgba(211, 47, 47, 0.4) !important',
                '&:hover': { backgroundColor: '#b71c1c !important' },
              }}
              onClick={() => startPlay('evaluacion')}
            >
              Jugar evaluación
            </Button>
          </Tooltip>
        )}
        {activeEvaluation && answered === true && (
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="right"
            sx={{ mt: 1, px: 0.5 }}
          >
            Evaluación ya respondida
          </Typography>
        )}
      </>
    );
  }

  return (
    <Modal open onClose={() => setPhase('entry')} aria-labelledby="trivia-play-modal">
      <Box className={styles.formModal}>
        {phase === 'play' && current && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                {playMode === 'evaluacion' ? 'Evaluación' : 'Trivia'} · {formatLabels[current.format]}
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {currentIndex + 1} / {playQuestions.length}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / playQuestions.length) * 100}
              color="secondary"
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" fontWeight={700} mb={2}>
              {current.question ||
                (current.format === 'conexion' && 'Conectá cada elemento con su par')}
            </Typography>

            {(current.format === 'multiple' || current.format === 'truefalse') && (
              <OptionControl
                options={current.options ?? []}
                selected={answers[current.id]?.optionIndex ?? -1}
                onSelect={(index) => setAnswerFor(current.id, { optionIndex: index })}
              />
            )}

            {current.format === 'conexion' && (
              <ConnectionControl
                lefts={current.lefts ?? []}
                rights={current.rights ?? []}
                values={(answers[current.id]?.pairs ?? []).map((pair) => pair.right)}
                onChange={(values) =>
                  setAnswerFor(current.id, {
                    pairs: (current.lefts ?? []).map((left, index) => ({
                      left,
                      right: values[index] ?? '',
                    })),
                  })
                }
              />
            )}

            {current.format === 'completar' && (
              <ClozeControl
                text={current.text ?? ''}
                values={answers[current.id]?.texts ?? []}
                wordBank={current.wordBank}
                onChange={(values) => setAnswerFor(current.id, { texts: values })}
              />
            )}

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="text"
                color="inherit"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Anterior
              </Button>
              {currentIndex < playQuestions.length - 1 ? (
                <Button
                  variant="contained"
                  className={styles.buttonOrange}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="contained"
                  className={styles.buttonOrange}
                  disabled={checking}
                  onClick={submit}
                >
                  {checking ? 'Corrigiendo...' : 'Finalizar'}
                </Button>
              )}
            </Box>
          </>
        )}

        {phase === 'result' && result && (
          <>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {result.percentage >= 60 ? '¡Buen trabajo!' : 'Seguí practicando'}
            </Typography>
<Typography variant="body1" mb={2}>
            Acertaste <b>{result.correctCount}</b> de <b>{result.total}</b> respuestas ({result.percentage}%)
          </Typography>

          {playMode === 'trivia' && (
            <Box mt={2}>
              {playQuestions.map((question, index) => {
                const item = result.results.find((r) => r.questionId === question.id);
                const correct = item?.correct ?? false;
                return (
                  <Box key={question.id} className={styles.qCard} mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {correct ? (
                        <CheckIcon color="success" fontSize="small" />
                      ) : (
                        <CloseIcon color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" fontWeight={700}>
                        {index + 1}. {question.question}
                      </Typography>
                    </Box>

                    {(question.format === 'multiple' || question.format === 'truefalse') && (
                      <Box mt={1}>
                        {question.options?.map((option, optionIndex) => {
                          const isCorrect = item?.solution?.optionIndex === optionIndex;
                          return (
                            <Typography
                              key={optionIndex}
                              variant="body2"
                              className={isCorrect ? styles.qOptionCorrect : styles.qOption}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option}
                              {isCorrect ? ' (correcta)' : ''}
                            </Typography>
                          );
                        })}
                      </Box>
                    )}

                    {question.format === 'conexion' && (
                      <Box mt={1}>
                        {(item?.solution?.pairs ?? []).map((pair, pairIndex) => (
                          <Typography key={pairIndex} variant="body2" className={styles.qOptionCorrect}>
                            {pair.left} → {pair.right}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {question.format === 'completar' && (
                      <Typography variant="body2" className={styles.qOptionCorrect} mt={1}>
                        Respuestas: {(item?.solution?.texts ?? []).join(' · ')}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" className={styles.buttonOrange} onClick={() => setPhase('entry')}>
                Volver
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default TriviaPlaySection;