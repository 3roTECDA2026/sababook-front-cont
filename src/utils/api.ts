
 // src/utils/api.ts

/**
 * Parsea la respuesta de un fetch a JSON de forma segura.
 * Si la respuesta no es JSON válido o viene vacía,
 * evita que la aplicación se rompa.
 */
export const parseJsonResponse = async <T = any>(
  response: Response
): Promise<T | null> => {
  try {
    const text = await response.text();

    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
};

/**
 * Helper para realizar peticiones HTTP con
 * autenticación opcional y parseo seguro.
 *
 * SAB-121:
 * El cierre de sesión por errores 401 autenticados
 * lo administra fetchInterceptor.ts.
 */
export const fetchData = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> => {
  try {
    const token = localStorage.getItem('token');

    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.warn(
        `Petición HTTP fallida [${response.status}]: ${response.statusText}`
      );
    }

    return await parseJsonResponse<T>(response);
  } catch (error) {
    console.error(
      'Error en la red o en la llamada API:',
      error
    );

    return null;
  }
};
