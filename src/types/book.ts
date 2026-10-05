export interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  educationalLevel: string;
  description: string;
  coverUrl: string;
  averageRating: number;
  readingStatus?: 'general' | 'want-to-read' | 'reading' | 'read';
}

export interface BookFilters {
  query?: string;
  title?: string;
  author?: string;
  genre?: string;
  educationalLevel?: string;
}

export interface FeaturedBook {
  id: number | null;
  bookId: number | null;
  title: string;
  averageRating: number;
  isFavorite: boolean;
  coverUrl: string;
}

export interface Opinion {
  opinion_id?: number;
  id?: number;
  usuario_id?: number;
  usuario_nombre?: string;
  libro_id?: number;
  calificacion?: number;
  comentario?: string;
  fecha?: string | Date;
  destacado?: boolean;
  comment?: string;
  rating?: number;
  user?: {
    name: string;
    role: string;
  };
  isFeatured?: boolean;
  createdAt?: string;
}