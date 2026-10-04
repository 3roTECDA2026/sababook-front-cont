export interface Forum {
  foro_id?: number;
  forumId?: number;
  titulo?: string;
  title?: string;
  descripcion?: string;
  description?: string;
  creador_id?: number | null;
  creatorId?: number;
  creador_nombre?: string | null;
  creatorName?: string | null;
  fecha_creacion?: string;
  createdAt?: string;
}

export interface ForumComment {
  comentario_id?: number;
  commentId?: number;
  foro_id?: number;
  forumId?: number;
  usuario_id?: number;
  userId?: number;
  contenido?: string;
  content?: string;
  fecha?: string;
  createdAt?: string;
  name?: string;
  email?: string;
}

export interface ForumDetailComment {
  comentario_id?: number;
  commentId?: number;
  contenido?: string;
  content?: string;
  fecha?: string;
  createdAt?: string;
  usuario_nombre?: string;
  userName?: string;
  usuario_avatar?: string | null;
  userAvatar?: string | null;
}

export interface ForumDetail {
  foro_id?: number;
  forumId?: number;
  titulo?: string;
  title?: string;
  descripcion?: string;
  description?: string;
  fecha_creacion?: string;
  createdAt?: string;
  creador_nombre?: string | null;
  creatorName?: string | null;
  creador_avatar?: string | null;
  creatorAvatar?: string | null;
  comentarios?: ForumDetailComment[];
  comments?: ForumDetailComment[];
}