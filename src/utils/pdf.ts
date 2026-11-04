// src/utils/pdf.ts
// SAB-67: validación del PDF antes de subirlo. El back vuelve a validar el contenido.

// Mismo límite que el back y el bucket de Supabase: "25 MB" = 25.000.000 bytes
export const MAX_PDF_SIZE_MB = 25;
const MAX_PDF_SIZE = MAX_PDF_SIZE_MB * 1000 * 1000;

// Devuelve el mensaje de error, o null si el archivo se puede subir
export const validatePdfFile = (file: File): string | null => {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return 'El archivo seleccionado debe ser un documento PDF (.pdf).';
  }
  if (file.size > MAX_PDF_SIZE) {
    return `El PDF no puede superar los ${MAX_PDF_SIZE_MB} MB.`;
  }
  return null;
};
