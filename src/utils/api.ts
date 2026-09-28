// src/utils/api.ts

/**
 * Parsea la respuesta de un fetch a JSON de forma segura.
 * Si la respuesta no es un JSON válido o viene vacía, evita que la app rompa.
 */
export const parseJsonResponse = async <T = any>(response: Response): Promise<T | null> => {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch (error) {
    console.error('Error parseando respuesta JSON:', error);
    return null;
  }
};

/**
 * Helper opcional para realizar peticiones HTTP centralizadas con parseo seguro y token de autenticación opcional.
 */
export const fetchData = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> => {
  try {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.warn(`Petición HTTP fallida [${response.status}]: ${response.statusText}`);
    }

    return await parseJsonResponse<T>(response);
  } catch (error) {
    console.error('Error en la red o en la llamada API:', error);
    return null;
  }
};