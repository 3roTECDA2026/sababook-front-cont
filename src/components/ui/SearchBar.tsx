// src/components/SearchBar.tsx
import { useState, forwardRef, useImperativeHandle, KeyboardEvent, ChangeEvent } from 'react';
import { InputAdornment, IconButton, styled, OutlinedInput, FormControl } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s, background-color 0.3s',
    padding: '6px 16px',

    '& fieldset': { border: 'none' },

    '& .MuiInputBase-input': {
      padding: 0,
    },

    '&.Mui-focused': {
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      backgroundColor: theme.palette.common.white,
    },
    '&.Mui-focused fieldset': { borderColor: 'transparent' },
  },
  '& input::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
}));

interface SearchBarProps {
  onSearch?: (query: string) => void;
  sx?: SxProps<Theme>;
}

export interface SearchBarHandle {
  clear: () => void;
}

const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(({ onSearch, sx }, ref) => {
  const [query, setQuery] = useState<string>('');

  useImperativeHandle(ref, () => ({
    clear: () => setQuery(''),
  }));

  const handleSearch = () => {
    if (onSearch) onSearch(query);
  };

  // Borra el texto y avisa a la pantalla para que vuelva a su estado inicial
  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Al vaciar el campo se vuelve al estado inicial sin esperar Enter
    if (value.trim() === '' && query.trim() !== '' && onSearch) {
      onSearch('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') handleClear();
  };

  return (
    <StyledFormControl variant="outlined" sx={sx}>
      <OutlinedInput
        placeholder="Buscar por título o autor..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        endAdornment={
          <InputAdornment position="end">
            {query && (
              <IconButton
                aria-label="Borrar búsqueda"
                size="small"
                onClick={handleClear}
                sx={{ mr: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton edge="end" color="primary" aria-label="Buscar" onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </StyledFormControl>
  );
});

export default SearchBar;