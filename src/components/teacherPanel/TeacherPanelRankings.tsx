// Rankings de libros y géneros más elegidos por los alumnos
import { Box, Typography } from '@mui/material';
import RankingBar from '@/components/ui/RankingBar';
import StyledCard from '@/components/ui/StyledCard';
import AssignedChip from './AssignedChip';
import type { MostChosenBook, MostChosenGenre } from '@/types';

interface TeacherPanelRankingsProps {
  libros: MostChosenBook[];
  generos: MostChosenGenre[];
}

const SinFavoritos = () => (
  <Typography color="text.secondary">Todavía no hay favoritos.</Typography>
);

export default function TeacherPanelRankings({ libros, generos }: TeacherPanelRankingsProps) {
  // Los rankings vienen ordenados: el primero es el máximo de cada lista
  const maximoLibros = libros[0]?.alumnos ?? 0;
  const maximoGeneros = generos[0]?.cantidad ?? 0;

  return (
    <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
      <StyledCard sx={{ flex: '1 1 300px' }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Libros más elegidos
        </Typography>
        {libros.length === 0 ? (
          <SinFavoritos />
        ) : (
          libros.map((libro) => (
            <RankingBar
              key={libro.libro_id}
              label={
                <>
                  {libro.titulo}
                  {libro.asignado && <AssignedChip />}
                </>
              }
              detail={`${libro.autor} · ${libro.leyendo} leyendo · ${libro.leidos} leídos`}
              value={libro.alumnos}
              max={maximoLibros}
            />
          ))
        )}
      </StyledCard>

      <StyledCard sx={{ flex: '1 1 300px' }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Géneros más elegidos
        </Typography>
        {generos.length === 0 ? (
          <SinFavoritos />
        ) : (
          generos.map((genero) => (
            <RankingBar
              key={genero.genero}
              label={genero.genero}
              value={genero.cantidad}
              max={maximoGeneros}
            />
          ))
        )}
      </StyledCard>
    </Box>
  );
}
