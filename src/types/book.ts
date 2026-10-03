export interface Book {
  bookId?: number;
  libro_id?: number;
  title?: string;
  titulo?: string;
  author?: string;
  autor?: string;
  genre?: string;
  genero?: string;
  educationalLevel?: string;
  nivel_educativo?: string;
  description?: string;
  descripcion?: string;
  coverUrl?: string;
  portada_url?: string;
  averageRating?: number;
  calificacion_promedio?: number;
  promedio_calificacion?: number;
  readingStatus?: 'general' | 'want-to-read' | 'reading' | 'read';
  estado_lectura?: 'general' | 'quiero-leer' | 'leyendo' | 'leido';
}

export interface BookFilters {
  query?: string;
  title?: string;
  titulo?: string;
  author?: string;
  autor?: string;
  genre?: string;
  genero?: string;
  educationalLevel?: string;
  nivel_educativo?: string;
}

export interface FeaturedBook {
  id: number | null;
  bookId?: number | null;
  libro_id?: number | null;
  title?: string;
  titulo?: string;
  averageRating?: number;
  calificacion_promedio?: number;
  isFavorite: boolean;
  coverUrl?: string;
  portada_url?: string;
}

export interface OpinionAPI {
  opinionId?: number;
  opinion_id?: number;
  userId?: number;
  usuario_id?: number;
  userName?: string;
  usuario_nombre?: string;
  userRole?: string;
  usuario_rol?: string;
  bookId?: number;
  libro_id?: number;
  rating?: number;
  calificacion?: number;
  comment?: string;
  comentario?: string;
  createdAt?: string;
  fecha?: string;
  isFeatured?: boolean;
  destacado?: boolean;
}

export interface Opinion {
  id: number;
  comment?: string;
  comentario?: string;
  rating?: number;
  calificacion?: number;
  user?: {
    name?: string;
    nombre?: string;
    role?: string;
    rol?: string;
  };
  usuario?: {
    nombre?: string;
    rol?: string;
  };
  isFeatured?: boolean;
  destacado?: boolean;
  createdAt?: string;
  fecha?: string;
}