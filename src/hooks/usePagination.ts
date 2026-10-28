import { useCallback, useEffect, useRef, useState } from 'react';
import type { FetchPage } from '@/types';


interface UsePaginationOptions<T> {
  fetchPage: FetchPage<T>;
  limit?: number;
  mode?: 'append' | 'replace';
  resetKey?: string;
  enabled?: boolean;
}

export function usePagination<T>({
  fetchPage,
  limit = 10,
  mode = 'replace',
  resetKey = '',
  enabled = true,
}: UsePaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  // Siempre usa la última versión de fetchPage sin re-disparar el efecto
  const fetchRef = useRef(fetchPage);
  useEffect(() => {
    //if (!enabled) return;

    fetchRef.current = fetchPage;
  }, [fetchPage]);

  // Reinicio al cambiar la búsqueda/filtros (patrón "ajustar estado durante el render")
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
    setItems([]);
  }

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchRef
      .current(page, limit, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;

        if (mode === 'replace' && res.data.length === 0 && page > res.totalPages) {
        setPage(Math.max(res.totalPages, 1));
        return;
      }
      
        setItems((prev) => (mode === 'append' && page > 1 ? [...prev, ...res.data] : res.data));
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setHasMore(res.hasMore);
      })
     .catch((err) => {
        // Capturamos cualquier variante de cancelación por AbortController
        if (err?.name === 'AbortError' || err?.code === 20. || String(err).includes('aborted')) {
          return;
        }
        setError(err?.message ?? 'Error al cargar los datos');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, limit, mode, resetKey, reloadToken, enabled]);

  const goToPage = useCallback((p: number) => setPage(p), []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage((p) => p + 1);
  }, [loading, hasMore]);

  const reload = useCallback(() => {
    if (mode === 'append') {
      setItems([]);
      setPage(1);
    }
    setReloadToken((t) => t + 1);
  }, [mode]);

  return { items, page, total, totalPages, hasMore, loading, error, goToPage, loadMore, reload };
}