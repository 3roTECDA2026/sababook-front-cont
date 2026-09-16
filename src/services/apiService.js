import { API_BASE_URL } from "../environments/api";

/**
 * Función genérica para hacer peticiones HTTP
 * @param {string} endpoint - Endpoint relativo a la API
 * @param {object} options - Opciones de fetch (method, headers, body, etc.)
 * @returns {Promise<object>} Respuesta JSON o error
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

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
 * @returns {Promise<Array>} Lista de libros
 */
export async function getCatalogoLibros() {
  return await apiRequest('/libros');
}

/**
 * Buscar libros con filtros
 * @param {object} filtros - Objeto con filtros {titulo, autor, genero, nivel_educativo}
 * @returns {Promise<Array>} Lista de libros filtrados
 */
export async function buscarLibros(filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.append(key, value.trim());
    }
  });

  const queryString = params.toString();
  const endpoint = queryString ? `/libros/buscar?${queryString}` : '/libros/buscar';

  return await apiRequest(endpoint);
}

/**
 * Obtener detalle de un libro específico
 * @param {number} libroId - ID del libro
 * @returns {Promise<object>} Datos del libro
 */
export async function getLibroById(libroId) {
  return await apiRequest(`/libros/${libroId}`);
}

/**
 * Obtener medallas de un usuario
 * @param {number|string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de medallas
 */
export async function getUserMedals(userId) {
  return await apiRequest(`/medal/${userId}`);
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

/**
 * Obtener las metas del usuario autenticado
 * @param {number|string} userId
 */
export async function getActiveReadingGoal(userId) {
  if (!userId) return null;
  return await apiRequest(`/metas-lectura/usuario/${userId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Crear una nueva meta de lectura
 * @param {object} goalData
 */
export async function createReadingGoal(goalData) {
  const payload = {
    usuario_id: Number(goalData.usuario_id),
    periodo_nombre: goalData.periodo_nombre || 'Meta Personal',
    cantidad_libros: Number(goalData.target_books),
    fecha_inicio: goalData.start_date,
    fecha_fin: goalData.end_date,
  };

  return await apiRequest('/metas-lectura', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

/**
 * Registrar un libro como leído en la meta activa
 * @param {number|string} bookId 
 */
export async function logBookProgress(bookId) {
  return await apiRequest('/metas-lectura/log-book', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId }),
  });
}

/**
 * Obtener todas las metas del sistema (Panel Admin/Docente)
 */
export async function getAllReadingGoals() {
  return await apiRequest('/metas-lectura', {
    headers: getAuthHeaders(),
  });
}

/**
 * Actualizar una meta por su ID
 * @param {number|string} metaId 
 * @param {object} goalData 
 */
export async function updateReadingGoal(metaId, goalData) {
  return await apiRequest(`/metas-lectura/${metaId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData),
  });
}

/**
 * Eliminar una meta por su ID
 * @param {number|string} metaId 
 */
export async function deleteReadingGoal(metaId) {
  return await apiRequest(`/metas-lectura/${metaId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}