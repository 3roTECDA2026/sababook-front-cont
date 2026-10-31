// src/utils/fetchInterceptor.ts

import { API_BASE_URL } from "@/environments/api";

// SAB-121: evento que AuthContext escuchará para cerrar la sesión.
export const SESSION_EXPIRED_EVENT = "sababook:session-expired";

let interceptorInstalled = false;

/**
 * Instala un interceptor global para las peticiones fetch.
 *
 * Cuando una petición autenticada al backend de Sababook
 * responde 401, notifica a AuthContext.
 *
 * No modifica las respuestas ni los errores originales.
 */
export function installFetchInterceptor(): void {
  if (interceptorInstalled) {
    return;
  }

  const originalFetch = window.fetch.bind(window);
  const backendOrigin = new URL(API_BASE_URL, window.location.origin).origin;

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    // Identificar la URL y el token utilizados en esta petición.
    const requestUrl = input instanceof Request ? input.url : String(input);

    const url = new URL(requestUrl, window.location.href);

    const headers = new Headers(
      input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    const authorization = headers.get("Authorization");
    const tokenEnviado = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    // Guardar el token vigente al iniciar la petición.
    const tokenAlIniciar = localStorage.getItem("token");

    const response = await originalFetch(input, init);

    // Interceptar únicamente respuestas 401 del backend.
    if (response.status !== 401 || url.origin !== backendOrigin) {
      return response;
    }

    // No intervenir si la petición no estaba autenticada.
    if (!tokenEnviado || !tokenAlIniciar) {
      return response;
    }

    // No cerrar una sesión nueva por una petición anterior.
    const tokenActual = localStorage.getItem("token");

    if (tokenEnviado !== tokenAlIniciar || tokenActual !== tokenAlIniciar) {
      return response;
    }

    // Excluir el login y el registro.
    if (
      url.pathname.endsWith("/auth/login") ||
      url.pathname.endsWith("/auth/register")
    ) {
      return response;
    }

    // Avisar a AuthContext sin consumir el cuerpo de la respuesta.
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

    return response;
  };

  interceptorInstalled = true;
}
