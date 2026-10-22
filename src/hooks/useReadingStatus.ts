import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../environments/api';

export type ReadingStatus = 'general' | 'quiero-leer' | 'leyendo' | 'leido';

// Estado de lectura de un libro y fecha del último cambio
// (para "leido", es la fecha de lectura)
interface ReadingStatusInfo {
  estado: ReadingStatus;
  fecha: string | null;
}

interface ReadingStatusRecord {
  libro_id: number;
  estado_lectura: ReadingStatus;
  fecha_estado?: string;
}

// v2: ahora también se guarda la fecha; el formato anterior no es compatible
const STORAGE_PREFIX = 'sababook-reading-statuses-v2';

export function useReadingStatus() {
  const { user, token } = useAuth() || {};
  const userKey = user?.usuario_id ?? user?.userId ?? 'guest';
  const storageKey = `${STORAGE_PREFIX}-${userKey}`;
  const [statuses, setStatuses] = useState<Record<number, ReadingStatusInfo>>({});

  const guardarEnCache = useCallback(
    (next: Record<number, ReadingStatusInfo>) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Si el navegador no permite guardar, se sigue sin caché
      }
    },
    [storageKey]
  );

  useEffect(() => {
    if (!token) {
      setStatuses({});
      return;
    }

    const loadStatuses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/favorites/statuses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('No se pudieron cargar los estados de lectura');

        const records: ReadingStatusRecord[] = await response.json();
        const next = records.reduce<Record<number, ReadingStatusInfo>>((result, record) => {
          result[record.libro_id] = {
            estado: record.estado_lectura,
            fecha: record.fecha_estado ?? null,
          };
          return result;
        }, {});

        setStatuses(next);
        guardarEnCache(next);
      } catch {
        try {
          const stored = window.localStorage.getItem(storageKey);
          setStatuses(stored ? JSON.parse(stored) : {});
        } catch {
          setStatuses({});
        }
      }
    };

    void loadStatuses();
  }, [storageKey, token, guardarEnCache]);

  // Cambia el estado de lectura de un libro. Devuelve true si el servidor lo guardó.
  // Si el libro no estaba en la biblioteca, el back lo agrega con ese estado.
  const setReadingStatus = useCallback(
    async (libroId: number, status: ReadingStatus): Promise<boolean> => {
      const anterior = statuses[libroId];

      // Actualización inmediata en pantalla
      setStatuses((current) => {
        const next = {
          ...current,
          [libroId]: { estado: status, fecha: current[libroId]?.fecha ?? null },
        };
        guardarEnCache(next);
        return next;
      });

      if (!token) return false;

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/favorites/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ libro_id: libroId, estado_lectura: status }),
        });

        if (!response.ok) {
          throw new Error(`No se pudo guardar el estado (${response.status})`);
        }

        // Se guarda la fecha que devuelve el servidor
        const record: ReadingStatusRecord = await response.json();
        setStatuses((current) => {
          const next = {
            ...current,
            [libroId]: { estado: record.estado_lectura, fecha: record.fecha_estado ?? null },
          };
          guardarEnCache(next);
          return next;
        });
        return true;
      } catch (error) {
        console.error('Error al guardar el estado de lectura:', error);

        // Si falló, se vuelve al estado anterior
        setStatuses((current) => {
          const next = { ...current };
          if (anterior) {
            next[libroId] = anterior;
          } else {
            delete next[libroId];
          }
          guardarEnCache(next);
          return next;
        });
        return false;
      }
    },
    [statuses, token, guardarEnCache]
  );

  const getReadingStatus = useCallback(
    (libroId: number): ReadingStatus => statuses[libroId]?.estado || 'general',
    [statuses]
  );

  // Fecha del último cambio de estado (para "leido", la fecha de lectura)
  const getReadingDate = useCallback(
    (libroId: number): string | null => statuses[libroId]?.fecha ?? null,
    [statuses]
  );

  return { getReadingStatus, getReadingDate, setReadingStatus };
}