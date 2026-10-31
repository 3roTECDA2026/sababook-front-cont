import type { CourseSummary, PanelCourse } from '@/types';

// Texto corto para identificar un curso del panel: "7°A · Lengua"
export const etiquetaCursoPanel = (curso: PanelCourse) =>
  `${curso.anio}°${curso.division} · ${curso.materia}`;

// Año y división de un curso: "3°A"
export const formatCourseLabel = (course: Pick<CourseSummary, 'anio' | 'division'>) =>
  `${course.anio}°${course.division}`;
