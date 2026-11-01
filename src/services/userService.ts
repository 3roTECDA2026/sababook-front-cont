// src/services/userService.ts
import { API_BASE_URL } from '@/environments/api';
import type { User } from '@/types';

export type RoleFilter = '' | 'ALUMNO' | 'DOCENTE' | 'ADMINISTRADOR';

interface UserSearch {
  rol?: RoleFilter;
  q?: string;
}

/**
 * Todos los usuarios que coinciden con el rol y la búsqueda, sin paginar (solo administrador).
 * Se usa para exportar el CSV completo (SAB-119).
 */
export async function getUsers({ rol, q }: UserSearch = {}): Promise<User[]> {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (rol) params.append('rol', rol);
  if (q?.trim()) params.append('q', q.trim());

  const response = await fetch(`${API_BASE_URL}/api/v1/users?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? data?.message ?? 'No se pudieron cargar los usuarios.');
  }
  return data as User[];
}
