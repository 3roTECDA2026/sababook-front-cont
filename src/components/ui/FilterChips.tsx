// src/components/FilterChips.tsx
import { useState, useEffect, useMemo, MouseEvent } from 'react';
import { Stack, Chip, Menu, MenuItem, Box, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { getCursos } from '@/services/courseService';
import { getCatalogoLibros } from '@/services/apiService';
import type { BookFilters, CourseSummary } from '@/types';

interface FilterOption {
  label: string;
  value: string | number;
}

export type FilterCategoryId = 'year' | 'course' | 'genre' | 'level';

interface FilterCategory {
  id: FilterCategoryId;
  name: string;
  icon?: React.ReactElement;
  getOptions: (
    cursos: CourseSummary[],
    selectedFilters: BookFilters,
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
];

interface FilterChipsProps {
  onFilterChange?: (filtros: BookFilters) => void;
  onClearSearch?: () => void;
  categories?: FilterCategoryId[];
  sx?: SxProps<Theme>;
}

export default function FilterChips({
  onFilterChange,
  onClearSearch,
  categories,
  sx,
}: FilterChipsProps) {
  const [cursos, setCursos] = useState<CourseSummary[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [errorCursos, setErrorCursos] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<BookFilters>({});
  const [dynamicGenres, setDynamicGenres] = useState<string[]>([]);
  const [dynamicLevels, setDynamicLevels] = useState<string[]>([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(true);

  const openMenu = Boolean(anchorEl);

  const filtrosVisibles = useMemo(
    () => (categories ? FILTERS_CONFIG.filter((f) => categories.includes(f.id)) : FILTERS_CONFIG),
    [categories]
  );

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
        setCargandoOpciones(false);
      });

    return () => {
      montado = false;
    };
  }, []);

  // Solo se muestran los cursos del año lectivo vigente (el más reciente),
  // para no mezclar libros asignados en años anteriores.
  const cursosVigentes = useMemo(() => {
    if (cursos.length === 0) return [];
    const anioLectivoVigente = cursos.reduce(
      (max, c) => (c.anio_lectivo > max ? c.anio_lectivo : max),
      Number.NEGATIVE_INFINITY
    );
    return cursos.filter((c) => c.anio_lectivo === anioLectivoVigente);
  }, [cursos]);

  const handleChipClick = (event: MouseEvent<HTMLDivElement>, filterId: string) => {
    setAnchorEl(event.currentTarget);
    setActiveFilterId(filterId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveFilterId(null);
  };

  const aplicarFiltros = (filtros: BookFilters) => {
    if (onFilterChange) {
      onFilterChange(filtros);
    }
  };

  const handleOptionSelect = (filterId: string, option: FilterOption) => {
    const newFilters: BookFilters = { ...selectedFilters };

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
    }

    setSelectedFilters(newFilters);
    handleMenuClose();
    aplicarFiltros(newFilters);
  };

  const handleDeleteFilter = (filterKey: keyof BookFilters) => {
    const newFilters: BookFilters = { ...selectedFilters };
    delete newFilters[filterKey];

    // Si se quita el año y el curso pertenecía a él, también se limpia curso
    if (filterKey === 'anio' && newFilters.curso_id) {
      delete newFilters.curso_id;
    }

    setSelectedFilters(newFilters);
    aplicarFiltros(newFilters);
  };

  const handleLimpiarTodo = () => {
    setSelectedFilters({});
    if (onClearSearch) onClearSearch();
    aplicarFiltros({});
  };

  // Helper para generar texto descriptivo del chip activo
  const obtenerEtiquetaChipActivo = (key: keyof BookFilters, value: unknown): string => {
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
    return `${key}: ${value}`;
  };

  const activeCategory = FILTERS_CONFIG.find((f) => f.id === activeFilterId);
  const currentOptions = activeCategory
    ? activeCategory.getOptions(cursosVigentes, selectedFilters, { genres: dynamicGenres, levels: dynamicLevels })
    : [];

  return (
    <Box sx={[{ mb: 2 }, ...(sx ? [sx] : [])] as SxProps<Theme>}>
      {/* Botones selectores de filtros */}
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
        {filtrosVisibles.map((filter) => {
          const isActive =
            (filter.id === 'year' && selectedFilters.anio !== undefined) ||
            (filter.id === 'course' && selectedFilters.curso_id !== undefined) ||
            (filter.id === 'genre' && Boolean(selectedFilters.genero)) ||
            (filter.id === 'level' && Boolean(selectedFilters.nivel_educativo));

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
            const filterKey = key as keyof BookFilters;
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

      {/* Menú desplegable para opciones del filtro seleccionado */}
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={openMenu}
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
        {cargandoCursos && (activeFilterId === 'year' || activeFilterId === 'course') ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
            Cargando cursos…
          </MenuItem>
        ) : errorCursos && (activeFilterId === 'year' || activeFilterId === 'course') ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'error.main' }}>
            No se pudieron cargar los cursos. Intente nuevamente más tarde.
          </MenuItem>
        ) : cargandoOpciones && (activeFilterId === 'genre' || activeFilterId === 'level') ? (
          <MenuItem disabled sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
            Cargando opciones…
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
}
