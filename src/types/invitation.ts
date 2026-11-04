export interface InvitacionValidada {
  valido: boolean;
  nombre: string;
  email: string;
  expira_en: string;
}

export interface InvitacionGenerada {
  usuario_id: number;
  nombre: string;
  email: string;
  curso: string;
  link: string;
  expira_en: string;
  reinvitado: boolean;
}

export interface ErrorImportacionInvitaciones {
  fila: number;
  email: string;
  mensaje: string;
}

export interface ResultadoImportacionInvitaciones {
  total_filas: number;
  creados: number;
  reinvitados: number;
  errores: ErrorImportacionInvitaciones[];
  invitaciones: InvitacionGenerada[];
}
