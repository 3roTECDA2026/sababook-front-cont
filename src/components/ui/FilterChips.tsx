// src/components/FilterChips.tsx
import { useState, MouseEvent } from 'react';
import { Stack, Chip, Menu, MenuItem } from '@mui/material';
import { searchBooks } from '@/services/apiService';
import type { Book, BookFilters } from '@/types';

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
];

const reverseMapping: Record<string, string> = {
  genre: 'Género',
  educationalLevel: 'Nivel Educativo',
};

interface FilterChipsProps {
  onFilterChange?: (results: Book[], filters: BookFilters) => void;
  onClearSearch?: () => void;
}

export default function FilterChips({ onFilterChange, onClearSearch }: FilterChipsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<BookFilters>({});
  const openMenu = Boolean(anchorEl);

  const handleChipClick = (event: MouseEvent<HTMLDivElement>, filterId: string) => {
    setAnchorEl(event.currentTarget);
    setActiveFilterId(filterId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveFilterId(null);
  };

  const handleMenuItemClick = async (filterId: string | null, option: string) => {
    const filterMapping: Record<string, keyof BookFilters> = {
      genre: 'genre',
      level: 'educationalLevel',
    };

    const apiField = filterId ? filterMapping[filterId] : undefined;
    if (apiField) {
      const newFilters: BookFilters = { ...selectedFilters, [apiField]: option };
      setSelectedFilters(newFilters);

      try {
        const results = await searchBooks(newFilters);
        if (onFilterChange) {
          onFilterChange(results, newFilters);
        }
      } catch (error) {
        console.error('Error searching books:', error);
      }
    }

    handleMenuClose();
  };

  const handleDeleteFilter = async (apiField: string) => {
    const newFilters: BookFilters = { ...selectedFilters };
    delete newFilters[apiField as keyof BookFilters];
    setSelectedFilters(newFilters);

    if (onClearSearch) onClearSearch();

    try {
      const results = await searchBooks(newFilters);
      if (onFilterChange) {
        onFilterChange(results, newFilters);
      }
    } catch (error) {
      console.error('Error removing filter:', error);
    }
  };

  const activeFilterData = FILTERS_DATA.find((f) => f.id === activeFilterId);

  return (
    <>
      <Stack direction="row" spacing={1} mb={2} sx={{ overflowX: 'auto' }}>
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