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

export interface OpinionAPI {
  opinionId: number;
  userId: number;
  userName?: string;
  userRole?: string;
  bookId: number;
  rating: number;
  comment: string;
  createdAt: string;
  isFeatured?: boolean;
}

export interface Opinion {
  id: number;
  comment: string;
  rating: number;
  user: {
    name: string;
    role: string;
  };
  isFeatured: boolean;
  createdAt: string;
}