// src/components/FilterChips.tsx
import { useState, useEffect, useMemo, forwardRef, useImperativeHandle, MouseEvent } from 'react';
import { Stack, Chip, Menu, MenuItem, Box, Button, Popover, Autocomplete, TextField, CircularProgress } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { getCursos } from '@/services/courseService';
import { buscarLibrosPaginado, getCatalogoLibros } from '@/services/apiService';
import type { Book, CourseSummary, ListFilters, TipoRol } from '@/types';
import type { ReadingStatus } from '@/hooks/useReadingStatus';

interface FilterOption {
  label: string;
  value: string | number;
}

export type FilterCategoryId = 'year' | 'course' | 'genre' | 'level' | 'role' | 'readingStatus' | 'book';

// Sin la prop categories se muestran estas (Home y Trivia). Las de SAB-060 son opcionales.
const DEFAULT_CATEGORIES: FilterCategoryId[] = ['year', 'course', 'genre', 'level'];

// Clave del filtro que maneja cada categoría
const CATEGORY_KEYS: Record<FilterCategoryId, keyof ListFilters> = {
  year: 'anio',
  course: 'curso_id',
  genre: 'genero',
  level: 'nivel_educativo',
  role: 'rol',
  readingStatus: 'estado_lectura',
  book: 'libro_id',
};

const ROLE_LABELS: Record<TipoRol, string> = {
  ALUMNO: 'Alumno',
  DOCENTE: 'Docente',
  ADMINISTRADOR: 'Administrador',
};

const READING_STATUS_LABELS: Record<Exclude<ReadingStatus, 'general'>, string> = {
  'quiero-leer': 'Quiero leer',
  leyendo: 'Leyendo',
  leido: 'Leído',
};

interface FilterCategory {
  id: FilterCategoryId;
  name: string;
  icon?: React.ReactElement;
  getOptions: (
    cursos: CourseSummary[],
    selectedFilters: ListFilters,
    dynamicOptions?: { genres: string[]; levels: string[] }
  ) => FilterOption[];
}

const FILTERS_CONFIG: FilterCategory[] = [
  {
    id: 'year',
    name: 'Año',
    icon: <SchoolIcon fontSize="small" />,
    getOptions: (cursos) => {
      const aniosUnicos = Array.from(new Set(cursos.map((c) => c.anio))).sort((a, b) => a - b);
      return aniosUnicos.map((a) => ({
        label: `${a}° Año`,
        value: a,
      }));
    },
  },
  {
    id: 'course',
    name: 'Curso',
    icon: <ClassIcon fontSize="small" />,
    getOptions: (cursos, selectedFilters) => {
      let cursosFiltrados = cursos;
      if (selectedFilters.anio) {
        cursosFiltrados = cursos.filter((c) => c.anio === Number(selectedFilters.anio));
      }
      return cursosFiltrados.map((c) => ({
        label: `${c.anio}°${c.division} · ${c.materia.nombre}`,
        value: c.curso_id,
      }));
    },
  },
  {
    id: 'genre',
    name: 'Género',
    getOptions: (_cursos, _selectedFilters, dynamicOptions) => {
      const genres = dynamicOptions?.genres ?? [];
      return genres.map((g) => ({ label: g, value: g }));
    },
  },
  {
    id: 'level',
    name: 'Nivel Educativo',
    getOptions: (_cursos, _selectedFilters, dynamicOptions) => {
      const levels = dynamicOptions?.levels ?? [];
      return levels.map((l) => ({ label: l, value: l }));
    },
  },
  // SAB-060
  {
    id: 'role',
    name: 'Rol',
    getOptions: () => Object.entries(ROLE_LABELS).map(([value, label]) => ({ label, value })),
  },
  {
    id: 'readingStatus',
    name: 'Estado de lectura',
    getOptions: () => Object.entries(READING_STATUS_LABELS).map(([value, label]) => ({ label, value })),
  },
  {
    // Son cientos de libros: en lugar de una lista se muestra un buscador (BookPicker)
    id: 'book',
    name: 'Libro',
    getOptions: () => [],
  },
];

