// src/components/ui/SearchFilterBar.tsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Select, FormControl, InputLabel, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  placeholder?: string;
  onSearch: (searchTerm: string, filterValue?: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  initialSearch?: string;
  initialFilter?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  placeholder = 'Buscar...',
  onSearch,
  filterOptions = [],
  filterLabel = 'Filtrar por',
  initialSearch = '',
  initialFilter = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);

  // Debounce para retrasar la llamada y optimizar el rendimiento
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm, selectedFilter);
    }, 400); // Espera 400ms después de que el usuario deje de tipear

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, selectedFilter, onSearch]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
        alignItems: 'center',
      }}
    >
      {/* Campo de Texto de Búsqueda */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Selector de Filtro Opcional (Dinámico según la sección) */}
      {filterOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel>{filterLabel}</InputLabel>
          <Select
            value={selectedFilter}
            label={filterLabel}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default SearchFilterBar;