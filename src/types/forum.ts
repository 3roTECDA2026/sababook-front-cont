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

export interface ForumDetailComment {
  comentario_id: number;
  contenido: string;
  fecha: string;
  usuario_nombre: string;
  usuario_avatar: string | null;
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