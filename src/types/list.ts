import { Book } from './book';

export interface ListaLectura {
  lista_id: number;
  nombre: string;
  descripcion?: string;
  es_publica?: boolean;
  usuario_id: number;
  libros?: Book[];
}

export interface CreateListaLecturaInput {
  nombre: string;
  descripcion?: string;
  es_publica: boolean;
  libros_ids?: number[];
}