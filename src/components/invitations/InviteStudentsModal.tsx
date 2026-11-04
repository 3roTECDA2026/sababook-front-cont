import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { importarInvitaciones } from '@/services/invitationService';
import type { ResultadoImportacionInvitaciones } from '@/types/invitation';
import { downloadCsv } from '@/utils/downloadCsv';

interface InviteStudentsModalProps {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
}

const InviteStudentsModal = ({ open, onClose, onImported }: InviteStudentsModalProps) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacionInvitaciones | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  const reset = () => {
    setArchivo(null);
    setResultado(null);
    setError(null);
    setLoading(false);
    setCopiado(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError(null);
    setResultado(null);

    if (file && !/\.xlsx$/i.test(file.name)) {
      setArchivo(null);
      setError('La planilla debe ser un archivo .xlsx.');
      return;
    }

    setArchivo(file);
  };

  const handleImport = async () => {
    if (!archivo) {
      setError('Seleccioná la planilla Excel.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await importarInvitaciones(archivo);
      setResultado(data);
      if (data.creados + data.reinvitados > 0) {
        onImported?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar la planilla.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(link);
      window.setTimeout(() => setCopiado(null), 2000);
    } catch {
      setError('No se pudo copiar el enlace. Copialo manualmente.');
    }
  };

  const handleDownloadLinks = () => {
    if (!resultado) return;
    downloadCsv(
      'invitaciones-alumnos.csv',
      ['Nombre', 'Email', 'Curso', 'Enlace', 'Vence'],
      resultado.invitaciones.map((invitacion) => [
        invitacion.nombre,
        invitacion.email,
        invitacion.curso,
        invitacion.link,
        invitacion.expira_en,
      ])
    );
  };

  const hayResultado = resultado !== null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Invitar alumnos</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Subí una planilla .xlsx con las columnas <strong>Nombre</strong>, <strong>Email</strong> y{' '}
          <strong>Curso</strong> (por ejemplo, 5°A). Los alumnos quedan pendientes de activación y acá
          vas a obtener el enlace de invitación de cada uno.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="outlined" component="label">
            Seleccionar planilla
            <input
              id="planilla-invitaciones"
              name="planilla-invitaciones"
              type="file"
              accept=".xlsx"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          <Typography variant="body2" color="text.secondary">
            {archivo ? archivo.name : 'Ningún archivo seleccionado'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Procesando la planilla...
          </Alert>
        )}

        {hayResultado && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={resultado.errores.length > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
              {resultado.creados} creados y {resultado.reinvitados} reinvitados de{' '}
              {resultado.total_filas} filas.
              {resultado.errores.length > 0 && ` ${resultado.errores.length} filas con errores.`}
            </Alert>

            {resultado.errores.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Filas con errores
                </Typography>
                <List dense sx={{ maxHeight: 160, overflowY: 'auto', bgcolor: 'grey.50' }}>
                  {resultado.errores.map((fila) => (
                    <ListItem key={`${fila.fila}-${fila.email}`}>
                      <ListItemText
                        primary={`Fila ${fila.fila}: ${fila.email || 'sin email'}`}
                        secondary={fila.mensaje}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {resultado.invitaciones.length > 0 && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Enlaces de invitación</Typography>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadLinks}
                    sx={{ textTransform: 'none' }}
                  >
                    Descargar CSV
                  </Button>
                </Box>

                <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
                  {resultado.invitaciones.map((invitacion) => (
                    <ListItem
                      key={invitacion.usuario_id}
                      alignItems="flex-start"
                      secondaryAction={
                        <Tooltip title={copiado === invitacion.link ? 'Copiado' : 'Copiar enlace'}>
                          <IconButton
                            edge="end"
                            aria-label={`Copiar enlace de ${invitacion.nombre}`}
                            onClick={() => handleCopy(invitacion.link)}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemText
                        primary={`${invitacion.nombre} · ${invitacion.email} · ${invitacion.curso}`}
                        secondary={
                          <TextField
                            value={invitacion.link}
                            size="small"
                            fullWidth
                            InputProps={{ readOnly: true }}
                            sx={{ mt: 1 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none' }}>
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!archivo || loading}
          sx={{ textTransform: 'none' }}
        >
          Importar planilla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteStudentsModal;
