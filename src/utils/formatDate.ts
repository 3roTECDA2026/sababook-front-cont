// src/utils/formatDate.ts
export const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return 'sin fecha';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'sin fecha';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return 'sin fecha';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'sin fecha';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export const isDeadlineExpired = (deadline: string | null | undefined): boolean => {
  if (!deadline) return false;
  const deadlineDate = new Date(`${deadline}T23:59:59`);
  return deadlineDate.getTime() < Date.now();
};
