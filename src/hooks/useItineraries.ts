// src/hooks/useItineraries.ts
import { useState, useEffect } from 'react';
import { itineraryService, Itinerary } from '@/services/itineraryService';

export function useItineraries() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    itineraryService
      .getItineraries(controller.signal)
      .then((data) => {
        setItineraries(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'No se pudieron cargar los itinerarios APL.');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { itineraries, loading, error };
}
