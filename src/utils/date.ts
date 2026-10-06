// src/utils/date.ts

export const formatearFecha = (
  fechaStr?: string,
  opciones?: Intl.DateTimeFormatOptions
): string => {
  if (!fechaStr) return '';
  
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return '';

  const opcionesPorDefecto: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opciones,
  };

  return new Intl.DateTimeFormat('es-AR', opcionesPorDefecto).format(fecha);
};