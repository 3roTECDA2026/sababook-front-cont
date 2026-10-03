// src/hooks/useBookData.ts
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/environments/api';
import type { Book, FeaturedBook } from '@/types';

const DEFAULT_FEATURED_BOOK: FeaturedBook = {
  id: null,
  bookId: null,
  title: 'Loading...',
  averageRating: 0,
  isFavorite: false,
  coverUrl: '',
};

export function useBookData() {
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBook, setFeaturedBook] = useState<Partial<FeaturedBook>>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/books`)
      .then((res) => res.json())
      .then((data: Book[]) => {
        setBooks(data);
        setFeaturedBook(DEFAULT_FEATURED_BOOK);
      })
      .catch((err) => {
        console.error('Error loading books:', err);
      });
  }, []);

  return { books, setBooks, featuredBook, setFeaturedBook };
}