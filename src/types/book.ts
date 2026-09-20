export interface Book {
  libro_id: number;
  titulo: string;
  autor: string;
  genero: string;
  nivel_educativo: string;
  descripcion: string;
  portada_url: string;
  calificacion_promedio: number;
  estado_lectura?: 'general' | 'quiero-leer' | 'leyendo' | 'leido';
}

export interface BookFilters {
  query?: string;
  titulo?: string;
  autor?: string;
  genero?: string;
  nivel_educativo?: string;
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