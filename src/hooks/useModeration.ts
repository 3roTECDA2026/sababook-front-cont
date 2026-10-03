import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/environments/api';

export interface Incidencia {
  incidencia_id: number;
  contexto: string;
  contenido_bloqueado: string;
  motivo: string;
  categoria?: string | null;
  estado: string;
  fecha: string;
  usuario?: { nombre: string; email: string } | null;
}

export const useModeration = () => {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/moderation/config`, {
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

  const fetchIncidencias = async () => {
    try {
      setLoadingIncidencias(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/moderation/incidencias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIncidencias(await res.json());
      }
    } catch {
      setFeedback({ type: 'error', message: 'No se pudieron cargar las incidencias' });
    } finally {
      setLoadingIncidencias(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchIncidencias();
  }, []);

  const handleDecision = async (id: number, decision: 'aceptada' | 'rechazada') => {
    try {
      setResolvingId(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/moderation/incidencias/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) throw new Error();
      setFeedback({
        type: 'success',
        message: decision === 'aceptada' ? 'Bloqueo confirmado' : 'Incidencia descartada (falso positivo)',
      });
      fetchIncidencias();
    } catch {
      setFeedback({ type: 'error', message: 'No se pudo registrar la decisión' });
    } finally {
      setResolvingId(null);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    try {
      setSaving(true);
      setFeedback(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/v1/moderation/config`, {
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

  return {
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
  };
};
