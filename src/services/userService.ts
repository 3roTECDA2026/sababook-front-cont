// src/services/userService.ts
import { API_BASE_URL } from '@/environments/api';
import type { ListFilters, User } from '@/types';

// SAB-060: filtros que acepta GET /users, además de la búsqueda
const USER_FILTER_KEYS = ['rol', 'anio_lectivo', 'anio', 'curso_id', 'libro_id', 'estado_lectura'] as const;

export interface UserSearch extends Pick<ListFilters, (typeof USER_FILTER_KEYS)[number]> {
  q?: string;
}

// Arma los parámetros de GET /users (solo los que tienen valor).
// Lo usan el listado paginado del Dashboard y el CSV, para que filtren igual.
export function buildUserSearchParams({ q, ...filters }: UserSearch): URLSearchParams {
  const params = new URLSearchParams();
  if (q?.trim()) params.append('q', q.trim());
  USER_FILTER_KEYS.forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== '') params.append(key, String(value));
  });
  return params;
}

/**
 * Todos los usuarios que coinciden con la búsqueda y los filtros, sin paginar (solo administrador).
 * Se usa para exportar el CSV completo (SAB-119).
 */
export async function getUsers(search: UserSearch = {}): Promise<User[]> {
  const token = localStorage.getItem('token');
  const params = buildUserSearchParams(search);

  const response = await fetch(`${API_BASE_URL}/api/v1/users?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? data?.message ?? 'No se pudieron cargar los usuarios.');
  }
  return data as User[];
}
