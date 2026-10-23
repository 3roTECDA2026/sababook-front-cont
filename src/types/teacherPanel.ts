export interface PanelCourse {
  curso_id: number;
  anio: number;
  division: string;
  anio_lectivo: number;
  materia: string;
}

export interface PanelSummary {
  cantidad_alumnos: number;
  cantidad_favoritos: number;
  cantidad_abandonados: number;
  dias_abandono: number;
}

export interface MostChosenBook {
  libro_id: number;
  titulo: string;
  autor: string;
  portada_url: string | null;
  asignado: boolean;
  alumnos: number;
  leyendo: number;
  leidos: number;
}

export interface MostChosenGenre {
  genero: string;
  cantidad: number;
}

export interface AbandonedBook {
  usuario_id: number;
  alumno: string;
  curso_id: number;
  libro_id: number;
  titulo: string;
  autor: string;
  portada_url: string | null;
  asignado: boolean;
  fecha_estado: string;
  dias_leyendo: number;
}

export interface TeacherPanel {
  cursos: PanelCourse[];
  resumen: PanelSummary;
  libros_mas_elegidos: MostChosenBook[];
  generos_mas_elegidos: MostChosenGenre[];
  abandonados: AbandonedBook[];
}