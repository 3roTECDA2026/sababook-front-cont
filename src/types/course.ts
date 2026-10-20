// src/types/course.ts

export interface Subject {
  materia_id: number;
  nombre: string;
}

export interface CourseSummary {
  curso_id: number;
  anio: number;
  division: string;
  anio_lectivo: number;
  materia: Subject;
  cantidad_docentes: number;
  cantidad_libros: number;
}

export interface CourseBook {
  libro_id: number;
  titulo: string;
  autor: string;
  portada_url: string | null;
  puntaje: number;
}

export type AccionAsignacion = 'ASIGNADO' | 'PUNTAJE_ACTUALIZADO' | 'QUITADO';

export interface AssignmentHistoryEntry {
  historial_id: number;
  accion: AccionAsignacion;
  puntaje: number | null;
  fecha: string;
  anio_lectivo: number;
  curso: { curso_id: number; anio: number; division: string };
  libro: { libro_id: number; titulo: string; autor: string };
  usuario: { usuario_id: number; nombre: string } | null;
}