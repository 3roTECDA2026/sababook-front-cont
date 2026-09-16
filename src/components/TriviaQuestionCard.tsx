// src/components/TriviaQuestionCard.tsx
import { Box, Typography, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import moment from 'moment';
import 'moment/locale/es';
import type { TriviaQuestion, TriviaFormato } from '../types';
import styles from '../styles/trivia.module.css';

moment.locale('es');

const FORMAT_LABELS: Record<TriviaFormato, string> = {
  multiple: 'Opción múltiple',
  truefalse: 'Verdadero/Falso',
  conexion: 'Conexión de nodos',
  completar: 'Completar el texto',
};

interface TriviaQuestionCardProps {
  question: TriviaQuestion;
  index: number;
  onDelete?: (id: number) => void;
}

const TriviaQuestionCard = ({ question, index, onDelete }: TriviaQuestionCardProps) => {
  const renderCloze = () => {
    const parts = (question.text ?? '').split('{blank}');
    const answers = question.answers ?? [];
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < answers.length && (
              <strong className={styles.qAnswer}>
                {' '}[{i + 1}] {answers[i]}
              </strong>
            )}
          </span>
        ))}
      </>
    );
  };

  return (
    <Box className={question.mode === 'evaluacion' ? styles.qCardEval : styles.qCard}>
      <Box className={styles.qCardHeader}>
        <Typography variant="body2" className={styles.qCardText}>
          {index + 1}. {question.format === 'completar' ? 'Completá el texto' : question.question}
        </Typography>
        {onDelete && (
          <IconButton size="small" onClick={() => onDelete(question.id)} aria-label="Eliminar pregunta">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={1} mt={1}>
        <Chip label={FORMAT_LABELS[question.format]} size="small" variant="outlined" />
        {question.mode === 'evaluacion' && (
          <Chip
            icon={<EventNoteIcon />}
            label={
              question.deadline
                ? `Evaluación · límite ${moment(question.deadline).format('DD/MM/YYYY')}`
                : 'Evaluación'
            }
            size="small"
            className={styles.qEvalChip}
          />
        )}
      </Box>

      {question.format === 'conexion' && (
        <Box className={styles.qOptions}>
          {(question.pairs ?? []).map((pair, optionIndex) => (
            <Typography key={optionIndex} variant="body2" className={styles.qOption}>
              {String.fromCharCode(65 + optionIndex)}. {pair.left} → {pair.right}
            </Typography>
          ))}
        </Box>
      )}

      {question.format === 'completar' && (
        <Box className={styles.qOptions}>
          <Typography variant="body2" className={styles.qOption}>
            {renderCloze()}
          </Typography>
        </Box>
      )}

      {(question.format === 'multiple' || question.format === 'truefalse') && (
        <Box className={styles.qOptions}>
          {(question.options ?? []).map((option, optionIndex) => (
            <Typography
              key={optionIndex}
              variant="body2"
              className={optionIndex === question.correctAnswer ? styles.qOptionCorrect : styles.qOption}
            >
              {String.fromCharCode(65 + optionIndex)}. {option}
              {optionIndex === question.correctAnswer ? ' (correcta)' : ''}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TriviaQuestionCard;