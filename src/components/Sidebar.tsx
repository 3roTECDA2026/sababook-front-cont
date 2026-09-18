import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ForumIcon from '@mui/icons-material/Forum';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RadioIcon from '@mui/icons-material/Radio';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {/* Navegación principal */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/home')}>
              <ListItemIcon><HomeIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/foros')}>
              <ListItemIcon><ForumIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Foros APL" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/favoritos')}>
              <ListItemIcon><FavoriteIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Favoritos" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/insignias')}>
              <ListItemIcon><EmojiEventsIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Insignias" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Módulos integrados: Muro de Actividad y Radio Sábato */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/feed')}>
              <ListItemIcon><DynamicFeedIcon color="secondary" /></ListItemIcon>
              <ListItemText primary="Muro de Actividad" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/radio')}>
              <ListItemIcon><RadioIcon color="secondary" /></ListItemIcon>
              <ListItemText primary="Radio Sábato" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Perfil */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/perfil')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Mi Perfil" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}