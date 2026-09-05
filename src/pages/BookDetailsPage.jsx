import { useState } from "react";
import { Box, Divider, useTheme, Tooltip } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import AppHeader from "../components/AppHeader";
import NavButton from "../components/NavButton";
import { useAuth } from "../hooks/useAuth";
import { useBookDetails } from "../hooks/useBookDetails";
import { useBookOpinion } from "../hooks/useBookOpinion";
import BookDetailsHeader from "../components/BookDetailsHeader";
import BookCommentBox from "../components/BookCommentBox";
import BookOpinionList from "../components/BookOpinionList";
import BookDescription from "../components/BookDescription";

const ORANGE_COLOR = "#FF6633";

const BookDetailsPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);

  const { book, loading: bookLoading, error: bookError } = useBookDetails(id);
  const { opinions, setOpinions, loading: opinionsLoading, error: opinionsError } = useBookOpinion(id);
  const yaOpino = opinions.some((op) => op.usuario.usuario_id === user.usuario_id);

  const authorStyle = {
    fontWeight: 900,
    fontSize: "1.5rem",
    lineHeight: 1,
    textTransform: "uppercase",
    mb: 0.5,
    color: theme.palette.text.primary,
  };

  const handleCommentClick = () => setShowCommentBox(!showCommentBox);
  const handleViewCommentsClick = () => navigate(`/book/${id}/comments`);
  const handleMenuToggle = () => setMenuOpen(true);
  const handleMenuClose = () => setMenuOpen(false);

  if (bookLoading || opinionsLoading) return <div>Cargando...</div>;
  if (bookError) return <div>{bookError}</div>;
  if (!book) return <div>No se encontró el libro.</div>;

  const coverImageSrc = book.coverImage?.trim() || book.portada_url?.trim() || null;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        minHeight: "100vh",
        margin: "0 auto",
        py: 2,
        px: 1,
        backgroundColor: theme.palette.common.white,
      }}
    >
      <AppHeader
        onMenuClick={handleMenuToggle}
        title="Detalles del libro"
        subtitle="Descubrí su esencia y su autor"
      />
      <SideMenu open={menuOpen} onClose={handleMenuClose} active="Inicio" />

      <Box sx={{ pt: 0 }}>
        <BookDetailsHeader book={book} coverImageSrc={coverImageSrc} authorStyle={authorStyle} />

        {showCommentBox && (
          <BookCommentBox
            theme={theme}
            id={id}
            user={user}
            newRating={newRating}
            newComment={newComment}
            setNewRating={setNewRating}
            setNewComment={setNewComment}
            setShowCommentBox={setShowCommentBox}
            setOpinions={setOpinions} // Actualiza la lista de opiniones en tiempo real
          />
        )}

        <Divider sx={{ my: 3 }} />

        <BookDescription book={book} />

        <Tooltip title={yaOpino ? "Ya dejaste tu opinión sobre este libro" : ""}>
          <span>
            <NavButton
              onClick={handleCommentClick}
              variant="contained"
              sx={{
                width: "100%",
                p: "12px 20px",
                bgcolor: ORANGE_COLOR + " !important",
                color: "white",
                fontWeight: "bold",
                borderRadius: "8px !important",
                boxShadow: `0 4px 10px rgba(255, 102, 51, 0.4)`,
                "&:hover": { bgcolor: "#cc4800 !important" },
              }}
              disabled={yaOpino}
            >
              Comentar
            </NavButton>
          </span>
        </Tooltip>

        <Divider sx={{ my: 3 }} />

        {/* Lista de opiniones */}
        <BookOpinionList
          opinions={opinions}
          theme={theme}
          handleViewCommentsClick={handleViewCommentsClick}
        />
      </Box>
    </Box>
  );
};

export default BookDetailsPage;

