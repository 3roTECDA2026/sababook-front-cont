// src/hooks/useRadio.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../environments/api';
import { parseJsonResponse } from '../utils/api';

export interface ProgramaRadio {
  programa: string;
  locutor?: string;
  enVivo?: boolean;
}

export const useRadio = () => {
  const [programa, setPrograma] = useState<ProgramaRadio>({
    programa: 'Radio Sábato',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgramaActual = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/radio/actual`);
        if (response.ok) {
          const data = await parseJsonResponse<ProgramaRadio>(response);
          if (data) setPrograma(data);
        } else {
          setError('No se pudo obtener la información del programa');
        }
      } catch (err) {
        console.error('Error al cargar datos de la radio:', err);
        setError('Error de conexión con la radio');
      } finally {
        setLoading(false);
      }
    };

    fetchProgramaActual();
  }, []);

  return { programa, loading, error };
};