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