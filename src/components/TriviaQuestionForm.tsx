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
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import type { TriviaQuestion, TriviaModo, TriviaFormato, TriviaPar } from '../types';
import styles from '../styles/trivia.module.css';

const MULTIPLE_COUNT = 4;
const TRUE_FALSE_OPTIONS = ['Verdadero', 'Falso'];
const BLANK_MARKER = '{blank}';

type TriviaQuestionInput = Omit<TriviaQuestion, 'id'>;

interface TriviaQuestionFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (question: TriviaQuestionInput) => void;
  mode?: TriviaModo;
  deadline?: string | null;
}

const TriviaQuestionForm = ({
  open,
  onClose,
  onAdd,
  mode = 'trivia',
  deadline = null,
}: TriviaQuestionFormProps) => {
  const isEvaluation = mode === 'evaluacion';

  const [format, setFormat] = useState<TriviaFormato>('multiple');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(Array.from({ length: MULTIPLE_COUNT }, () => ''));
  const [correct, setCorrect] = useState(-1);
  const [pairs, setPairs] = useState<TriviaPar[]>([{ left: '', right: '' }]);
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState<string[]>(['']);
  const [addedCount, setAddedCount] = useState(0);

  const formatOptions: { value: TriviaFormato; label: string }[] = [
    { value: 'multiple', label: 'Opción múltiple' },
    { value: 'truefalse', label: 'Verdadero / Falso' },
  ];
  if (isEvaluation) {
    formatOptions.push({ value: 'conexion', label: 'Conexión de nodos' });
    formatOptions.push({ value: 'completar', label: 'Completar el texto' });
  }

  const isTrueFalse = () => format === 'truefalse';

  const resetForm = () => {
    setQuestion('');
    setOptions(isTrueFalse() ? [...TRUE_FALSE_OPTIONS] : Array.from({ length: MULTIPLE_COUNT }, () => ''));
    setCorrect(-1);
  };

  const handleSetFormat = (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (!value) return;
    setFormat(value as TriviaFormato);
    if (value === 'truefalse') {
      setOptions([...TRUE_FALSE_OPTIONS]);
    } else {
      setOptions(Array.from({ length: MULTIPLE_COUNT }, () => ''));
    }
    setCorrect(-1);
  };

  const handleOptionChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = event.target.value;
      return next;
    });
  };

  const handleCorrectToggle = (index: number) => () => {
    setCorrect((prev) => (prev === index ? -1 : index));
  };

  const handlePairChange = (index: number, field: keyof TriviaPar) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPairs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: event.target.value };
      return next;
    });
  };

  const addPair = () => {
    setPairs((prev) => [...prev, { left: '', right: '' }]);
  };

  const removePair = (index: number) => () => {
    setPairs((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const blanksCount = (value: string) => (value.match(/\{blank\}/g) || []).length;

  const syncAnswers = (value: string) => {
    const count = blanksCount(value);
    setAnswers((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? ''));
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
    syncAnswers(event.target.value);
  };

  const updateAnswer = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    if (format === 'multiple' || format === 'truefalse') {
      if (!question.trim()) {
        alert('Escribí el enunciado de la pregunta.');
        return;
      }
      if (options.some((option) => !option.trim())) {
        alert('Completá todas las opciones.');
        return;
      }
      if (correct < 0) {
        alert('Marcá cuál es la respuesta correcta.');
        return;
      }

      onAdd({
        question: question.trim(),
        mode,
        format,
        deadline: isEvaluation ? deadline : null,
        options: options.map((option) => option.trim()),
        correctAnswer: correct,
      });
    } else if (format === 'conexion') {
      const validPairs = pairs.filter((pair) => pair.left.trim() && pair.right.trim());
      if (validPairs.length < 2) {
        alert('Completá al menos 2 pares para armar la conexión de nodos.');
        return;
      }

      onAdd({
        question: question.trim() || 'Conectá cada elemento de la izquierda con su par',
        mode,
        format,
        deadline: isEvaluation ? deadline : null,
        pairs: validPairs.map((pair) => ({
          left: pair.left.trim(),
          right: pair.right.trim(),
        })),
      });
    } else {
      if (!text.trim()) {
        alert('Escribí el texto con los espacios a completar.');
        return;
      }
      if (blanksCount(text) === 0) {
        alert(`Marcá los espacios vacíos con ${BLANK_MARKER}.`);
        return;
      }
      if (answers.some((answer) => !answer.trim())) {
        alert('Completá todas las respuestas del texto.');
        return;
      }

      onAdd({
        question: '',
        mode,
        format,
        deadline: isEvaluation ? deadline : null,
        text: text.trim(),
        answers: answers.map((answer) => answer.trim()),
      });
    }

    resetForm();
    setPairs([{ left: '', right: '' }]);
    setText('');
    setAnswers(['']);
    setAddedCount((prev) => prev + 1);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="trivia-modal-title">
      <Box className={styles.formModal}>
        <Typography id="trivia-modal-title" variant="h6" component="h2" mb={2}>
          {isEvaluation ? 'Nueva pregunta de evaluación' : 'Nueva pregunta de trivia'}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Formato de pregunta
        </Typography>
        <ToggleButtonGroup
          value={format}
          exclusive
          onChange={handleSetFormat}
          fullWidth
          sx={{ mt: 0.5 }}
          color="primary"
        >
          {formatOptions.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {isEvaluation && (format === 'conexion' || format === 'completar') && (
          <Typography variant="caption" color="success.main" display="block" mt={1}>
            Formato exclusivo del modo evaluación.
          </Typography>
        )}

        {(format === 'multiple' || format === 'truefalse') && (
          <>
            <TextField
              label="Pregunta"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
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

              {options.map((option, index) => (
                <Box key={index} display="flex" alignItems="center" mt={1.5}>
                  <Checkbox
                    checked={correct === index}
                    onChange={handleCorrectToggle(index)}
                    size="small"
                    className={styles.checkboxOrange}
                  />
                  <TextField
                    value={option}
                    onChange={isTrueFalse() ? undefined : handleOptionChange(index)}
                    disabled={isTrueFalse()}
                    fullWidth
                    size="small"
                    label={`Opción ${index + 1}`}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}

        {format === 'conexion' && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Armá los pares de nodos que deben conectarse
            </Typography>

            {pairs.map((pair, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1} mt={1.5}>
                <TextField
                  label={`Elemento ${index + 1}`}
                  value={pair.left}
                  onChange={handlePairChange(index, 'left')}
                  size="small"
                  fullWidth
                  placeholder="Ej: Autor"
                />
                <Typography variant="body2">↔</Typography>
                <TextField
                  label={`Se conecta con ${index + 1}`}
                  value={pair.right}
                  onChange={handlePairChange(index, 'right')}
                  size="small"
                  fullWidth
                  placeholder="Ej: Obra"
                />
                <IconButton
                  size="small"
                  onClick={removePair(index)}
                  disabled={pairs.length <= 1}
                  aria-label="Quitar par"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            <Button size="small" startIcon={<AddIcon />} onClick={addPair} sx={{ mt: 1 }}>
              Agregar par
            </Button>
          </Box>
        )}

        {format === 'completar' && (
          <Box mt={2}>
            <TextField
              label="Texto con espacios"
              value={text}
              onChange={handleTextChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              margin="normal"
              placeholder={`Ej: La novela fue escrita por ${BLANK_MARKER} en el año ${BLANK_MARKER}.`}
              helperText={`Usá ${BLANK_MARKER} para cada espacio que el alumno deba completar.`}
            />

            {Array.from({ length: blanksCount(text) }).map((_, index) => (
              <TextField
                key={index}
                label={`Respuesta ${index + 1}`}
                value={answers[index] ?? ''}
                onChange={(event) => updateAnswer(index, event.target.value)}
                fullWidth
                size="small"
                margin="normal"
              />
            ))}
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} gap={2}>
          <Button onClick={onClose} variant="text" color="inherit">
            Listo
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleSubmit}
            className={styles.buttonOrange}
          >
            Agregar pregunta
          </Button>
        </Box>

        {addedCount > 0 && (
          <Typography variant="caption" color="success.main" display="block" mt={2}>
            {addedCount} {addedCount === 1 ? 'pregunta agregada' : 'preguntas agregadas'}{' '}
            {isEvaluation ? 'a la evaluación.' : 'a la trivia.'}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default TriviaQuestionForm;