// src/services/itineraryService.ts
import { API_BASE_URL } from '@/environments/api';
import { Book } from '@/types/book';

export interface ItineraryBook extends Book {
  explicacion?: string;
}

export interface Itinerary {
  lista_id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  libros: ItineraryBook[];
}

export interface CreateItineraryBookInput {
  libroId: number;
  explicacion: string;
}

export interface CreateItineraryInput {
  nombre: string;
  descripcion: string;
  tipo?: string;
  libros: CreateItineraryBookInput[];
}

const BASE_URL = `${API_BASE_URL.trim()
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '')}/api/v1/lists`;

export const itineraryService = {
  async getItineraries(signal?: AbortSignal): Promise<Itinerary[]> {
    const res = await fetch(`${BASE_URL}?tipo=ITINERARIO`, { signal });
    if (!res.ok) {
      throw new Error(`Error al cargar itinerarios (${res.status})`);
    }
    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data as Itinerary[];
  },

  async createItinerary(input: CreateItineraryInput, token: string): Promise<Itinerary> {
    const payload = {
      ...input,
      tipo: 'ITINERARIO',
    };

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error al crear itinerario (${res.status})`);
    }

    const data = await res.json();
    return (data.lista || data) as Itinerary;
  },

  async deleteItinerary(id: number, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error al eliminar itinerario (${res.status})`);
    }
  },
};
