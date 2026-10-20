import { API_BASE_URL } from '@/environments/api';

const baseURL = `${API_BASE_URL.trim()
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '')}/api/v1`;

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
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

  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    throw new Error(
      'La respuesta del servidor no es un JSON válido. Revisá la configuración de API_BASE_URL.'
    );
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
  obtenerEpisodios: async (): Promise<EpisodioRadio[]> => {
    return request<EpisodioRadio[]>('/radio');
  },

  obtenerTodosEpisodios: async (): Promise<EpisodioRadio[]> => {
    return request<EpisodioRadio[]>('/radio');
  },

  obtenerEpisodioPorId: async (id: number): Promise<EpisodioRadio> => {
    return request<EpisodioRadio>(`/radio/${id}`);
  },

  crearEpisodio: async (
    data: CrearEpisodioPayload
  ): Promise<EpisodioRadio> => {
    return request<EpisodioRadio>('/radio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  eliminarEpisodio: async (
    id: number
  ): Promise<{ mensaje: string }> => {
    return request<{ mensaje: string }>(`/radio/${id}`, {
      method: 'DELETE',
    });
  },

  sincronizarProgramas: async (): Promise<{
    mensaje: string;
    agregados: number;
  }> => {
    return request('/radio/sincronizar', {
      method: 'POST',
    });
  },
};