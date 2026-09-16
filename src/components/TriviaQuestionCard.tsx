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
    const parts = (question.texto ?? '').split('{blank}');
    const answers = question.respuestas ?? [];
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
    <Box className={question.modo === 'evaluacion' ? styles.qCardEval : styles.qCard}>
      <Box className={styles.qCardHeader}>
        <Typography variant="body2" className={styles.qCardText}>
          {index + 1}. {question.formato === 'completar' ? 'Completá el texto' : question.pregunta}
        </Typography>
        {onDelete && (
          <IconButton size="small" onClick={() => onDelete(question.id)} aria-label="Eliminar pregunta">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={1} mt={1}>
        <Chip label={FORMAT_LABELS[question.formato]} size="small" variant="outlined" />
        {question.modo === 'evaluacion' && (
          <Chip
            icon={<EventNoteIcon />}
            label={
              question.fechaLimite
                ? `Evaluación · límite ${moment(question.fechaLimite).format('DD/MM/YYYY')}`
                : 'Evaluación'
            }
            size="small"
            className={styles.qEvalChip}
          />
        )}
      </Box>

      {question.formato === 'conexion' && (
        <Box className={styles.qOptions}>
          {(question.pares ?? []).map((par, optionIndex) => (
            <Typography key={optionIndex} variant="body2" className={styles.qOption}>
              {String.fromCharCode(65 + optionIndex)}. {par.izquierda} → {par.derecha}
            </Typography>
          ))}
        </Box>
      )}

      {question.formato === 'completar' && (
        <Box className={styles.qOptions}>
          <Typography variant="body2" className={styles.qOption}>
            {renderCloze()}
          </Typography>
        </Box>
      )}

      {(question.formato === 'multiple' || question.formato === 'truefalse') && (
        <Box className={styles.qOptions}>
          {(question.opciones ?? []).map((opcion, optionIndex) => (
            <Typography
              key={optionIndex}
              variant="body2"
              className={optionIndex === question.correcta ? styles.qOptionCorrect : styles.qOption}
            >
              {String.fromCharCode(65 + optionIndex)}. {opcion}
              {optionIndex === question.correcta ? ' (correcta)' : ''}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TriviaQuestionCard;