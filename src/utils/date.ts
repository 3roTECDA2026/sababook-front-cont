// src/utils/date.ts

export const formatDate = (
  dateStr?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateStr) return '';
  
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('es-AR', defaultOptions).format(parsedDate);
};