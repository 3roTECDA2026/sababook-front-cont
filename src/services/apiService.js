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
  // Construir query string con los filtros
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
export async function getUserMedals(userId, signal = undefined) {
  return await apiRequest(`/medal/${userId}`, { signal });
}

// ========== FUNCIONES PARA CAFÉS LITERARIOS ==========

/**
 * Obtener todos los Cafés Literarios
 */
export async function getCafesLiterarios(usuarioId = null, signal = undefined) {
  const query = usuarioId ? `?usuario_id=${usuarioId}` : '';
  return await apiRequest(`/cafes${query}`, { signal });
}


/**
 * Obtener detalle de un Café Literario por ID
 */
export async function getCafeById(cafeId, usuarioId = null) {
  const query = usuarioId ? `?usuario_id=${usuarioId}` : '';
  return await apiRequest(`/cafes/${cafeId}${query}`);
}

/**
 * Crear un nuevo Café Literario (Docente / Admin)
 */
export async function crearCafeLiterario(data) {
  return await apiRequest('/cafes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Confirmar o alternar asistencia a un Café Literario
 */
export async function toggleAsistenciaCafe(cafeId, usuarioId, estado = 'confirmado') {
  return await apiRequest(`/cafes/${cafeId}/asistencia`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId, estado })
  });
}

/**
 * Registrar voto post-lectura (¿Te gustó el libro?)
 */
export async function votarCafeLiterario(cafeId, usuarioId, voto) {
  return await apiRequest(`/cafes/${cafeId}/voto`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId, voto })
  });
}