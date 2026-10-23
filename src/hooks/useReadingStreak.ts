// src/hooks/useReadingStreak.ts
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/environments/api';

export interface ReadingStreakState {
  rachaActual: number;
  recordRacha: number;
  ultimaFechaLectura: string | null;
  haLeidoHoy: boolean;
  cargando: boolean;
  error: string | null;
  registrarLectura: () => Promise<void>;
  recargarRacha: () => Promise<void>;
}

export const useReadingStreak = (enabled: boolean = true): ReadingStreakState => {
  const [rachaActual, setRachaActual] = useState<number>(0);
  const [recordRacha, setRecordRacha] = useState<number>(0);
  const [ultimaFechaLectura, setUltimaFechaLectura] = useState<string | null>(null);
  const [haLeidoHoy, setHaLeidoHoy] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRacha = useCallback(async () => {
    if (!enabled) {
      setCargando(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/v1/racha/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Error al consultar la racha');
      }

      const data = await res.json();
      setRachaActual(data.rachaActual ?? 0);
      setRecordRacha(data.recordRacha ?? 0);
      setUltimaFechaLectura(data.ultimaFechaLectura ?? null);
      setHaLeidoHoy(Boolean(data.haLeidoHoy));
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : String(err);
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, [enabled]);

  const registrarLectura = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/racha/registrar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Error al registrar lectura');
      }

      const data = await res.json();
      setRachaActual(data.rachaActual ?? 0);
      setRecordRacha(data.recordRacha ?? 0);
      setUltimaFechaLectura(data.ultimaFechaLectura ?? null);
      setHaLeidoHoy(true);
    } catch (err) {
      console.error('Error registrando lectura:', err);
    }
  }, []);

  useEffect(() => {
    fetchRacha();
  }, [fetchRacha]);

  return {
    rachaActual,
    recordRacha,
    ultimaFechaLectura,
    haLeidoHoy,
    cargando,
    error,
    registrarLectura,
    recargarRacha: fetchRacha,
  };
};

export default useReadingStreak;
