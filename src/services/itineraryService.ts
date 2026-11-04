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
};
