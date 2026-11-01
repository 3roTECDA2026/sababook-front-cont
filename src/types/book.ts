import type { TipoRol } from './user';
import type { ReadingStatus } from '@/hooks/useReadingStatus';

export interface Book {
  libro_id: number;
  titulo: string;
  autor: string;
  genero: string;
  nivel_educativo: string;
  descripcion: string;
  portada_url: string;
  archivo_url?: string | null;
  calificacion_promedio: number;
  activo?: boolean;
  estado_lectura?: 'general' | 'quiero-leer' | 'leyendo' | 'leido';
  pagina_actual?: number;
  paginas_totales?: number;
}

export interface BookFilters {
  query?: string;
  titulo?: string;
  autor?: string;
  genero?: string;
  nivel_educativo?: string;
  anio?: string | number;
  curso_id?: string | number;
}

// SAB-060: filtros de los listados del Dashboard (amplían los del catálogo)
export interface ListFilters extends BookFilters {
  rol?: TipoRol;
  libro_id?: number;
  estado_lectura?: ReadingStatus;
  // Se manda junto con el año de cursada, para que el back no use el año del calendario
  anio_lectivo?: number;
}

export interface FeaturedBook {
  id: number | null;
  libro_id: number | null;
  titulo: string;
  calificacion_promedio: number;
  isFavorite: boolean;
  portada_url: string;
}

// Lo que devuelve la API de opiniones
export interface OpinionAPI {
  opinion_id: number;
  usuario_id: number;
  usuario_nombre?: string;
  usuario_rol?: string;
  libro_id: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  destacado?: boolean;
}

// La forma transformada que usan los componentes
export interface Opinion {
  id: number;
  comentario: string;
  calificacion: number;
  usuario: {
    nombre: string;
    rol: string;
  };
  destacado: boolean;
  fecha: string;
}