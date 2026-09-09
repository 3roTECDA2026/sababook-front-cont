// src/components/BookTriviaSection.tsx
import { useState, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import type { TriviaQuestion } from '../types';
import TriviaQuestionCard from './TriviaQuestionCard';
import TriviaQuestionForm from './TriviaQuestionForm';

const ORANGE_COLOR = '#FF6633';

const BookTriviaSection = () => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const nextIdRef = useRef(1);

  const handleAdd = (input: Omit<TriviaQuestion, 'id'>) => {
    setQuestions((prev) => [...prev, { ...input, id: nextIdRef.current++ }]);
  };

  const handleDelete = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <Box mt={4}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Trivia del libro
      </Typography>

      {questions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Todavía no hay preguntas de trivia para este libro.
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
          {questions.map((question, index) => (
            <TriviaQuestionCard
              key={question.id}
              question={question}
              index={index}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}

      <Button
        variant="contained"
        onClick={() => setModalOpen(true)}
        endIcon={<QuizIcon />}
        sx={{
          bgcolor: ORANGE_COLOR + ' !important',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '8px !important',
          boxShadow: `0 4px 10px rgba(255, 102, 51, 0.4)`,
          '&:hover': { bgcolor: '#cc4800 !important' },
          textTransform: 'none',
        }}
      >
        Generar preguntas
      </Button>

      <TriviaQuestionForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </Box>
  );
};

export default BookTriviaSection;