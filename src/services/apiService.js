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