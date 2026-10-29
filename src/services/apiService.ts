
 // src/services/apiService.ts

import { API_BASE_URL } from '@/environments/api';

import type {
  Book,
  Medal,
  BookFilters,
  CafeLiterario,
  ReadingGoal,
  Paginated,
  User,
} from '@/types';

import { getCursos, getLibrosDelCurso } from '@/services/courseService';
import { normalizarTexto } from '@/utils/normalize';

/**
 * Función genérica para realizar peticiones HTTP.
 * Mantiene el manejo de cancelaciones con AbortController.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    // No registrar las cancelaciones esperadas como errores.
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    console.error(`Error en la petición a ${endpoint}:`, error);
    throw error;
  }
}

// =====================================================
// LIBROS Y FILTROS
// =====================================================

/**
 * Obtener el catálogo completo de libros.
 */
export async function getCatalogoLibros(
  signal?: AbortSignal
): Promise<Book[]> {
  return await apiRequest<Book[]>('/libros', { signal });
}

/**
 * Buscar libros mediante los filtros de la API.
 */
export async function buscarLibros(
  filtros: BookFilters = {}
): Promise<Book[]> {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      params.append(key, String(value).trim());
    }
  });

  const queryString = params.toString();

  const endpoint = queryString
    ? `/libros/buscar?${queryString}`
    : '/libros/buscar';

  return await apiRequest<Book[]>(endpoint);
}

/**
 * Aplicar filtros de texto a una lista de libros.
 */
function aplicarFiltrosTexto(
  libros: Book[],
  filtros: BookFilters
): Book[] {
  let resultado = libros;

  if (filtros.query) {
    const q = normalizarTexto(filtros.query);

    resultado = resultado.filter(
      (b) =>
        normalizarTexto(b.titulo).includes(q) ||
        normalizarTexto(b.autor).includes(q)
    );
  }

  if (filtros.titulo) {
    const q = normalizarTexto(filtros.titulo);

    resultado = resultado.filter((b) =>
      normalizarTexto(b.titulo).includes(q)
    );
  }

  if (filtros.autor) {
    const q = normalizarTexto(filtros.autor);

    resultado = resultado.filter((b) =>
      normalizarTexto(b.autor).includes(q)
    );
  }

  if (filtros.genero) {
    resultado = resultado.filter(
      (b) => b.genero === filtros.genero
    );
  }

  if (filtros.nivel_educativo) {
    resultado = resultado.filter(
      (b) => b.nivel_educativo === filtros.nivel_educativo
    );
  }

  return resultado;
}

/**
 * Obtener libros asignados a un curso o año escolar.
 *
 * Conserva la lógica incorporada en develop.
 */
