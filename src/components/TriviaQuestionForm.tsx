// src/components/TriviaQuestionForm.tsx
import { useState, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { TriviaQuestion } from '../types';

const ORANGE_COLOR = '#FF6633';
const MULTIPLE_COUNT = 4;
const TRUE_FALSE_OPTIONS = ['Verdadero', 'Falso'];

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 520,
  height: 600,
  overflow: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

type TriviaQuestionInput = Omit<TriviaQuestion, 'id'>;

interface TriviaQuestionFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (question: TriviaQuestionInput) => void;
}

const TriviaQuestionForm = ({ open, onClose, onAdd }: TriviaQuestionFormProps) => {
  const [isTrueFalse, setIsTrueFalse] = useState(false);
  const [enunciado, setEnunciado] = useState('');
  const [opciones, setOpciones] = useState<string[]>(Array.from({ length: MULTIPLE_COUNT }, () => ''));
  const [correcta, setCorrecta] = useState(-1);
  const [addedCount, setAddedCount] = useState(0);

  const resetForm = () => {
    setEnunciado('');
    setOpciones(isTrueFalse ? [...TRUE_FALSE_OPTIONS] : Array.from({ length: MULTIPLE_COUNT }, () => ''));
    setCorrecta(-1);
  };

  const handleSetFormat = (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (!value) return;
    if (value === 'truefalse') {
      setIsTrueFalse(true);
      setOpciones([...TRUE_FALSE_OPTIONS]);
    } else {
      setIsTrueFalse(false);
      setOpciones(Array.from({ length: MULTIPLE_COUNT }, () => ''));
    }
    setCorrecta(-1);
  };

  const handleOpcionChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    setOpciones((prev) => {
      const next = [...prev];
      next[index] = event.target.value;
      return next;
    });
  };

  const handleCorrectaToggle = (index: number) => () => {
    setCorrecta((prev) => (prev === index ? -1 : index));
  };

  const handleSubmit = () => {
    if (!enunciado.trim()) {
      alert('Escribí el enunciado de la pregunta.');
      return;
    }
    if (opciones.some((opcion) => !opcion.trim())) {
      alert('Completá todas las opciones.');
      return;
    }
    if (correcta < 0) {
      alert('Marcá cuál es la respuesta correcta.');
      return;
    }

    onAdd({
      pregunta: enunciado.trim(),
      opciones: opciones.map((opcion) => opcion.trim()),
      correcta,
    });

    resetForm();
    setAddedCount((prev) => prev + 1);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="trivia-modal-title">
      <Box sx={modalStyle}>
        <Typography id="trivia-modal-title" variant="h6" component="h2" mb={2}>
          Nueva pregunta de trivia
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Formato de pregunta
        </Typography>
        <ToggleButtonGroup
          value={isTrueFalse ? 'truefalse' : 'multiple'}
          exclusive
          onChange={handleSetFormat}
          fullWidth
          sx={{ mt: 0.5 }}
          color="primary"
        >
          <ToggleButton value="multiple">Opción múltiple</ToggleButton>
          <ToggleButton value="truefalse">Verdadero / Falso</ToggleButton>
        </ToggleButtonGroup>

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

        <Box sx={{ minHeight: 220 }}>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Marcá la opción correcta
          </Typography>

          {opciones.map((opcion, index) => (
            <Box key={index} display="flex" alignItems="center" mt={1.5}>
              <Checkbox
                checked={correcta === index}
                onChange={handleCorrectaToggle(index)}
                size="small"
                sx={{
                  '&.Mui-checked': { color: ORANGE_COLOR },
                }}
              />
              <TextField
                value={opcion}
                onChange={isTrueFalse ? undefined : handleOpcionChange(index)}
                disabled={isTrueFalse}
                fullWidth
                size="small"
                label={`Opción ${index + 1}`}
              />
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} gap={2}>
          <Button onClick={onClose} variant="text" color="inherit">
            Listo
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleSubmit}
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
  );
};

export default TriviaQuestionForm;