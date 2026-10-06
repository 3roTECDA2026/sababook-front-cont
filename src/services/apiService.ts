// src/services/apiService.ts
import { API_BASE_URL } from '@/environments/api';
import type { Book, Medal, BookFilters, ReadingGoal } from '@/types';

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
export async function getUserMedals(userId: number | string): Promise<Medal[]> {
  return await apiRequest<Medal[]>(`/medal/${userId}`);
}

/**
 * Obtener el catálogo completo de insignias de un usuario (obtenidas + no obtenidas)
 */
export async function getCatalogoMedals(userId: number | string): Promise<Medal[]> {
  return await apiRequest<Medal[]>(`/medal/catalog/${userId}`);
}

/**
 * Helper para obtener headers autenticados con JWT
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ========== FUNCIONES PARA METAS DE LECTURA ==========

interface CreateGoalData {
  usuario_id: number | string;
  periodo_nombre?: string;
  target_books: number;
  start_date: string;
  end_date: string;
}

/**
 * Obtener las metas del usuario autenticado
 */
export async function getActiveReadingGoal(userId: number | string): Promise<ReadingGoal | null> {
  if (!userId) return null;
  return await apiRequest<ReadingGoal>(`/metas-lectura/usuario/${userId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Crear una nueva meta de lectura
 */
export async function createReadingGoal(goalData: CreateGoalData): Promise<ReadingGoal> {
  const payload = {
    usuario_id: Number(goalData.usuario_id),
    periodo_nombre: goalData.periodo_nombre || 'Meta Personal',
    cantidad_libros: Number(goalData.target_books),
    fecha_inicio: goalData.start_date,
    fecha_fin: goalData.end_date,
  };

  return await apiRequest<ReadingGoal>('/metas-lectura', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

/**
 * Registrar un libro como leído en la meta activa
 */
export async function logBookProgress(bookId: number | string): Promise<ReadingGoal> {
  return await apiRequest<ReadingGoal>('/metas-lectura/log-book', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId }),
  });
}

/**
 * Obtener todas las metas del sistema (Panel Admin/Docente)
 */
export async function getAllReadingGoals(): Promise<ReadingGoal[]> {
  return await apiRequest<ReadingGoal[]>('/metas-lectura', {
    headers: getAuthHeaders(),
  });
}

/**
 * Actualizar una meta por su ID
 */
export async function updateReadingGoal(
  metaId: number | string,
  goalData: Partial<ReadingGoal>
): Promise<ReadingGoal> {
  return await apiRequest<ReadingGoal>(`/metas-lectura/${metaId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData),
  });
}

/**
 * Eliminar una meta por su ID
 */
export async function deleteReadingGoal(metaId: number | string): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>(`/metas-lectura/${metaId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}