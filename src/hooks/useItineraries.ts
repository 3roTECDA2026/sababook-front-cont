// src/hooks/useItineraries.ts
import { useState, useEffect, useCallback } from 'react';
import { itineraryService, Itinerary, CreateItineraryInput } from '@/services/itineraryService';
import { useAuth } from '@/hooks/useAuth';

export function useItineraries() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchItineraries = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await itineraryService.getItineraries(signal);
      setItineraries(data);
      setError(null);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'No se pudieron cargar los itinerarios APL.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchItineraries(controller.signal);
    return () => controller.abort();
  }, [fetchItineraries]);

  const createItinerary = async (input: CreateItineraryInput) => {
    if (!token) throw new Error('No hay sesión activa.');
    const created = await itineraryService.createItinerary(input, token);
    await fetchItineraries();
    return created;
  };

  const deleteItinerary = async (id: number) => {
    if (!token) throw new Error('No hay sesión activa.');
    await itineraryService.deleteItinerary(id, token);
    setItineraries((prev) => prev.filter((it) => it.lista_id !== id));
  };

  return { itineraries, loading, error, reload: fetchItineraries, createItinerary, deleteItinerary };
}
