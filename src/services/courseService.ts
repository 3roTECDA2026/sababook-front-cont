// src/services/courseService.ts
import { API_BASE_URL } from '@/environments/api';
import type { CourseSummary, CourseBook } from '@/types';

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
export async function getCursos(soloPropios = false): Promise<CourseSummary[]> {
  return await solicitud<CourseSummary[]>(soloPropios ? '/courses?mine=true' : '/courses');
}

/**
 * Libros asignados a un curso
 */
export async function getLibrosDelCurso(cursoId: number): Promise<CourseBook[]> {
  return await solicitud<CourseBook[]>(`/courses/${cursoId}/books`);
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