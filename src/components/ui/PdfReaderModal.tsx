// src/components/ui/PdfReaderModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { API_BASE_URL } from '@/environments/api';

interface PdfReaderModalProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string | null;
  title?: string;
}

export const resolvePdfUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // Ruta relativa desde la API (ej: /uploads/pdfs/...)
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  open,
  onClose,
  pdfUrl,
  title = 'Material de lectura',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const fullUrl = resolvePdfUrl(pdfUrl);

  if (!pdfUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      aria-labelledby="pdf-reader-title"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          height: fullScreen ? '100%' : '85vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        id="pdf-reader-title"
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          gap: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
          <PictureAsPdfIcon sx={{ color: '#e53935' }} />
          <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            component="a"
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<OpenInNewIcon />}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Abrir en pestaña
          </Button>
          <IconButton aria-label="cerrar" onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, flex: 1, backgroundColor: '#525659', position: 'relative' }}>
        <Box
          component="iframe"
          src={fullUrl}
          title={title}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: 'space-between',
        }}
      >
        <Button
          component="a"
          href={fullUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<DownloadIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Descargar PDF
        </Button>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfReaderModal;
