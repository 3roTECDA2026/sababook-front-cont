import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface InfiniteScrollProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  children: ReactNode;
  /** Si hay error se frena la carga automática (evita un loop de reintentos). */
  error?: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  /** Qué tan antes de llegar al final empieza a cargar. */
  rootMargin?: string;
}

export default function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  children,
  error = false,
  loader,
  endMessage,
  rootMargin = '200px',
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || error) return;

    // Al crear el observer se evalúa de inmediato: si el contenido todavía no
    // llena la pantalla, sigue cargando hasta que el centinela quede afuera.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin }
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, loading, error, rootMargin]);

  return (
    <>
      {children}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          {loader ?? <CircularProgress />}
        </Box>
      )}
      {!hasMore && !loading && endMessage}
    </>
  );
}