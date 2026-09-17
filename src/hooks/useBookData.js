import { useState, useEffect } from "react";
import { API_BASE_URL } from "../environments/api";
// import LibroImage from '../assets/libro.jpg' // Requerido para el DEFAULT_FEATURED_BOOK

// const FEATURED_BOOK_ID = 9;

const DEFAULT_FEATURED_BOOK = {
  id: null,
  libro_id: null,
  titulo: "Cargando...",
  calificacion_promedio: 0,
  isFavorite: false,
  portada_url: '',
};

/**
 * Hook personalizado para cargar los datos iniciales de libros y el libro destacado.
 * @returns {Object} Contiene el estado de books, featuredBook y sus setters.
 */
export function useBookData() {
  const [books, setBooks] = useState([]);
  const [featuredBook, setFeaturedBook] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch(`${API_BASE_URL}/api/v1/libros`, { signal })
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setFeaturedBook(DEFAULT_FEATURED_BOOK);
        // console.log("Books loaded:", data);

        // const featured = data.find(book =>
        //     book.libro_id === FEATURED_BOOK_ID || book.id === FEATURED_BOOK_ID
        // );

        // if (featured) {
        //   const actualId = featured.id || featured.libro_id;

        //   setFeaturedBook({
        //     ...featured,
        //     id: actualId,
        //     libro_id: featured.libro_id || featured.id,
        //     isFavorite: featured.isFavorite || false
        //   });
        // }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error("Error cargando libros:", err);
        // Opcional: manejar estado de error
      });

    return () => controller.abort();
  }, []);

  return { books, setBooks, featuredBook, setFeaturedBook };
}