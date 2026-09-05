import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MenuIcon from "@mui/icons-material/Menu";
import LogoImage from '../assets/logo.png';
import { useNavigate, useLocation } from "react-router-dom";

// 1. Creamos la interfaz para definir los tipos de las props
interface AppHeaderProps {
  onMenuClick: () => void; // Indicamos que es una función que no retorna nada
  title?: string;          // Con el '?' indicamos que es opcional
  subtitle?: string;       // También opcional
}

// 2. Le asignamos el tipo AppHeaderProps a los parámetros desestructurados
export default function AppHeader({ onMenuClick, title, subtitle }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackArrow = location.pathname !== "/home";


  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={3}
    >
      {/* BLOQUE IZQUIERDO: Menú + Título */}
      <Box display="flex" alignItems="center">
        {showBackArrow && (
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon />
          </IconButton>
        )}

        {/* Menú hamburguesa */}
        <IconButton onClick={onMenuClick} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>

        {/* Títulos */}
        <Box>
          <Typography variant="h4" color="primary" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center">
        <Box
          component="img"
          src={LogoImage}
          alt="Logo de la aplicación"
          sx={{
            height: { xs: 80, sm: 90 },
            width: 'auto',
          }}
        />
      </Box>
    </Box>
  );
}