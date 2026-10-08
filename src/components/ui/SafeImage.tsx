// src/components/ui/SafeImage.tsx
import { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { resolveStorageUrl } from '@/utils/supabaseStorage';

// Placeholder local en data URI: evita una request externa (y por lo tanto CORB)
// cuando la imagen original no existe o fue bloqueada.
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="150">' +
      '<rect width="100%" height="100%" fill="#eeeeee"/>' +
      '<text x="50%" y="50%" font-family="sans-serif" font-size="11" fill="#999999" ' +
      'text-anchor="middle" dominant-baseline="middle">Sin imagen</text>' +
      '</svg>'
  );

interface SafeImageProps {
  src?: string | null;
  alt: string;
  sx?: SxProps<Theme>;
  className?: string;
}

/**
 * Imagen que resuelve la URL de Supabase Storage con el SDK y cae a un
 * placeholder local si la carga falla, evitando íconos de imagen rota.
 */
const SafeImage = ({ src, alt, sx, className }: SafeImageProps) => {
  const resolvedSrc = useMemo(() => resolveStorageUrl(src), [src]);
  const [failed, setFailed] = useState(false);

  const finalSrc = !resolvedSrc || failed ? FALLBACK_IMAGE : resolvedSrc;

  return (
    <Box
      component="img"
      src={finalSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      sx={sx}
      className={className}
    />
  );
};

export default SafeImage;
