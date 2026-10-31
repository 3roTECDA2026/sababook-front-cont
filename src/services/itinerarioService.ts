import { API_BASE_URL } from "@/environments/api";
import { Book } from "@/types/book";

export interface LibroItinerario extends Book {
  explicacion?: string;
}

export interface Itinerario {
  lista_id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  libros: LibroItinerario[];
}

const BASE_URL = `${API_BASE_URL.trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "")}/api/v1/listas`;

export const itinerarioService = {
  async obtenerItinerarios(signal?: AbortSignal): Promise<Itinerario[]> {
    const res = await fetch(`${BASE_URL}?tipo=ITINERARIO`, { signal });
    if (!res.ok) {
      throw new Error(`Error al cargar itinerarios (${res.status})`);
    }
    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data as Itinerario[];
  },

  async obtenerPorId(id: number, signal?: AbortSignal): Promise<Itinerario | null> {
    const res = await fetch(`${BASE_URL}/${id}`, { signal });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Error al obtener itinerario (${res.status})`);
    }
    return (await res.json()) as Itinerario;
  },
};
