import { Box, Typography, TextField, Button, Alert, Card, CardContent, CircularProgress, Chip } from '@mui/material';
import { useModeration } from '@/hooks/useModeration';

const ModerationAdmin = () => {
  const {
    apiKey,
    setApiKey,
    maskedKey,
    isConfigured,
    loading,
    saving,
    feedback,
    incidencias,
    loadingIncidencias,
    resolvingId,
    handleDecision,
    handleSave,
  } = useModeration();

  if (loading) return <CircularProgress size={32} sx={{ display: 'block', margin: '2rem auto' }} />;

  return (
    <Box>
      <Card sx={{ maxWidth: 650, margin: '2rem auto', boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Moderación Inteligente (Gemini IA)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configuración de la API Key para la detección automática de lenguaje inapropiado en opiniones y foros.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip
              label={isConfigured ? `Activa (${maskedKey})` : 'Inactiva (Modo fallback local)'}
              color={isConfigured ? 'success' : 'warning'}
              variant="outlined"
            />
          </Box>

          {feedback && (
            <Alert severity={feedback.type} sx={{ mb: 3 }}>
              {feedback.message}
            </Alert>
          )}

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Google Gemini API Key"
              variant="outlined"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              fullWidth
              required
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={saving || !apiKey.trim()}
              sx={{ alignSelf: 'flex-start' }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Guardar Clave'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 650, margin: '0 auto 2rem', boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Incidencias pendientes de revisión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Contenido bloqueado por la IA o retenido porque la revisión automática falló. Aceptá el bloqueo o rechazalo si fue un falso positivo.
          </Typography>

          {loadingIncidencias ? (
            <CircularProgress size={32} sx={{ display: 'block', margin: '1rem auto' }} />
          ) : incidencias.filter((i) => i.estado === 'pendiente').length === 0 ? (
            <Alert severity="success">No hay incidencias pendientes. Todo al día.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {incidencias
                .filter((i) => i.estado === 'pendiente')
                .map((i) => (
                  <Card key={i.incidencia_id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip label={i.contexto} size="small" variant="outlined" />
                        {i.categoria && <Chip label={i.categoria} size="small" color="warning" variant="outlined" />}
                        <Chip
                          label={new Date(i.fecha).toLocaleString('es-AR')}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                        “{i.contenido_bloqueado}”
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Motivo: {i.motivo}
                        {i.usuario ? ` · Alumno: ${i.usuario.nombre} (${i.usuario.email})` : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={resolvingId === i.incidencia_id}
                          onClick={() => handleDecision(i.incidencia_id, 'aceptada')}
                        >
                          Aceptar bloqueo
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          disabled={resolvingId === i.incidencia_id}
                          onClick={() => handleDecision(i.incidencia_id, 'rechazada')}
                        >
                          Rechazar (falso positivo)
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ModerationAdmin;
