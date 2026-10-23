import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { useBookData } from './useBookData';
import { getCursos } from '@/services/courseService';
import { obtenerLibrosFiltradosPorCursoOAnio } from '@/services/apiService';
import type { Book, BookFilters } from '@/types';

const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function useTriviaBooks() {
  const { isAdmin, isTeacher, loading: authLoading } = useAuth();
  const { books, loading: catalogLoading } = useBookData();

  const [filters, setFilters] = useState<BookFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<Book[] | null>(null);
  const [filteredLoading, setFilteredLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // El admin filtra por año y curso; el docente solo ve los libros de sus cursos.
  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin && !isTeacher) {
      setFilteredBooks(null);
      return;
    }

    let active = true;

    const loadBooks = async () => {
      setFilteredLoading(true);
      setError(null);

      try {
        if (isAdmin) {
          const hasFilters = filters.anio !== undefined || filters.curso_id !== undefined;
          if (!hasFilters) {
            if (active) setFilteredBooks(null);
            return;
          }

          const data = await obtenerLibrosFiltradosPorCursoOAnio(filters);
          if (active) setFilteredBooks(data);
          return;
        }

        const courses = await getCursos(true);
        const bookLists = await Promise.all(
          courses.map((course) =>
            obtenerLibrosFiltradosPorCursoOAnio({ curso_id: course.curso_id })
          )
        );

        const uniqueBooks = new Map<number, Book>();
        bookLists.flat().forEach((book) => uniqueBooks.set(book.libro_id, book));

        if (active) setFilteredBooks(Array.from(uniqueBooks.values()));
      } catch (err) {
        if (!active) return;
        setFilteredBooks([]);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los libros.');
      } finally {
        if (active) setFilteredLoading(false);
      }
    };

    loadBooks();

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin, isTeacher, filters]);

  const sourceBooks = filteredBooks ?? (isTeacher ? [] : books);

  const visibleBooks = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return sourceBooks;
    return sourceBooks.filter((book) =>
      normalizeText(`${book.titulo} ${book.autor} ${book.genero}`).includes(query)
    );
  }, [sourceBooks, searchQuery]);

  return {
    isAdmin,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    books: visibleBooks,
    loading: catalogLoading || filteredLoading,
    error,
  };
}
