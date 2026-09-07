// src/utils/normalize.ts
// Función para normalizar texto (quitar acentos y convertir a minúsculas)
export const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize('NFD') // normalization form decomposed
    .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    .replace(/ñ/g, 'n')
    .replace(/ü/g, 'u');
};