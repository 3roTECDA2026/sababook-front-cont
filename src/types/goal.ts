export interface ReadingGoal {
  meta_id?: number;
  usuario_id: number;
  periodo_nombre?: string;
  cantidad_libros: number;
  libros_leidos?: number;
  progreso?: number;
  fecha_inicio: string;
  fecha_fin: string;
  target_books?: number;
  current_books?: number;
  start_date?: string;
  end_date?: string;
}