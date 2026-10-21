// src/services/apiService.ts
import { API_BASE_URL } from '@/environments/api';
import type { Book, Medal, BookFilters, CafeLiterario, ReadingGoal, Paginated, User } from '@/types';
import { getCursos, getLibrosDelCurso } from '@/services/courseService';
import { normalizarTexto } from '@/utils/normalize';

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
export async function getCatalogoLibros(signal?: AbortSignal): Promise<Book[]> {
  return await apiRequest<Book[]>('/libros', { signal });
}

/**
 * Aplica los filtros de texto sobre una lista ya obtenida de libros.
 */
function aplicarFiltrosTexto(libros: Book[], filtros: BookFilters): Book[] {
  let resultado = libros;

  if (filtros.query) {
    const q = normalizarTexto(filtros.query);
    resultado = resultado.filter(
      (b) => normalizarTexto(b.titulo).includes(q) || normalizarTexto(b.autor).includes(q)
    );
  }

  if (filtros.titulo) {
    const q = normalizarTexto(filtros.titulo);
    resultado = resultado.filter((b) => normalizarTexto(b.titulo).includes(q));
  }

  if (filtros.autor) {
    const q = normalizarTexto(filtros.autor);
    resultado = resultado.filter((b) => normalizarTexto(b.autor).includes(q));
  }

  if (filtros.genero) {
    resultado = resultado.filter((b) => b.genero === filtros.genero);
  }

  if (filtros.nivel_educativo) {
    resultado = resultado.filter((b) => b.nivel_educativo === filtros.nivel_educativo);
  }

  return resultado;
}

/**
 * Obtiene y combina los libros asignados a los cursos correspondientes
 * al año escolar o al curso específico seleccionado.
 * Los errores se propagan para que la UI pueda mostrar el mensaje y reintentar.
 */
async function obtenerLibrosFiltradosPorCursoOAnio(
  filtros: BookFilters,
  signal?: AbortSignal
): Promise<Book[]> {
  let cursosIds: number[];

  if (filtros.curso_id) {
    cursosIds = [Number(filtros.curso_id)];
  } else {
    const cursos = await getCursos(false, signal);
    // Solo se considera el año lectivo vigente (el más reciente) para no
    // mezclar libros asignados en años anteriores.
    const anioLectivoVigente = cursos.reduce(
      (max, c) => (c.anio_lectivo > max ? c.anio_lectivo : max),
      Number.NEGATIVE_INFINITY
    );
    cursosIds = cursos
      .filter((c) => c.anio === Number(filtros.anio) && c.anio_lectivo === anioLectivoVigente)
      .map((c) => c.curso_id);
  }

  if (cursosIds.length === 0) {
    return [];
  }

  const listasLibros = await Promise.all(
    cursosIds.map((id) => getLibrosDelCurso(id, signal).catch(() => []))
  );

  const libroIdSet = new Set<number>();
  const librosAsignados: {
    libro_id: number;
    titulo: string;
    autor: string;
    portada_url: string | null;
    puntaje: number;
  }[] = [];

  for (const lista of listasLibros) {
    for (const b of lista) {
      if (!libroIdSet.has(b.libro_id)) {
        libroIdSet.add(b.libro_id);
        librosAsignados.push(b);
      }
    }
  }

  const catalogo = await getCatalogoLibros(signal);
  const catalogoMap = new Map<number, Book>(catalogo.map((b) => [b.libro_id, b]));

  const hidratados: Book[] = librosAsignados.map((cb) => {
    const completo = catalogoMap.get(cb.libro_id);
    if (completo) return completo;
    return {
      libro_id: cb.libro_id,
      titulo: cb.titulo,
      autor: cb.autor,
      genero: '',
      nivel_educativo: '',
      descripcion: '',
      portada_url: cb.portada_url ?? '',
      calificacion_promedio: cb.puntaje ?? 0,
    };
  });

  return aplicarFiltrosTexto(hidratados, filtros);
}

export async function buscarLibrosPaginado(
  filtros: BookFilters = {},
  page = 1,
  limit = 10,
  signal?: AbortSignal
): Promise<Paginated<Book>> {
  if (filtros.curso_id || filtros.anio) {
    const libros = await obtenerLibrosFiltradosPorCursoOAnio(filtros, signal);
    const total = libros.length;
    const start = (page - 1) * limit;
    const data = libros.slice(start, start + limit);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: start + data.length < total,
    };
  }

  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      params.append(key, String(value).trim());
    }
  });
  params.set('page', String(page));
  params.set('limit', String(limit));

  return await apiRequest<Paginated<Book>>(`/libros/buscar?${params.toString()}`, { signal });
}

export async function getUsersPaginated(
  page = 1,
  limit = 5,
  signal?: AbortSignal
): Promise<Paginated<User>> {
  return await apiRequest<Paginated<User>>(`/users?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
    signal,
  });
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
  docente_id?: number;
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
  _usuarioId?: number,
  estado = 'confirmado'
): Promise<{ mensaje: string; estado: string | null }> {
  return await apiRequest(`/cafes/${cafeId}/asistencia`, {
    method: 'POST',
    body: JSON.stringify({ estado }),
  });
}

/**
 * Registrar voto post-lectura (¿Te gustó el libro?)
 */
export async function votarCafeLiterario(
  cafeId: number,
  _usuarioId: number | undefined,
  voto: boolean
): Promise<{ mensaje: string; voto: { voto_id: number; cafe_id: number; usuario_id: number; voto: boolean } }> {
  return await apiRequest(`/cafes/${cafeId}/voto`, {
    method: 'POST',
    body: JSON.stringify({ voto }),
  });
}

/**
 * Obtener el catálogo completo de insignias de un usuario (obtenidas + no obtenidas)
 */
export async function getCatalogoMedals(userId: number | string, signal?: AbortSignal): Promise<Medal[]> {
  return await apiRequest<Medal[]>(`/medal/catalog/${userId}`, { signal });
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