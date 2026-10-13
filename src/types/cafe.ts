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
