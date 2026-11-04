// src/components/ui/PdfReaderModal.tsx
import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getBookPdfUrl } from '@/services/apiService';

// SAB-67: el PDF de un libro se lee con una URL temporal que se pide al abrir el modal
// (el bucket es privado). fileUrl es para la vista previa de un archivo local (blob:) aún no subido.
interface PdfReaderModalProps {
  open: boolean;
  onClose: () => void;
  bookId?: number | null;
  fileUrl?: string | null;
  title?: string;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  open,
  onClose,
  bookId,
  fileUrl,
  title = 'Material de lectura',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || fileUrl || !bookId) return;

    const controller = new AbortController();
    setSignedUrl(null);
    setError(null);
    setLoading(true);

    getBookPdfUrl(bookId, controller.signal)
      .then(setSignedUrl)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error && err.message ? err.message : 'No se pudo abrir el PDF.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [open, bookId, fileUrl]);

  const fullUrl = fileUrl || signedUrl || '';

  if (!fileUrl && !bookId) return null;

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
          <PictureAsPdfIcon sx={{ color: 'error.main' }} />
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
            disabled={!fullUrl}
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

      <DialogContent sx={{ p: 0, flex: 1, backgroundColor: 'grey.700', position: 'relative' }}>
        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress sx={{ color: 'common.white' }} aria-label="Cargando PDF" />
          </Box>
        )}
        {error && (
          <Box p={3}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {fullUrl && (
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
        )}
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
          disabled={!fullUrl}
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
