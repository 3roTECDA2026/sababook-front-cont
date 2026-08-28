import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ForumIcon from "@mui/icons-material/Forum";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from 'react-router-dom';

export default function SideMenu({ open, onClose, active = "Inicio" }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const userRolId = localStorage.getItem('rol');

  let menuItems;

  // ARREGLO: el rol_id de "Administrador" pasó de 3 a 5 al reordenar
  // la tabla `rol` en la base de datos (Alumno=3, Docente=4, Administrador=5).
  if (userRolId == '5') {
    // Menú para administradores
    menuItems = [
      { text: "Inicio", icon: <HomeIcon />, path: "/home" },
      { text: "Perfil", icon: <PersonIcon />, path: "/perfil" },
      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    ];
  } else {
    // Menú para usuarios normales
    menuItems = [
      { text: "Inicio", icon: <HomeIcon />, path: "/home" },
      { text: "Perfil", icon: <PersonIcon />, path: "/perfil" },
      { text: "Favoritos", icon: <FavoriteIcon />, path: "/favoritos" },
      { text: "Foros", icon: <ForumIcon />, path: "/foros" },
      { text: "Insignias", icon: <EmojiEventsIcon />, path: "/insignias" },
    ];
  }
  
  // Nota: El item 'Salir' se maneja fuera del mapeo

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("userId");
    navigate("/");
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        transitionDuration={400}
        slotProps={{
          paper: {
            sx: {
              width: 240,
              backgroundColor: "rgba(255, 250, 245, 0.95)",
              backdropFilter: "blur(8px)",
              borderTopRightRadius: "20px",
              borderBottomRightRadius: "20px",
              boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
              color: "#4b2c15",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 1,
            },
          },
        }}
      >
        <Box>
          <List>
            {menuItems.map((item, i) => {
              const isActive = item.text === active;
              return (
                <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    //Propiedades para navegación con React Router
                    component={Link}
                    to={item.path}
                    onClick={onClose}
                    sx={{
                      borderRadius: 3,
                      bgcolor: isActive ? "#ff8a00" : "transparent",
                      color: isActive ? "#fff" : "#4b2c15",
                      "&:hover": {
                        bgcolor: isActive ? "#ff9e2a" : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "#fff" : "#4b2c15",
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box textAlign="center" pb={2}>
          <ListItemButton onClick={() => setConfirmOpen(true)}>
            <ListItemIcon sx={{ color: "#4b2c15" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Salir" />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Diálogo de Confirmación */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmar cierre de sesión"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que quieres cerrar la sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogout} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}