export async function obtenerLibrosFiltradosPorCursoOAnio(
  filtros: BookFilters,
  signal?: AbortSignal
): Promise<Book[]> {
  let cursosIds: number[];

  if (filtros.curso_id) {
    cursosIds = [Number(filtros.curso_id)];
  } else {
    const cursos = await getCursos(false, signal);

    const anioLectivoVigente = cursos.reduce(
      (max, c) =>
        c.anio_lectivo > max ? c.anio_lectivo : max,
      Number.NEGATIVE_INFINITY
    );

    cursosIds = cursos
      .filter(
        (c) =>
          c.anio === Number(filtros.anio) &&
          c.anio_lectivo === anioLectivoVigente
      )
      .map((c) => c.curso_id);
  }

  if (cursosIds.length === 0) {
    return [];
  }

  const listasLibros = await Promise.all(
    cursosIds.map((id) =>
      getLibrosDelCurso(id, signal).catch((error) => {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          throw error;
        }

        return [];
      })
    )
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

  const catalogoMap = new Map<number, Book>(
    catalogo.map((b) => [b.libro_id, b])
  );

  const hidratados: Book[] = librosAsignados.map((cb) => {
    const completo = catalogoMap.get(cb.libro_id);

    if (completo) {
      return completo;
    }

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

/**
 * Buscar libros con paginación y filtros.
 * Admite cancelación de solicitudes.
 */
export async function buscarLibrosPaginado(
  filtros: BookFilters = {},
  page = 1,
  limit = 10,
  signal?: AbortSignal
): Promise<Paginated<Book>> {
  if (filtros.curso_id || filtros.anio) {
    const libros = await obtenerLibrosFiltradosPorCursoOAnio(
      filtros,
      signal
    );

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
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      params.append(key, String(value).trim());
    }
  });

  params.set('page', String(page));
  params.set('limit', String(limit));

  return await apiRequest<Paginated<Book>>(
    `/libros/buscar?${params.toString()}`,
    { signal }
  );
}

// =====================================================
// USUARIOS
// =====================================================

export async function getUsersPaginated(
  page = 1,
  limit = 5,
  signal?: AbortSignal
): Promise<Paginated<User>> {
  return await apiRequest<Paginated<User>>(
    `/users?page=${page}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
      signal,
    }
  );
}

// =====================================================
// DETALLE DE LIBROS
// =====================================================

export async function getLibroById(
  libroId: number
): Promise<Book> {
  return await apiRequest<Book>(`/libros/${libroId}`);
}

// =====================================================
// MEDALLAS
// =====================================================

export async function getUserMedals(
  userId: number | string,
  signal?: AbortSignal
): Promise<Medal[]> {
  return await apiRequest<Medal[]>(
    `/medal/${userId}`,
    { signal }
  );
}

export async function getCatalogoMedals(
  userId: number | string,
  signal?: AbortSignal
): Promise<Medal[]> {
  return await apiRequest<Medal[]>(
    `/medal/catalog/${userId}`,
    { signal }
  );
}

// =====================================================
// CAFÉS LITERARIOS
// =====================================================

export async function getCafesLiterarios(
  usuarioId: number | null = null,
  signal?: AbortSignal
): Promise<CafeLiterario[]> {
  const query = usuarioId
    ? `?usuario_id=${usuarioId}`
    : '';

  return await apiRequest<CafeLiterario[]>(
    `/cafes${query}`,
    { signal, headers: getAuthHeaders() }
  );
}

export async function getCafeById(
  cafeId: number,
  usuarioId: number | null = null
): Promise<CafeLiterario> {
  const query = usuarioId
    ? `?usuario_id=${usuarioId}`
    : '';

  return await apiRequest<CafeLiterario>(
    `/cafes/${cafeId}${query}`
  );
}

export async function crearCafeLiterario(data: {
  titulo: string;
  descripcion: string;
  libro_id: string | number;
  fecha_evento: string;
  lugar: string;
  docente_id?: number;
}): Promise<{
  cafe_id: number;
  foro_id: number;
}> {
  return await apiRequest('/cafes', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

export async function toggleAsistenciaCafe(
  cafeId: number,
  _usuarioId?: number,
  estado = 'confirmado'
): Promise<{
  mensaje: string;
  estado: string | null;
}> {
  return await apiRequest(
    `/cafes/${cafeId}/asistencia`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado }),
    }
  );
}

export async function votarCafeLiterario(
  cafeId: number,
  _usuarioId: number | undefined,
  voto: boolean
): Promise<{
  mensaje: string;
  voto: {
    voto_id: number;
    cafe_id: number;
    usuario_id: number;
    voto: boolean;
  };
}> {
  return await apiRequest(
    `/cafes/${cafeId}/voto`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ voto }),
    }
  );
}

// =====================================================
// AUTENTICACIÓN JWT
// =====================================================

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
}

// =====================================================
// METAS DE LECTURA
// =====================================================

interface CreateGoalData {
  usuario_id: number | string;
  periodo_nombre?: string;
  target_books?: number;
  cantidad_libros?: number;
  start_date?: string;
  fecha_inicio?: string;
  end_date?: string;
  fecha_fin?: string;
}

export async function getActiveReadingGoal(
  userId: number | string
): Promise<ReadingGoal[] | ReadingGoal | null> {
  if (!userId) {
    return null;
  }

  return await apiRequest<ReadingGoal[] | ReadingGoal>(
    `/metas-lectura/usuario/${userId}`,
    {
      headers: getAuthHeaders(),
    }
  );
}

export async function createReadingGoal(
  goalData: CreateGoalData
): Promise<ReadingGoal> {
  const payload = {
    usuario_id: Number(goalData.usuario_id),
    periodo_nombre: goalData.periodo_nombre || 'Meta Personal',
    cantidad_libros: Number(goalData.cantidad_libros ?? goalData.target_books ?? 1),
    fecha_inicio: goalData.fecha_inicio ?? goalData.start_date,
    fecha_fin: goalData.fecha_fin ?? goalData.end_date,
  };

  return await apiRequest<ReadingGoal>(
    '/metas-lectura',
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );
}

export async function logBookProgress(
  bookId: number | string
): Promise<ReadingGoal> {
  // Deprecated: el progreso se calcula en base al estado "leído" del libro
  throw new Error('logBookProgress no está soportado');
}

export async function getAllReadingGoals(): Promise<
  ReadingGoal[]
> {
  return await apiRequest<ReadingGoal[]>(
    '/metas-lectura',
    {
      headers: getAuthHeaders(),
    }
  );
}

export async function updateReadingGoal(
  metaId: number | string,
  goalData: Partial<ReadingGoal>
): Promise<ReadingGoal> {
  return await apiRequest<ReadingGoal>(
    `/metas-lectura/${metaId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(goalData),
    }
  );
}

export async function deleteReadingGoal(
  metaId: number | string
): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>(
    `/metas-lectura/${metaId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
}

// =====================================================
// MATERIAL DE LECTURA PDF (SAB-67)
// =====================================================

export async function uploadPdfMaterial(
  fileOrBase64: File | string,
  fileName?: string
): Promise<{ url: string; mensaje: string }> {
  let base64 = '';
  let nombreArchivo = fileName || 'material_lectura.pdf';

  if (typeof fileOrBase64 === 'string') {
    if (
      fileOrBase64.startsWith('http://') ||
      fileOrBase64.startsWith('https://') ||
      fileOrBase64.startsWith('/')
    ) {
      return await apiRequest<{ url: string; mensaje: string }>('/books/upload-pdf', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url: fileOrBase64 }),
      });
    }
    base64 = fileOrBase64;
  } else {
    nombreArchivo = fileOrBase64.name;
    base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
    });
  }

  return await apiRequest<{ url: string; mensaje: string }>('/books/upload-pdf', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      base64,
      nombreArchivo,
    }),
  });
}

export async function adjuntarPdfLibro(
  libroId: number,
  archivoUrl: string
): Promise<{ mensaje: string; libro: Book }> {
  return await apiRequest<{ mensaje: string; libro: Book }>(`/books/${libroId}/pdf`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      archivo_url: archivoUrl,
    }),
  });
}

