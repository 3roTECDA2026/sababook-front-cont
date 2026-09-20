// src/components/CrearListaModal.tsx

import {
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Importar Book desde la ubicación centralizada
import { Book, ListaLectura, CreateListaLecturaInput } from '../types';