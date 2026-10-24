import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { useBookData } from './useBookData';
import { getCursos } from '@/services/courseService';
import { obtenerLibrosFiltradosPorCursoOAnio } from '@/services/apiService';
import { normalizarTexto } from '@/utils/normalize';
import type { Book, BookFilters, CourseSummary } from '@/types';

const obtenerCursosVigentes = (courses: CourseSummary[]) => {
  if (courses.length === 0) return [];

  const anioLectivoVigente = courses.reduce(
    (max, course) => (course.anio_lectivo > max ? course.anio_lectivo : max),
    Number.NEGATIVE_INFINITY
  );

  return courses.filter((course) => course.anio_lectivo === anioLectivoVigente);
};

export function useTriviaBooks() {
  const { isAdmin, isTeacher, loading: authLoading } = useAuth();
  const { books, loading: catalogLoading } = useBookData(!authLoading && !isTeacher);

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

        const courses = obtenerCursosVigentes(await getCursos(true));
        const bookLists = await Promise.allSettled(
          courses.map((course) =>
            obtenerLibrosFiltradosPorCursoOAnio({ curso_id: course.curso_id })
          )
        );

        const uniqueBooks = new Map<number, Book>();
        let failedCourses = 0;

        bookLists.forEach((result) => {
          if (result.status === 'fulfilled') {
            result.value.forEach((book) => uniqueBooks.set(book.libro_id, book));
          } else {
            failedCourses += 1;
          }
        });

        if (!active) return;
        setFilteredBooks(Array.from(uniqueBooks.values()));

        if (failedCourses > 0) {
          setError('No se pudieron cargar los libros de algunos de tus cursos.');
        }
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

  const sourceBooks = authLoading ? [] : filteredBooks ?? (isTeacher ? [] : books);

  const visibleBooks = useMemo(() => {
    const query = normalizarTexto(searchQuery);
    if (!query) return sourceBooks;
    return sourceBooks.filter((book) =>
      normalizarTexto(`${book.titulo} ${book.autor} ${book.genero ?? ''}`).includes(query)
    );
  }, [sourceBooks, searchQuery]);

  return {
    isAdmin,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    books: visibleBooks,
    loading: authLoading || catalogLoading || filteredLoading || (isTeacher && filteredBooks === null),
    error,
  };
}
