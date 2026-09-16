import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, Card, CardContent, CircularProgress, Chip } from '@mui/material';
import { API_BASE_URL } from '../environments/api';

const ModerationAdmin = () => {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/moderacion/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.configured);
        setMaskedKey(data.maskedKey);
      }
    } catch {
      setFeedback({ type: 'error', message: 'No se pudo cargar la configuración de moderación' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    try {
      setSaving(true);
      setFeedback(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/moderacion/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      if (!res.ok) throw new Error();
      setFeedback({ type: 'success', message: 'API Key de Gemini guardada correctamente' });
      setApiKey('');
      fetchConfig();
    } catch {
      setFeedback({ type: 'error', message: 'Error al guardar la API Key' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress size={32} sx={{ display: 'block', margin: '2rem auto' }} />;

  return (
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
  );
};

export default ModerationAdmin;
