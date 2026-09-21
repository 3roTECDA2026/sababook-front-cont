// src/services/radio.service.ts
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
// Remueve la barra final si existe para evitar "//radio"
const baseURL = rawBaseURL.replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status}`);
  }

  // Verifica que la respuesta sea efectivamente JSON (evita el fallo <!doctype html>)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('La respuesta del servidor no es un JSON válido. Revisa VITE_API_URL.');
  }

  return response.json() as Promise<T>;
}

export interface EpisodioRadio {
  episodio_id: number;
  titulo: string;
  audio_url: string;
  descripcion?: string;
  programa?: string;
  fecha_emision?: string;
  creador_id?: number;
}

export interface CrearEpisodioPayload {
  titulo: string;
  audio_url: string;
  descripcion?: string;
  programa?: string;
}

export const radioService = {
  // Obtener todos los episodios
  obtenerEpisodios: async (): Promise<EpisodioRadio[]> => {
    return request<EpisodioRadio[]>('/radio');
  },

  // Alias por si el componente invoca obtenerTodosEpisodios
  obtenerTodosEpisodios: async (): Promise<EpisodioRadio[]> => {
    return request<EpisodioRadio[]>('/radio');
  },

  // Obtener un episodio por ID
  obtenerEpisodioPorId: async (id: number): Promise<EpisodioRadio> => {
    return request<EpisodioRadio>(`/radio/${id}`);
  },

  // Crear un nuevo episodio
  crearEpisodio: async (data: CrearEpisodioPayload): Promise<EpisodioRadio> => {
    return request<EpisodioRadio>('/radio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Eliminar un episodio
  eliminarEpisodio: async (id: number): Promise<{ mensaje: string }> => {
    return request<{ mensaje: string }>(`/radio/${id}`, { method: 'DELETE' });
  },

  // Sincronizar programas desde Google Sites
  sincronizarProgramas: async (): Promise<{ mensaje: string; agregados: number }> => {
    return request<{ mensaje: string; agregados: number }>('/radio/sincronizar', {
      method: 'POST',
    });
  },
};