// SAB-060: buscador de libros para el chip "Libro"
function BookPicker({ onSelect }: { onSelect: (book: Book) => void }) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const text = inputValue.trim();
    if (!text) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    // Se espera a que termine de escribir y se cancela la búsqueda anterior
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => {
      buscarLibrosPaginado({ query: text }, 1, 10, controller.signal)
        .then((result) => setOptions(result.data))
        .catch((error) => {
          if (controller.signal.aborted) return;
          console.error('Error al buscar libros para el filtro:', error);
          setOptions([]);
          setHasError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inputValue]);

  const noOptionsText = hasError
    ? 'No se pudieron buscar los libros. Intente nuevamente más tarde.'
    : inputValue.trim()
      ? 'No se encontraron libros'
      : 'Escribí el título o el autor';

  return (
    <Autocomplete
      options={options}
      // Las opciones ya vienen filtradas por el back
      filterOptions={(x) => x}
      getOptionLabel={(book) => `${book.titulo} · ${book.autor}`}
      isOptionEqualToValue={(a, b) => a.libro_id === b.libro_id}
      inputValue={inputValue}
      onInputChange={(_event, value) => setInputValue(value)}
      onChange={(_event, book) => book && onSelect(book)}
      loading={isLoading}
      loadingText="Buscando…"
      noOptionsText={noOptionsText}
      openOnFocus
      sx={{ width: 320, maxWidth: '80vw' }}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          size="small"
          label="Buscar libro"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

interface FilterChipsProps {
  onFilterChange?: (filtros: ListFilters) => void;
  onClearSearch?: () => void;
  categories?: FilterCategoryId[];
  // SAB-060: emite también anio_lectivo (el vigente) cuando se elige un año
  includeSchoolYear?: boolean;
  sx?: SxProps<Theme>;
}

export interface FilterChipsHandle {
  clear: () => void;
}

const FilterChips = forwardRef<FilterChipsHandle, FilterChipsProps>(function FilterChips(
  { onFilterChange, onClearSearch, categories, includeSchoolYear = false, sx },
  ref
) {
  const [cursos, setCursos] = useState<CourseSummary[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [errorCursos, setErrorCursos] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<FilterCategoryId | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<ListFilters>({});
  // Título del libro elegido, para la etiqueta del chip activo
  const [selectedBookTitle, setSelectedBookTitle] = useState<string | null>(null);

  // Permite que la pantalla vacíe los chips sin volver a disparar onFilterChange
  useImperativeHandle(ref, () => ({
    clear: () => {
      setSelectedFilters({});
      setSelectedBookTitle(null);
    },
  }));
  const [dynamicGenres, setDynamicGenres] = useState<string[]>([]);
  const [dynamicLevels, setDynamicLevels] = useState<string[]>([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(true);
  const [errorOpciones, setErrorOpciones] = useState(false);

  const filtrosVisibles = useMemo(() => {
    const ids = categories ?? DEFAULT_CATEGORIES;
    return FILTERS_CONFIG.filter((f) => ids.includes(f.id));
  }, [categories]);

  // Género y Nivel salen del catálogo: solo se pide si se muestra alguno de los dos
  const needsCatalogOptions = filtrosVisibles.some((f) => f.id === 'genre' || f.id === 'level');

  useEffect(() => {
    let montado = true;
    getCursos(false)
      .then((data) => {
        if (!montado) return;
        if (Array.isArray(data)) {
          setCursos(data);
        }
        setCargandoCursos(false);
      })
      .catch((error) => {
        console.error('Error al cargar cursos para filtros:', error);
        if (!montado) return;
        setErrorCursos(true);
        setCargandoCursos(false);
      });

    return () => {
      montado = false;
    };
  }, []);

  useEffect(() => {
    if (!needsCatalogOptions) return;
    let montado = true;
    getCatalogoLibros()
      .then((libros) => {
        if (!montado) return;
        if (Array.isArray(libros)) {
          const generos = Array.from(
            new Set(
              libros
                .map((libro) => libro.genero)
                .filter((genero): genero is string => typeof genero === 'string' && genero.trim() !== '')
            )
          ).sort((a, b) => a.localeCompare(b));

          const niveles = Array.from(
            new Set(
              libros
                .map((libro) => libro.nivel_educativo)
                .filter((nivel): nivel is string => typeof nivel === 'string' && nivel.trim() !== '')
            )
          ).sort((a, b) => a.localeCompare(b));

          setDynamicGenres(generos);
          setDynamicLevels(niveles);
        }
        setCargandoOpciones(false);
      })
      .catch((error) => {
        console.error('Error al cargar opciones de filtros:', error);
        if (!montado) return;
        setErrorOpciones(true);
        setCargandoOpciones(false);
      });

    return () => {
      montado = false;
    };
  }, [needsCatalogOptions]);

  // Solo se muestran los cursos del año lectivo vigente (el más reciente),
  // para no mezclar libros asignados en años anteriores.
  const anioLectivoVigente = useMemo(
    () => (cursos.length === 0 ? null : Math.max(...cursos.map((c) => c.anio_lectivo))),
    [cursos]
  );
  const cursosVigentes = useMemo(
    () => cursos.filter((c) => c.anio_lectivo === anioLectivoVigente),
    [cursos, anioLectivoVigente]
  );

  const handleChipClick = (event: MouseEvent<HTMLDivElement>, filterId: FilterCategoryId) => {
    setAnchorEl(event.currentTarget);
    setActiveFilterId(filterId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveFilterId(null);
  };

  const aplicarFiltros = (filtros: ListFilters) => {
    if (!onFilterChange) return;
    if (includeSchoolYear && filtros.anio !== undefined && anioLectivoVigente !== null) {
      onFilterChange({ ...filtros, anio_lectivo: anioLectivoVigente });
      return;
    }
    onFilterChange(filtros);
  };

  const handleOptionSelect = (filterId: FilterCategoryId, option: FilterOption) => {
    const newFilters: ListFilters = { ...selectedFilters };

    if (filterId === 'year') {
      newFilters.anio = option.value;
      // Si el curso actual no coincide con el año elegido, resetearlo
      if (newFilters.curso_id) {
        const cursoActual = cursosVigentes.find((c) => c.curso_id === Number(newFilters.curso_id));
        if (cursoActual && cursoActual.anio !== Number(option.value)) {
          delete newFilters.curso_id;
        }
      }
    } else if (filterId === 'course') {
      newFilters.curso_id = option.value;
      // Sincronizar año si no estaba definido o era distinto
      const cursoElegido = cursosVigentes.find((c) => c.curso_id === Number(option.value));
      if (cursoElegido) {
        newFilters.anio = cursoElegido.anio;
      }
    } else if (filterId === 'genre') {
      newFilters.genero = String(option.value);
    } else if (filterId === 'level') {
      newFilters.nivel_educativo = String(option.value);
    } else if (filterId === 'role') {
      newFilters.rol = option.value as TipoRol;
    } else if (filterId === 'readingStatus') {
      newFilters.estado_lectura = option.value as ReadingStatus;
    }

    setSelectedFilters(newFilters);
    handleMenuClose();
    aplicarFiltros(newFilters);
  };

  const handleBookSelect = (book: Book) => {
    const newFilters: ListFilters = { ...selectedFilters, libro_id: book.libro_id };
    setSelectedBookTitle(book.titulo);
    setSelectedFilters(newFilters);
    handleMenuClose();
    aplicarFiltros(newFilters);
  };

  const handleDeleteFilter = (filterKey: keyof ListFilters) => {
    const newFilters: ListFilters = { ...selectedFilters };
    delete newFilters[filterKey];

    // Si se quita el año y el curso pertenecía a él, también se limpia curso
    if (filterKey === 'anio' && newFilters.curso_id) {
      delete newFilters.curso_id;
    }
    if (filterKey === 'libro_id') {
      setSelectedBookTitle(null);
    }

    setSelectedFilters(newFilters);
    aplicarFiltros(newFilters);
  };

  const handleLimpiarTodo = () => {
    setSelectedFilters({});
    setSelectedBookTitle(null);
    if (onClearSearch) onClearSearch();
    aplicarFiltros({});
  };

  // Helper para generar texto descriptivo del chip activo
  const obtenerEtiquetaChipActivo = (key: keyof ListFilters, value: unknown): string => {
    if (key === 'anio') {
      return `Año: ${value}° Año`;
    }
    if (key === 'curso_id') {
      const curso = cursosVigentes.find((c) => c.curso_id === Number(value));
      return curso ? `Curso: ${curso.anio}°${curso.division} (${curso.materia.nombre})` : `Curso #${value}`;
    }
    if (key === 'genero') {
      return `Género: ${value}`;
    }
    if (key === 'nivel_educativo') {
      return `Nivel: ${value}`;
    }
    if (key === 'rol') {
      return `Rol: ${ROLE_LABELS[value as TipoRol] ?? value}`;
    }
    if (key === 'estado_lectura') {
      return `Estado: ${READING_STATUS_LABELS[value as keyof typeof READING_STATUS_LABELS] ?? value}`;
    }
    if (key === 'libro_id') {
      return selectedBookTitle ? `Libro: ${selectedBookTitle}` : `Libro #${value}`;
    }
    return `${key}: ${value}`;
  };

  const activeCategory = FILTERS_CONFIG.find((f) => f.id === activeFilterId);
  const currentOptions = activeCategory
    ? activeCategory.getOptions(cursosVigentes, selectedFilters, { genres: dynamicGenres, levels: dynamicLevels })
    : [];
  const isCourseCategory = activeFilterId === 'year' || activeFilterId === 'course';
  const isCatalogCategory = activeFilterId === 'genre' || activeFilterId === 'level';

  return (
    <Box sx={[{ mb: 2 }, ...(sx ? [sx] : [])] as SxProps<Theme>}>
      {/* Botones selectores de filtros */}
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
        {filtrosVisibles.map((filter) => {
          const value = selectedFilters[CATEGORY_KEYS[filter.id]];
          const isActive = value !== undefined && value !== '';

          return (
            <Chip
              key={filter.id}
              icon={filter.icon}
              label={filter.name}
              onClick={(e) => handleChipClick(e, filter.id)}
              aria-controls={activeFilterId === filter.id ? 'filter-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={activeFilterId === filter.id ? 'true' : undefined}
              color={isActive ? 'primary' : 'default'}
              variant={isActive ? 'filled' : 'outlined'}
              sx={{
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                borderColor: isActive ? '#f25600' : undefined,
                bgcolor: isActive ? '#f25600' : undefined,
                color: isActive ? '#fff' : undefined,
                '&:hover': {
                  borderColor: '#f25600',
                },
              }}
            />
          );
        })}
      </Stack>

      {/* Chips de filtros seleccionados actualmente */}
      {Object.keys(selectedFilters).length > 0 && (
        <Stack direction="row" spacing={1} mt={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
          {Object.entries(selectedFilters).map(([key, val]) => {
            if (val === undefined || val === '') return null;
            const filterKey = key as keyof ListFilters;
            return (
              <Chip
                key={key}
                label={obtenerEtiquetaChipActivo(filterKey, val)}
                onDelete={() => handleDeleteFilter(filterKey)}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#f25600',
                  color: '#f25600',
                  fontWeight: 600,
                  bgcolor: 'rgba(242, 86, 0, 0.06)',
                }}
              />
            );
          })}

          <Button
            size="small"
            startIcon={<FilterAltOffIcon fontSize="small" />}
            onClick={handleLimpiarTodo}
            sx={{
              textTransform: 'none',
              fontSize: '0.8rem',
              color: 'text.secondary',
              '&:hover': {
                color: '#f25600',
                bgcolor: 'transparent',
              },
            }}
          >
            Limpiar filtros
          </Button>
        </Stack>
      )}

      {/* Buscador para el chip "Libro" */}
      <Popover
        open={Boolean(anchorEl) && activeFilterId === 'book'}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        <BookPicker onSelect={handleBookSelect} />
      </Popover>

      {/* Menú desplegable para opciones del filtro seleccionado */}
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && activeFilterId !== 'book'}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 320,
              minWidth: 180,
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        {cargandoCursos && isCourseCategory ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
            Cargando cursos…
          </MenuItem>
        ) : errorCursos && isCourseCategory ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'error.main' }}>
            No se pudieron cargar los cursos. Intente nuevamente más tarde.
          </MenuItem>
        ) : cargandoOpciones && isCatalogCategory ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
            Cargando opciones…
          </MenuItem>
        ) : errorOpciones && isCatalogCategory ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'error.main' }}>
            No se pudieron cargar las opciones. Intente nuevamente más tarde.
          </MenuItem>
        ) : currentOptions.length === 0 ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
            {activeFilterId === 'course' && selectedFilters.anio
              ? `No hay cursos cargados para ${selectedFilters.anio}° Año`
              : 'No hay opciones disponibles'}
          </MenuItem>
        ) : (
          currentOptions.map((opt) => (
            <MenuItem
              key={String(opt.value)}
              onClick={() => activeFilterId && handleOptionSelect(activeFilterId, opt)}
              sx={{
                fontSize: '0.9rem',
                py: 1,
                '&:hover': {
                  bgcolor: 'rgba(242, 86, 0, 0.08)',
                  color: '#f25600',
                },
              }}
            >
              {opt.label}
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
});

export default FilterChips;
