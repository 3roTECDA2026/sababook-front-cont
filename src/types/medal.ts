export interface Medal {
  medalla_id: number;
  nombre: string;
  descripcion: string;
  tipo_accion: string;
  obtenida?: boolean;
  fecha_obtenida?: string | null;
}