
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number;
  onUpdateProgress: (newPage: number) => void | Promise<void>;
  loading?: boolean;
  saving?: boolean;
  disabled?: boolean;
}

const ORANGE_COLOR = '#FF6633';

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  currentPage,
  totalPages,
  onUpdateProgress,
  loading = false,
  saving = false,
  disabled = false,
}) => {
  const [pageInput, setPageInput] = useState(
    String(currentPage)
  );

  const [error, setError] = useState('');

  const validTotal =
    Number.isInteger(totalPages) && totalPages > 0;

  const maxPages = validTotal ? totalPages : 0;

  const percentage = validTotal
    ? Math.min(
        Math.max((currentPage / totalPages) * 100, 0),
        100
      )
    : 0;

  useEffect(() => {
    setPageInput(String(currentPage));
    setError('');
  }, [currentPage]);

  const changePage = (value: number) => {
    if (!validTotal) return;

    const safePage = Math.min(
      Math.max(value, 0),
      maxPages
    );

    setPageInput(String(safePage));
    setError('');
  };

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading || saving || disabled) return;

    if (!validTotal) {
      setError('El libro no tiene un total de páginas válido.');
      return;
    }

    const page = Number(pageInput);

    if (
      pageInput.trim() === '' ||
      !Number.isInteger(page) ||
      page < 0 ||
      page > maxPages
    ) {
      setError(
        `Ingresá una página entre 0 y ${maxPages}.`
      );
      return;
    }

    setError('');
    await onUpdateProgress(page);
  };

  const controlsDisabled =
    loading || saving || disabled || !validTotal;

  const parsedInput = Number(pageInput);

  const validInput =
    pageInput.trim() !== '' &&
    Number.isInteger(parsedInput) &&
    parsedInput >= 0 &&
    parsedInput <= maxPages;

  return (
    <Box
      sx={{
        width: '100%',
        my: 3,
        p: 2,
        borderRadius: 2,
        bgcolor: '#f9f9f9',
        border: '1px solid #e0e0e0',
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        gutterBottom
      >
        Seguimiento de lectura
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            my: 2,
          }}
        >
          <CircularProgress
            size={18}
            sx={{ color: ORANGE_COLOR }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Cargando tu progreso...
          </Typography>
        </Box>
      ) : (
        <>
          {/* BARRA ORIGINAL DE PROGRESO */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Página {currentPage} de {validTotal ? totalPages : '—'}
            </Typography>

            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary"
            >
              {Math.round(percentage)}% completado
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              mb: 2,
              '& .MuiLinearProgress-bar': {
                backgroundColor: ORANGE_COLOR,
              },
            }}
          />

          {/* SELECTOR DE PÁGINA ORIGINAL CON BOTONES */}
          <Box
            component="form"
            onSubmit={handleSave}
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <IconButton
              disabled={
                controlsDisabled ||
                !validInput ||
                parsedInput <= 0
              }
              onClick={() => changePage(parsedInput - 1)}
              aria-label="Retroceder una página"
              sx={{
                border: '1px solid #ddd',
                bgcolor: '#fff',
              }}
            >
              <RemoveIcon />
            </IconButton>

            <TextField
              label="Página actual"
              type="number"
              size="small"
              value={pageInput}
              onChange={(e) => {
                setPageInput(e.target.value);
                setError('');
              }}
              disabled={controlsDisabled}
              inputProps={{
                min: 0,
                max: maxPages,
                step: 1,
              }}
              sx={{
                width: 140,
              }}
            />

            <IconButton
              disabled={
                controlsDisabled ||
                !validInput ||
                parsedInput >= maxPages
              }
              onClick={() => changePage(parsedInput + 1)}
              aria-label="Avanzar una página"
              sx={{
                border: '1px solid #ddd',
                bgcolor: '#fff',
              }}
            >
              <AddIcon />
            </IconButton>

            <TextField
              label="Total de páginas"
              type="number"
              size="small"
              value={validTotal ? totalPages : ''}
              disabled
              sx={{
                width: 140,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={controlsDisabled || !validInput}
              startIcon={
                saving ? (
                  <CircularProgress
                    size={16}
                    color="inherit"
                  />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{
                bgcolor: ORANGE_COLOR,
                '&:hover': {
                  bgcolor: '#cc4800',
                },
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              {saving ? 'Guardando...' : 'Guardar progreso'}
            </Button>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          )}

          {!validTotal && (
            <Alert
              severity="warning"
              sx={{ mt: 2 }}
            >
              Este libro no tiene un total de páginas registrado.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default ReadingProgress;
