// src/types.ts

export interface Book {
  libro_id: number;
  titulo: string;
  autor: string;
  genero: string;
  nivel_educativo: string;
  descripcion: string;
  portada_url: string;
  calificacion_promedio: number;
}

export interface Medal {
  medalla_id: number;
  nombre: string;
  descripcion: string;
  tipo_accion: string;
}

export interface BookFilters {
  query?: string;
  titulo?: string;
  autor?: string;
  genero?: string;
  nivel_educativo?: string;
}

export interface User {
  usuario_id: number;
  nombre: string;
  email: string;
  rol_id?: number;
  fecha_registro?: string;
  perfil_completo?: boolean;
  avatar_url?: string | null;
  nivel_educativo?: string | null;
  // Campos que agrega el AuthContext desde localStorage
  userId?: string;
  rol?: string | null;
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

export interface Forum {
  foro_id: number;
  titulo: string;
  descripcion: string;
  creador_id: number;
  creador_nombre: string | null;
  fecha_creacion: string;
}

export interface ForumComment {
  comentario_id: number;
  foro_id: number;
  usuario_id: number;
  contenido: string;
  fecha: string;
  nombre?: string;
  email?: string;
}

export interface ForumDetail {
  foro_id: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  creador_nombre: string | null;
  creador_avatar: string | null;
  comentarios: ForumDetailComment[];
}

export interface ForumDetailComment {
  comentario_id: number;
  contenido: string;
  fecha: string;
  usuario_nombre: string;
  usuario_avatar: string | null;
}

export interface CafeLiterario {
  cafe_id: number;
  titulo: string;
  descripcion: string | null;
  fecha_evento: string;
  lugar: string | null;
  estado: string | null;
  fecha_creacion: string | null;
  libro_id: number | null;
  libro_titulo: string | null;
  libro_autor: string | null;
  libro_genero?: string | null;
  libro_descripcion?: string | null;
  libro_portada: string | null;
  docente_id: number | null;
  docente_nombre: string | null;
  docente_avatar: string | null;
  foro_id: number | null;
  total_asistentes: number;
  votos_positivos: number;
  votos_negativos: number;
  total_votos: number;
  asistencia_usuario?: string | null;
  voto_usuario?: boolean | null;
}

export interface NuevoCafe {
  titulo: string;
  descripcion: string;
  libro_id: string;
  fecha_evento: string;
  lugar: string;
}