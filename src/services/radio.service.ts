// src/services/radio.service.ts
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
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
    throw new Error(`Request error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server response is not valid JSON.');
  }

  return response.json() as Promise<T>;
}

export interface RadioEpisode {
  episodeId: number;
  title: string;
  audioUrl: string;
  description?: string;
  program?: string;
  airDate?: string;
  creatorId?: number;
}

export interface CreateEpisodePayload {
  title: string;
  audioUrl: string;
  description?: string;
  program?: string;
}

export const radioService = {
  getEpisodes: async (): Promise<RadioEpisode[]> => {
    return request<RadioEpisode[]>('/radio');
  },

  getAllEpisodes: async (): Promise<RadioEpisode[]> => {
    return request<RadioEpisode[]>('/radio');
  },

  getEpisodeById: async (id: number): Promise<RadioEpisode> => {
    return request<RadioEpisode>(`/radio/${id}`);
  },

  createEpisode: async (data: CreateEpisodePayload): Promise<RadioEpisode> => {
    return request<RadioEpisode>('/radio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteEpisode: async (id: number): Promise<{ message: string }> => {
    return request<{ message: string }>(`/radio/${id}`, { method: 'DELETE' });
  },

  syncPrograms: async (): Promise<{ message: string; added: number }> => {
    return request<{ message: string; added: number }>('/radio/sync', {
      method: 'POST',
    });
  },
};