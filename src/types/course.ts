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