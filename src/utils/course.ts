import type { PanelCourse } from '@/types';

// Texto corto para identificar un curso del panel: "7°A · Lengua"
export const etiquetaCursoPanel = (curso: PanelCourse) =>
  `${curso.anio}°${curso.division} · ${curso.materia}`;
