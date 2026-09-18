// src/services/apiService.ts
import { API_BASE_URL } from '../environments/api';
import type { Book, Medal, BookFilters, CafeLiterario } from '../types';

/**
 * Función genérica para hacer peticiones HTTP
 * @param endpoint - Endpoint relativo a la API
 * @param options - Opciones de fetch (method, headers, body, etc.)
 * @returns Respuesta JSON o error
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config: RequestInit = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en la petición a ${endpoint}:`, error);
    throw error;
  }
}

// ========== FUNCIONES PARA LIBROS Y FILTROS ==========

/**
 * Obtener catálogo completo de libros
 */
export async function getCatalogoLibros(): Promise<Book[]> {
  return await apiRequest<Book[]>('/libros');
}

/**
 * Buscar libros con filtros
 */
export async function buscarLibros(filtros: BookFilters = {}): Promise<Book[]> {
  // Construir query string con los filtros
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.append(key, value.trim());
    }
  });

  const queryString = params.toString();
  const endpoint = queryString ? `/libros/buscar?${queryString}` : '/libros/buscar';

  return await apiRequest<Book[]>(endpoint);
}

/**
 * Obtener detalle de un libro específico
 */
export async function getLibroById(libroId: number): Promise<Book> {
  return await apiRequest<Book>(`/libros/${libroId}`);
}

/**
 * Obtener medallas de un usuario
 */
export async function getUserMedals(userId: number | string, signal?: AbortSignal): Promise<Medal[]> {
  return await apiRequest<Medal[]>(`/medal/${userId}`, { signal });
}

// ========== FUNCIONES PARA CAFÉS LITERARIOS ==========

/**
 * Obtener todos los Cafés Literarios (opcionalmente con estado personal del usuario)
 */
export async function getCafesLiterarios(
  usuarioId: number | null = null,
  signal?: AbortSignal
): Promise<CafeLiterario[]> {
  const query = usuarioId ? `?usuario_id=${usuarioId}` : '';
  return await apiRequest<CafeLiterario[]>(`/cafes${query}`, { signal });
}

/**
 * Obtener detalle de un Café Literario por ID
 */
export async function getCafeById(cafeId: number, usuarioId: number | null = null): Promise<CafeLiterario> {
  const query = usuarioId ? `?usuario_id=${usuarioId}` : '';
  return await apiRequest<CafeLiterario>(`/cafes/${cafeId}${query}`);
}

/**
 * Crear un nuevo Café Literario (Docente / Admin)
 */
export async function crearCafeLiterario(data: {
  titulo: string;
  descripcion: string;
  libro_id: string | number;
  fecha_evento: string;
  lugar: string;
  docente_id: number;
}): Promise<{ cafe_id: number; foro_id: number }> {
  return await apiRequest('/cafes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Confirmar o alternar asistencia a un Café Literario
 */
export async function toggleAsistenciaCafe(
  cafeId: number,
  usuarioId: number,
  estado = 'confirmado'
): Promise<{ mensaje: string; estado: string | null }> {
  return await apiRequest(`/cafes/${cafeId}/asistencia`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId, estado }),
  });
}

/**
 * Registrar voto post-lectura (¿Te gustó el libro?)
 */
export async function votarCafeLiterario(
  cafeId: number,
  usuarioId: number,
  voto: boolean
): Promise<{ mensaje: string; voto: { voto_id: number; cafe_id: number; usuario_id: number; voto: boolean } }> {
  return await apiRequest(`/cafes/${cafeId}/voto`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId, voto }),
  });
}

/**
 * Obtener el catálogo completo de insignias de un usuario (obtenidas + no obtenidas)
 */
export async function getCatalogoMedals(userId: number | string, signal?: AbortSignal): Promise<Medal[]> {
  return await apiRequest<Medal[]>(`/medal/catalog/${userId}`, { signal });
}