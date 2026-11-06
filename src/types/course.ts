// src/types/course.ts

export interface Subject {
  materia_id: number;
  nombre: string;
}

export interface CourseTeacher {
  usuario_id: number;
  nombre: string;
  email: string;
}

export interface CourseSummary {
  curso_id: number;
  anio: number;
  division: string;
  anio_lectivo: number;
  materia: Subject;
  puntaje_anual: number;
  cantidad_docentes: number;
  cantidad_libros: number;
  // SAB-117: cada curso tiene un solo docente (null si todavía no tiene)
  docente: CourseTeacher | null;
}

export interface CourseBook {
  libro_id: number;
  titulo: string;
  autor: string;
  portada_url: string | null;
  pdf_path?: string | null;
  puntaje: number | null;
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

// Curso de un año anterior al que ya se asignó un libro (SAB-066)
export interface PreviousAssignment {
  anio_lectivo: number;
  curso: { curso_id: number; anio: number; division: string };
}

// Puntaje acumulado del alumno en un curso (SAB-120)
export interface StudentProgress {
  anio_lectivo: number;
  curso: { curso_id: number; anio: number; division: string } | null;
  puntaje_acumulado: number;
  minimo_requerido: number;
  faltante: number;
  cumplido: boolean;
}

// Alumno inscripto en un curso (SAB-135)
export interface CourseStudent {
  usuario_id: number;
  nombre: string;
  email: string;
}