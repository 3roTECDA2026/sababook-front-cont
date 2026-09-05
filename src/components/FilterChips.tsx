// src/components/FilterChips.tsx
import { useState, MouseEvent } from 'react';
import { Stack, Chip, Menu, MenuItem } from '@mui/material';
import { buscarLibros } from '../services/apiService';
import type { Book, BookFilters } from '../types';

interface FilterData {
  id: string;
  name: string;
  options: string[];
}

const FILTERS_DATA: FilterData[] = [
  {
    id: 'genre',
    name: 'Género',
    options: ['Novela', 'Ficción', 'Poesía', 'Ensayo', 'Biografía', 'Terror', 'Romance', 'Policial', 'Ciencia Ficción', 'Fantasía', 'Académico'],
  },
  {
    id: 'level',
    name: 'Nivel Educativo',
    options: ['Básico', 'Superior'],
  },
  // {
  //   id: 'lists',
  //   name: 'Listas',
  //   options: ['Favoritos', 'Pendientes']
  // },
  // {
  //   id: 'highlights',
  //   name: 'Destacados',
  //   options: ['Populares', 'Nuevos', 'Mejor Calificados']
  // },
];

// Mapa inverso para mostrar nombres legibles
const reverseMapping: Record<string, string> = {
  genero: 'Género',
  nivel_educativo: 'Nivel Educativo',
};

interface FilterChipsProps {
  onFilterChange?: (resultados: Book[], filtros: BookFilters) => void;
  onClearSearch?: () => void;
}

export default function FilterChips({ onFilterChange, onClearSearch }: FilterChipsProps) {
  // Estado para el elemento de anclaje (donde se abre el menú)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // Estado para saber qué filtro está activo (e.g., 'Género')
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  // Estado para los filtros seleccionados
  const [selectedFilters, setSelectedFilters] = useState<BookFilters>({});
  const openMenu = Boolean(anchorEl);

  const handleChipClick = (event: MouseEvent<HTMLDivElement>, filterId: string) => {
    // 1. Establece el chip clicado como el ancla
    setAnchorEl(event.currentTarget);
    // 2. Registra el ID del filtro activo
    setActiveFilterId(filterId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveFilterId(null);
  };

  const handleMenuItemClick = async (filterId: string | null, option: string) => {
    console.log(`Filtro [${filterId}] seleccionado: ${option}`);

    // Mapear los IDs de filtro a los nombres de campo de la API
    const filterMapping: Record<string, keyof BookFilters> = {
      genre: 'genero',
      level: 'nivel_educativo',
      // 'lists' y 'highlights' no se mapean directamente a la API de libros
    };

    const apiField = filterId ? filterMapping[filterId] : undefined;
    if (apiField) {
      // Actualizar filtros seleccionados
      const newFilters: BookFilters = { ...selectedFilters, [apiField]: option };
      setSelectedFilters(newFilters);

      try {
        // Llamar a la API con los filtros
        const resultados = await buscarLibros(newFilters);
        console.log('Resultados de búsqueda:', resultados);

        // Notificar al componente padre sobre el cambio de filtros
        if (onFilterChange) {
          onFilterChange(resultados, newFilters);
        }
      } catch (error) {
        console.error('Error al buscar libros:', error);
      }
    }

    handleMenuClose();
  };

  const handleDeleteFilter = async (apiField: string) => {
    const newFilters: BookFilters = { ...selectedFilters };
    delete newFilters[apiField as keyof BookFilters];
    setSelectedFilters(newFilters);

    // Limpiar la barra de búsqueda
    if (onClearSearch) onClearSearch();

    try {
      const resultados = await buscarLibros(newFilters);
      if (onFilterChange) {
        onFilterChange(resultados, newFilters);
      }
    } catch (error) {
      console.error('Error al eliminar filtro:', error);
    }
  };

  const activeFilterData = FILTERS_DATA.find((f) => f.id === activeFilterId);

  return (
    <>
      <Stack direction="row" spacing={1} mb={2} sx={{ overflowX: 'auto' }}>
        {/* Mapea y renderiza todos los chips */}
        {FILTERS_DATA.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.name}
            onClick={(e) => handleChipClick(e, filter.id)}
            aria-controls={activeFilterId === filter.id ? 'filter-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={activeFilterId === filter.id ? 'true' : undefined}
            color={activeFilterId === filter.id ? 'primary' : 'default'}
            variant="outlined"
          />
        ))}
      </Stack>

      {/* Chips de filtros seleccionados */}
      {Object.keys(selectedFilters).length > 0 && (
        <Stack direction="row" spacing={1} mt={1} sx={{ overflowX: 'auto' }}>
          {Object.entries(selectedFilters).map(([apiField, value]) => (
            <Chip
              key={apiField}
              label={`${reverseMapping[apiField] || apiField}: ${value}`}
              onDelete={() => handleDeleteFilter(apiField)}
              color="primary"
              variant="filled"
              size="small"
            />
          ))}
        </Stack>
      )}

      {/* El componente Menu se renderiza para el filtro activo */}
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {activeFilterData?.options.map((option) => (
          <MenuItem key={option} onClick={() => handleMenuItemClick(activeFilterId, option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}