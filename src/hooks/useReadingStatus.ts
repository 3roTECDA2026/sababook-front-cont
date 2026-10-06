import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../environments/api';

export type ReadingStatus = 'general' | 'quiero-leer' | 'leyendo' | 'leido';

const STORAGE_PREFIX = 'sababook-reading-statuses';

export function useReadingStatus() {
  const { user, token } = useAuth() || {};
  const userKey = user?.usuario_id ?? user?.userId ?? 'guest';
  const storageKey = `${STORAGE_PREFIX}-${userKey}`;
  const [statuses, setStatuses] = useState<Record<number, ReadingStatus>>({});

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

        const records: Array<{ libro_id: number; estado_lectura: ReadingStatus }> =
          await response.json();
        const next = records.reduce<Record<number, ReadingStatus>>((result, record) => {
          result[record.libro_id] = record.estado_lectura;
          return result;
        }, {});

        setStatuses(next);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
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
  }, [storageKey, token]);

  const setReadingStatus = useCallback(
    (libroId: number, status: ReadingStatus) => {
      setStatuses((current) => {
        const next = { ...current, [libroId]: status };
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });

      if (token) {
        void fetch(`${API_BASE_URL}/api/v1/favorites/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ libro_id: libroId, estado_lectura: status }),
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`No se pudo guardar el estado (${response.status})`);
          }
        }).catch((error) => {
          console.error('Error al guardar el estado de lectura:', error);
        });
      }
    },
    [storageKey, token]
  );

  const getReadingStatus = useCallback(
    (libroId: number): ReadingStatus => statuses[libroId] || 'general',
    [statuses]
  );

  return { getReadingStatus, setReadingStatus };
}