import { API_BASE_URL } from "@/environments/api";

const BASE_URL = `${API_BASE_URL.trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "")}/api/v1/recomendaciones`;

interface ErrorRespuesta {
  mensaje?: string;
  error?: string;
}

async function verificarRespuesta(response: Response): Promise<void> {
  if (!response.ok) {
    let mensaje = `Error en recomendaciones (${response.status}).`;

    try {
      const data: ErrorRespuesta = await response.json();

      mensaje = data.mensaje || data.error || mensaje;
    } catch {
      // Mantener el mensaje predeterminado.
    }

    throw new Error(mensaje);
  }
}

export const recomendacionService = {
  // Obtener todas las recomendaciones
  async obtenerTodas<T>(signal?: AbortSignal): Promise<T[]> {
    const response = await fetch(BASE_URL, { signal });

    await verificarRespuesta(response);

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Formato de recomendaciones inválido.");
    }

    return data as T[];
  },

  // Crear una recomendación
  async crear(
    libroId: number,
    explicacion: string,
    token: string,
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/${libroId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ explicacion }),
    });

    await verificarRespuesta(response);
  },

  // Eliminar una recomendación
  async eliminar(libroId: number, token: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/${libroId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await verificarRespuesta(response);
  },
};
