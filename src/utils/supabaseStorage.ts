// src/utils/supabaseStorage.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const DEFAULT_STORAGE_BUCKET =
  (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined)?.trim() || 'libros';

// Cliente de Supabase (solo para generar URLs públicas de Storage).
// Si faltan las variables de entorno, queda en null y se usa el armado manual.
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Descarta el query string (tokens de URLs firmadas) y barras iniciales.
const normalizePath = (path: string): string => path.split('?')[0].replace(/^\/+/, '');

// Arma manualmente la URL pública, equivalente a getPublicUrl del SDK.
const buildManualPublicUrl = (bucket: string, path: string): string =>
  `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${normalizePath(path)}`;

// Genera la URL pública de un objeto. Usa el SDK si está disponible.
const getPublicUrl = (bucket: string, path: string): string => {
  const cleanPath = normalizePath(path);
  if (supabase) {
    return supabase.storage.from(bucket).getPublicUrl(cleanPath).data.publicUrl;
  }
  if (SUPABASE_URL) {
    return buildManualPublicUrl(bucket, cleanPath);
  }
  // Sin configuración de Supabase devolvemos la ruta original para no romper la UI.
  return cleanPath;
};

// Detecta URLs de Supabase Storage con o sin el segmento /public/ (la causa
// habitual del error: una URL mal formada devuelve JSON y el navegador la
// bloquea por CORB).
const SUPABASE_STORAGE_RE =
  /\/storage\/v1\/object\/(?:public\/|sign\/|authenticated\/)?([^/]+)\/(.+)$/i;

/**
 * Normaliza cualquier valor de imagen a una URL pública válida.
 * - URLs de Supabase Storage (bien o mal formadas) -> getPublicUrl()
 * - URLs externas / data URIs / blobs -> sin cambios
 * - Rutas relativas "archivo.jpg" o "bucket/archivo.jpg" -> getPublicUrl()
 */
export const resolveStorageUrl = (raw?: string | null): string => {
  if (raw == null) return '';

  const value = String(raw).trim();
  if (!value) return '';

  if (/^(data|blob):/i.test(value)) return value;

  const storageMatch = value.match(SUPABASE_STORAGE_RE);
  if (storageMatch) {
    const [, bucket, path] = storageMatch;
    return getPublicUrl(bucket, path);
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('//')) return value;

  const clean = value.replace(/^\/+/, '');
  const parts = clean.split('/');

  // "bucket/carpeta/archivo.ext" -> el primer segmento es el bucket
  if (parts.length > 1) {
    const [bucket, ...rest] = parts;
    return getPublicUrl(bucket, rest.join('/'));
  }

  // Solo el nombre del archivo -> bucket por defecto
  return getPublicUrl(DEFAULT_STORAGE_BUCKET, clean);
};
