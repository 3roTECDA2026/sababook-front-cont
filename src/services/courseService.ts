// src/services/courseService.ts
import { API_BASE_URL } from '@/environments/api';
import type { CourseSummary, CourseBook, TeacherPanel, AssignmentHistoryEntry, PreviousAssignment, CourseStudent } from '@/types';

// Hace la petición con el token y devuelve el mensaje de error real del back si falla
async function solicitud<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // El back responde { error }, salvo los 401 del middleware, que responden { message }
    const mensaje = data?.error ?? data?.message ?? `Error ${response.status}`;
    throw new Error(mensaje);
  }

  return data as T;
}

/**
 * Cursos visibles para el usuario: todos para el administrador,
 * solo los propios para el docente (soloPropios = true)
 */
export async function getCursos(soloPropios = false, signal?: AbortSignal): Promise<CourseSummary[]> {
  return await solicitud<CourseSummary[]>(soloPropios ? '/courses?mine=true' : '/courses', { signal });
}

/**
 * Cursos de un año lectivo, con el docente asignado a cada uno (SAB-117)
 */
export async function getCoursesByYear(schoolYear: number, signal?: AbortSignal): Promise<CourseSummary[]> {
  return await solicitud<CourseSummary[]>(`/courses?anio_lectivo=${schoolYear}`, { signal });
}

/**
 * Cursos de un docente en todos los años lectivos (solo administrador)
 */
export async function getTeacherCourses(teacherId: number, signal?: AbortSignal): Promise<CourseSummary[]> {
  return await solicitud<CourseSummary[]>(`/courses?docente_id=${teacherId}`, { signal });
}

/**
 * Asignar un docente a un curso (cada curso tiene un solo docente)
 */
export async function assignTeacher(courseId: number, teacherId: number) {
  return await solicitud<{ message: string }>(`/courses/${courseId}/teachers`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: teacherId }),
  });
}

/**
 * Quitar un docente de un curso
 */
export async function removeTeacher(courseId: number, teacherId: number) {
  return await solicitud<{ message: string }>(`/courses/${courseId}/teachers/${teacherId}`, {
    method: 'DELETE',
  });
}

/**
 * Cursos en los que está inscripto un alumno, en todos los años lectivos (solo administrador, SAB-116)
 */
export async function getStudentCourses(studentId: number, signal?: AbortSignal): Promise<CourseSummary[]> {
  return await solicitud<CourseSummary[]>(`/courses?alumno_id=${studentId}`, { signal });
}

/**
 * Poner a un alumno en un curso. Si ya tenía otro curso en el año, el back lo pasa en una sola operación
 */
export async function moveStudent(courseId: number, studentId: number) {
  return await solicitud<{ message: string }>(`/courses/${courseId}/students/${studentId}`, {
    method: 'PUT',
  });
}

/**
 * Quitar a un alumno de un curso
 */
export async function unenrollStudent(courseId: number, studentId: number) {
  return await solicitud<{ message: string }>(`/courses/${courseId}/students/${studentId}`, {
    method: 'DELETE',
  });
}

/**
 * Libros asignados a un curso
 */
export async function getLibrosDelCurso(cursoId: number, signal?: AbortSignal): Promise<CourseBook[]> {
  return await solicitud<CourseBook[]>(`/courses/${cursoId}/books`, { signal });
}

/**
 * Asignar un libro a un curso con su puntaje
 */
export async function asignarLibroACurso(cursoId: number, libroId: number, puntaje: number) {
  return await solicitud(`/courses/${cursoId}/books`, {
    method: 'POST',
    body: JSON.stringify({ libro_id: libroId, puntaje }),
  });
}

/**
 * Cambiar el puntaje de un libro ya asignado
 */
export async function actualizarPuntajeLibro(cursoId: number, libroId: number, puntaje: number) {
  return await solicitud(`/courses/${cursoId}/books/${libroId}`, {
    method: 'PUT',
    body: JSON.stringify({ puntaje }),
  });
}

/**
 * Quitar un libro de un curso
 */
export async function quitarLibroDeCurso(cursoId: number, libroId: number) {
  return await solicitud(`/courses/${cursoId}/books/${libroId}`, {
    method: 'DELETE',
  });
}

/**
 * Métricas de lectura de los cursos del docente (o de uno solo, con cursoId)
 */
export async function getPanelDocente(cursoId: number | null, dias: number): Promise<TeacherPanel> {
  const params = new URLSearchParams({ dias: String(dias) });
  if (cursoId !== null) params.set('curso_id', String(cursoId));
  return await solicitud<TeacherPanel>(`/teacher-panel?${params}`);
}

/**
 * Historial de asignaciones de libros, con filtros opcionales por año lectivo, curso y libro
 */
export async function getHistorialAsignaciones(
  filtros: { anio_lectivo?: number; curso_id?: number; libro_id?: number } = {}
): Promise<AssignmentHistoryEntry[]> {
  const params = new URLSearchParams();
  if (filtros.anio_lectivo) params.append('anio_lectivo', String(filtros.anio_lectivo));
  if (filtros.curso_id) params.append('curso_id', String(filtros.curso_id));
  if (filtros.libro_id) params.append('libro_id', String(filtros.libro_id));

  const query = params.toString();
  return await solicitud<AssignmentHistoryEntry[]>(`/courses/history${query ? `?${query}` : ''}`);
}

/**
 * Cursos de años anteriores a los que ya se asignó el libro,
 * para avisar antes de asignarlo de nuevo (SAB-066)
 */
export async function getAsignacionesAnteriores(
  cursoId: number,
  libroId: number
): Promise<PreviousAssignment[]> {
  return await solicitud<PreviousAssignment[]>(
    `/courses/${cursoId}/books/${libroId}/previous-assignments`
  );
}

/**
 * Alumnos inscriptos en un curso (solo el administrador o el docente del curso) (SAB-135)
 */
export async function getCourseStudents(
  courseId: number,
  signal?: AbortSignal
): Promise<CourseStudent[]> {
  return await solicitud<CourseStudent[]>(`/courses/${courseId}/students`, { signal });
}