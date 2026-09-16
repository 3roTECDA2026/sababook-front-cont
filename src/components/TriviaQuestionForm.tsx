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
  modo?: TriviaModo;
  fechaLimite?: string | null;
}

const TriviaQuestionForm = ({
  open,
  onClose,
  onAdd,
  modo = 'trivia',
  fechaLimite = null,
}: TriviaQuestionFormProps) => {
  const isEvaluation = modo === 'evaluacion';

  const [formato, setFormato] = useState<TriviaFormato>('multiple');
  const [enunciado, setEnunciado] = useState('');
  const [opciones, setOpciones] = useState<string[]>(Array.from({ length: MULTIPLE_COUNT }, () => ''));
  const [correcta, setCorrecta] = useState(-1);
  const [pares, setPares] = useState<TriviaPar[]>([{ izquierda: '', derecha: '' }]);
  const [texto, setTexto] = useState('');
  const [respuestas, setRespuestas] = useState<string[]>(['']);
  const [addedCount, setAddedCount] = useState(0);

  const formatOptions: { value: TriviaFormato; label: string }[] = [
    { value: 'multiple', label: 'Opción múltiple' },
    { value: 'truefalse', label: 'Verdadero / Falso' },
  ];
  if (isEvaluation) {
    formatOptions.push({ value: 'conexion', label: 'Conexión de nodos' });
    formatOptions.push({ value: 'completar', label: 'Completar el texto' });
  }

  const isTrueFalse = () => formato === 'truefalse';

  const resetForm = () => {
    setEnunciado('');
    setOpciones(isTrueFalse() ? [...TRUE_FALSE_OPTIONS] : Array.from({ length: MULTIPLE_COUNT }, () => ''));
    setCorrecta(-1);
  };

  const handleSetFormat = (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (!value) return;
    setFormato(value as TriviaFormato);
    if (value === 'truefalse') {
      setOpciones([...TRUE_FALSE_OPTIONS]);
    } else {
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

  const handleParChange = (index: number, field: keyof TriviaPar) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPares((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: event.target.value };
      return next;
    });
  };

  const addPar = () => {
    setPares((prev) => [...prev, { izquierda: '', derecha: '' }]);
  };

  const removePar = (index: number) => () => {
    setPares((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const blanksCount = (value: string) => (value.match(/\{blank\}/g) || []).length;

  const syncRespuestas = (value: string) => {
    const count = blanksCount(value);
    setRespuestas((prev) => Array.from({ length: count }, (_, i) => prev[i] ?? ''));
  };

  const handleTextoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTexto(event.target.value);
    syncRespuestas(event.target.value);
  };

  const updateRespuesta = (index: number, value: string) => {
    setRespuestas((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    if (formato === 'multiple' || formato === 'truefalse') {
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
        modo,
        formato,
        fechaLimite: isEvaluation ? fechaLimite : null,
        opciones: opciones.map((opcion) => opcion.trim()),
        correcta,
      });
    } else if (formato === 'conexion') {
      const validPairs = pares.filter((par) => par.izquierda.trim() && par.derecha.trim());
      if (validPairs.length < 2) {
        alert('Completá al menos 2 pares para armar la conexión de nodos.');
        return;
      }

      onAdd({
        pregunta: enunciado.trim() || 'Conectá cada elemento de la izquierda con su par',
        modo,
        formato,
        fechaLimite: isEvaluation ? fechaLimite : null,
        pares: validPairs.map((par) => ({
          izquierda: par.izquierda.trim(),
          derecha: par.derecha.trim(),
        })),
      });
    } else {
      if (!texto.trim()) {
        alert('Escribí el texto con los espacios a completar.');
        return;
      }
      if (blanksCount(texto) === 0) {
        alert(`Marcá los espacios vacíos con ${BLANK_MARKER}.`);
        return;
      }
      if (respuestas.some((respuesta) => !respuesta.trim())) {
        alert('Completá todas las respuestas del texto.');
        return;
      }

      onAdd({
        pregunta: '',
        modo,
        formato,
        fechaLimite: isEvaluation ? fechaLimite : null,
        texto: texto.trim(),
        respuestas: respuestas.map((respuesta) => respuesta.trim()),
      });
    }

    resetForm();
    setPares([{ izquierda: '', derecha: '' }]);
    setTexto('');
    setRespuestas(['']);
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
          value={formato}
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

        {isEvaluation && (formato === 'conexion' || formato === 'completar') && (
          <Typography variant="caption" color="success.main" display="block" mt={1}>
            Formato exclusivo del modo evaluación.
          </Typography>
        )}

        {(formato === 'multiple' || formato === 'truefalse') && (
          <>
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
                    className={styles.checkboxOrange}
                  />
                  <TextField
                    value={opcion}
                    onChange={isTrueFalse() ? undefined : handleOpcionChange(index)}
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

        {formato === 'conexion' && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Armá los pares de nodos que deben conectarse
            </Typography>

            {pares.map((par, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1} mt={1.5}>
                <TextField
                  label={`Elemento ${index + 1}`}
                  value={par.izquierda}
                  onChange={handleParChange(index, 'izquierda')}
                  size="small"
                  fullWidth
                  placeholder="Ej: Autor"
                />
                <Typography variant="body2">↔</Typography>
                <TextField
                  label={`Se conecta con ${index + 1}`}
                  value={par.derecha}
                  onChange={handleParChange(index, 'derecha')}
                  size="small"
                  fullWidth
                  placeholder="Ej: Obra"
                />
                <IconButton
                  size="small"
                  onClick={removePar(index)}
                  disabled={pares.length <= 1}
                  aria-label="Quitar par"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            <Button size="small" startIcon={<AddIcon />} onClick={addPar} sx={{ mt: 1 }}>
              Agregar par
            </Button>
          </Box>
        )}

        {formato === 'completar' && (
          <Box mt={2}>
            <TextField
              label="Texto con espacios"
              value={texto}
              onChange={handleTextoChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              margin="normal"
              placeholder={`Ej: La novela fue escrita por ${BLANK_MARKER} en el año ${BLANK_MARKER}.`}
              helperText={`Usá ${BLANK_MARKER} para cada espacio que el alumno deba completar.`}
            />

            {Array.from({ length: blanksCount(texto) }).map((_, index) => (
              <TextField
                key={index}
                label={`Respuesta ${index + 1}`}
                value={respuestas[index] ?? ''}
                onChange={(event) => updateRespuesta(index, event.target.value)}
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