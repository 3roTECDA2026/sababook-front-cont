
import { Box, Typography } from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import BookCard from "./BookCard";

import type { FeaturedBook } from "@/types";
import type { ReadingStatus } from "@/hooks/useReadingStatus";

export type LibroDestacado = Partial<FeaturedBook> & {
  libro_id: number;
  autor?: string;
  genero?: string;
  rating?: number;
  explicacion?: string;
};

interface FeaturedBookSectionProps {
  featuredBooks: LibroDestacado[];

  handleFavoriteToggle: (
    libroId: number
  ) => boolean | Promise<boolean>;

  isBookFavorite: (libroId: number) => boolean;

  handleVerMas: (
    libroId: number | null | undefined
  ) => void;

  getReadingStatus: (
    libroId: number
  ) => ReadingStatus;

  setReadingStatus: (
    libroId: number,
    status: ReadingStatus
  ) => void;

  // Se mantienen estas propiedades opcionales
  // para evitar errores si Home.tsx todavía las envía.
  // Ya no se utilizan para mostrar botones aquí.
  canRemoveRecommendation?: (
    libroId: number
  ) => boolean;

  onRemoveRecommendation?: (
    libroId: number
  ) => Promise<void>;

  removingBookId?: number | null;
}

export default function FeaturedBookSection({
  featuredBooks,
  handleFavoriteToggle,
  isBookFavorite,
  handleVerMas,
  getReadingStatus,
  setReadingStatus,
}: FeaturedBookSectionProps) {
  if (featuredBooks.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      {/* TÍTULO DE LA SECCIÓN */}

      <Typography
        variant="h4"
        fontWeight="bold"
        color="secondary"
        sx={{ mb: 2 }}
      >
        Nuestros recomendados
      </Typography>

      {/* CONTENEDOR DE LIBROS RECOMENDADOS */}

      <Box
        sx={{
          backgroundColor: "#ffffff",
          border: "1.5px solid #333333",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          padding: { xs: 2, md: 3 },

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            md:
              featuredBooks.length > 1
                ? "repeat(2, minmax(0, 1fr))"
                : "1fr",
          },

          gap: 3,
          alignItems: "start",
        }}
      >
        {featuredBooks.map((book) => (
          <Box
            key={book.libro_id}
            sx={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 2,
            }}
          >
            {/* TARJETA DEL LIBRO */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                minWidth: 0,

                "& > *": {
                  maxWidth: "100%",
                },
              }}
            >
              <BookCard
                featured={true}
                image={book.portada_url}
                title={book.titulo}
                autor={book.autor}
                gender={book.genero}
                rating={
                  book.calificacion_promedio ??
                  book.rating
                }
                isFavorite={
                  isBookFavorite(book.libro_id)
                }
                onFavoriteToggle={() =>
                  handleFavoriteToggle(book.libro_id)
                }
                libro_id={book.libro_id}
                readingStatus={
                  getReadingStatus(book.libro_id)
                }
                onReadingStatusChange={(status) =>
                  setReadingStatus(
                    book.libro_id,
                    status
                  )
                }
                showReadingStatusControl
                includeGeneralStatus
                onVerMas={() =>
                  handleVerMas(book.libro_id)
                }
              />
            </Box>

            {/* COMENTARIO DE LA RECOMENDACIÓN */}

            {book.explicacion?.trim() && (
              <Box
                sx={{
                  backgroundColor: "#fafafa",
                  border: "1px solid #dddddd",
                  borderRadius: "12px",
                  padding: 2,
                  width: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <FormatQuoteIcon
                    sx={{
                      color: "#f25600",
                      fontSize: 23,
                    }}
                  />

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      color: "#252525",
                    }}
                  >
                    Comentario de la recomendación
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#333333",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {book.explicacion}
                </Typography>
              </Box>
            )}

            {/*
              EL BOTÓN "DEJAR DE RECOMENDAR"
              SE ELIMINÓ DE ESTA SECCIÓN.

              Ahora se gestiona exclusivamente
              desde BookDetailsPage.tsx.
            */}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
