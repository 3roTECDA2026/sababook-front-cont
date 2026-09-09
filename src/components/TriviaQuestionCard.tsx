// src/components/TriviaQuestionCard.tsx
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TriviaQuestion } from '../types';

interface TriviaQuestionCardProps {
  question: TriviaQuestion;
  index: number;
  onDelete?: (id: number) => void;
}

const TriviaQuestionCard = ({ question, index, onDelete }: TriviaQuestionCardProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '12px',
        bgcolor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Typography variant="body2" fontWeight="bold">
          {index + 1}. {question.pregunta}
        </Typography>
        {onDelete && (
          <IconButton size="small" onClick={() => onDelete(question.id)} aria-label="Eliminar pregunta">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box mt={1}>
        {question.opciones.map((opcion, optionIndex) => (
          <Typography
            key={optionIndex}
            variant="body2"
            color={optionIndex === question.correcta ? 'success.main' : 'text.secondary'}
          >
            {String.fromCharCode(65 + optionIndex)}. {opcion}
            {optionIndex === question.correcta ? ' (correcta)' : ''}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default TriviaQuestionCard;