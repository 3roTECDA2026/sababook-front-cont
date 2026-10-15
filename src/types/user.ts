export type TipoRol = 'ADMINISTRADOR' | 'DOCENTE' | 'ALUMNO';

export interface User {
  usuario_id: number;
  nombre: string;
  email: string;
  rol?: TipoRol | string | null;
  fecha_registro?: string;
  perfil_completo?: boolean;
  avatar_url?: string | null;
  nivel_educativo?: string | null;
  userId?: string;
}