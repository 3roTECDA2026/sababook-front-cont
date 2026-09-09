// src/components/BookTriviaSection.tsx
import { useState, useRef, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuizIcon from '@mui/icons-material/Quiz';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TriviaQuestion } from '../types';

const ORANGE_COLOR = '#FF6633';
const OPTION_COUNTS = [2, 3, 4, 5];

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 520,
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const BookTriviaSection = () => {
  const theme = useTheme();
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [optionCount, setOptionCount] = useState(2);

  const [enunciado, setEnunciado] = useState('');
  const [opciones, setOpciones] = useState<string[]>(['', '']);
  const [correcta, setCorrecta] = useState(0);
  const [addedCount, setAddedCount] = useState(0);
  const nextIdRef = useRef(1);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);

  const handleSelectOptionCount = (count: number) => {
    setOptionCount(count);
    setOpciones(Array.from({ length: count }, () => ''));
    setCorrecta(0);
    setMenuAnchor(null);
    setModalOpen(true);
  };

  const handleAddQuestion = () => {
    if (!enunciado.trim()) {
      alert('Escribí el enunciado de la pregunta.');
      return;
    }
    if (opciones.some((opcion) => !opcion.trim())) {
      alert('Completá todas las opciones.');
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        id: nextIdRef.current++,
        pregunta: enunciado.trim(),
        opciones: opciones.map((opcion) => opcion.trim()),
        correcta,
      },
    ]);

    setEnunciado('');
    setOpciones(Array.from({ length: optionCount }, () => ''));
    setCorrecta(0);
    setAddedCount((prev) => prev + 1);
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleOpcionChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    setOpciones((prev) => {
      const next = [...prev];
      next[index] = event.target.value;
      return next;
    });
  };

  const handleCorrectaChange = (event: SelectChangeEvent<number>) => {
    setCorrecta(Number(event.target.value));
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
            <Box
              key={question.id}
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
                <IconButton size="small" onClick={() => handleDeleteQuestion(question.id)} aria-label="Eliminar pregunta">
                  <DeleteIcon fontSize="small" />
                </IconButton>
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
          ))}
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleOpenMenu}
        endIcon={<ExpandMoreIcon />}
        startIcon={<QuizIcon />}
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <Typography variant="caption" px={2} color="text.secondary">
          Elegí cuántas opciones por pregunta
        </Typography>
        {OPTION_COUNTS.map((count) => (
          <MenuItem key={count} onClick={() => handleSelectOptionCount(count)}>
            {count} opciones
          </MenuItem>
        ))}
      </Menu>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="trivia-modal-title">
        <Box sx={modalStyle}>
          <Typography id="trivia-modal-title" variant="h6" component="h2" mb={2}>
            Nueva pregunta de trivia
          </Typography>

          <TextField
            label="Pregunta"
            value={enunciado}
            onChange={(event) => setEnunciado(event.target.value)}
            fullWidth
            size="small"
            multiline
            margin="normal"
            placeholder="Escribí el enunciado de la pregunta..."
          />

          {opciones.map((opcion, index) => (
            <TextField
              key={index}
              label={`Opción ${index + 1}`}
              value={opcion}
              onChange={handleOpcionChange(index)}
              fullWidth
              size="small"
              margin="normal"
            />
          ))}

          <FormControl fullWidth size="small" margin="normal">
            <InputLabel>Respuesta correcta</InputLabel>
            <Select value={correcta} label="Respuesta correcta" onChange={handleCorrectaChange}>
              {opciones.map((_, index) => (
                <MenuItem key={index} value={index}>
                  Opción {index + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} gap={2}>
            <Button onClick={() => setModalOpen(false)} variant="text" color="inherit">
              Listo
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              sx={{
                bgcolor: ORANGE_COLOR + ' !important',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '8px !important',
                '&:hover': { bgcolor: '#cc4800 !important' },
                textTransform: 'none',
              }}
            >
              Agregar pregunta
            </Button>
          </Box>

          {addedCount > 0 && (
            <Typography variant="caption" color="success.main" display="block" mt={2}>
              {addedCount} {addedCount === 1 ? 'pregunta agregada' : 'preguntas agregadas'} a la trivia.
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BookTriviaSection;