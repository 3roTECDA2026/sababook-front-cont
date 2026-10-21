# agent.md — sababook-front-cont

Guía para agentes de IA y desarrolladores que trabajan en este repositorio.
Resume cómo está armado el frontend, sus convenciones y las reglas a respetar.

---

## 1. Qué es

Aplicación web de **La Gran Ocasión / Sababook**, plataforma de la Biblioteca Julio Cortázar
(Escuela Nacional "Ernesto Sábato") para fomentar la lectura entre alumnos y docentes.
Diseño **Mobile First**. Consume la API REST del repositorio `sababook-back-cont`
(Express + Prisma + Supabase).

Pantallas principales: inicio y catálogo, detalle de libro, favoritos y estados de lectura,
perfil, foros, Café Literario, Radio Sábato, muro, insignias, trivia y evaluaciones,
libros por curso, panel docente y dashboard de administración.

## 2. Stack

| Componente | Tecnología |
| --- | --- |
| UI | React 19 |
| Lenguaje | TypeScript 5.4 (`strict: true`) |
| Bundler | Vite 7 (`vite-tsconfig-paths` para el alias `@/`) |
| Componentes | Material UI 7 (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`) + Emotion |
| Ruteo | React Router 7 |
| Deploy | Netlify (`public/_redirects` redirige todo a `index.html` para la SPA) |

No se usan otras librerías de UI, gráficos ni estado global. Antes de agregar una dependencia,
verificar si MUI ya lo resuelve.

## 3. Comandos

```bash
npm install
npm run dev              # http://localhost:5173
npx tsc --noEmit -p .    # chequeo de tipos — correrlo antes de cada commit
npm run build            # build de producción en dist/
npm run preview          # sirve el build
```

`npm run lint` hoy solo revisa archivos `.js/.jsx` (la config de ESLint no incluye `.tsx`),
así que la verificación real es `tsc` + `build`. No hay tests automatizados.

## 4. Variables de entorno

Se leen con `import.meta.env` y deben empezar con `VITE_`. Plantilla: `.env.example`.

| Variable | Uso |
| --- | --- |
| `VITE_API_BASE_URL` | URL base del back **sin** `/api/v1` (ej. `http://localhost:3000`). La exporta `src/environments/api.ts` como `API_BASE_URL`; si no está, usa `http://localhost:3000`. |
| `VITE_API_URL` | Solo la usa `services/radio.service.ts` (legacy). Para código nuevo usar `API_BASE_URL`. |

Todo lo que empieza con `VITE_` queda **público** en el bundle: nunca poner secretos ahí.

## 5. Estructura

```
index.html                 # <html lang="es"> (evita que el navegador "traduzca" la app)
public/_redirects          # regla SPA de Netlify
src/
  main.tsx                 # BrowserRouter > AuthProvider > ThemeProvider > NotificationProvider
  App.tsx                  # todas las rutas
  pages/                   # una pantalla por archivo (TeacherPanelPage, CourseBooksPage...)
  components/
    ui/                    # componentes reutilizables (StatCard, StyledCard, StyledTable, RankingBar...)
    layout/                # AppHeader, SideMenu, HeaderDashboard...
    forms/                 # formularios
    tables/                # tablas de administración
    teacherPanel/          # componentes específicos de una pantalla
    ProtectedRoute.tsx, RoleGuard.tsx
  hooks/                   # lógica de datos por pantalla/recurso (useTeacherPanel, useFavorites...)
  services/                # llamadas HTTP agrupadas (apiService, courseService)
  contexts/                # AuthContext, NotificationContext
  types/                   # tipos de la API; todo se reexporta desde types/index.ts
  utils/                   # formatDate, downloadCsv, course...
  theme/theme.ts           # tema de MUI y colores de marca
  styles/                  # index.css global y CSS modules (trivia.module.css)
  environments/api.ts      # API_BASE_URL
```

Imports con alias: `import X from '@/components/ui/X'` (configurado en `tsconfig.json` y Vite).

## 6. Cómo se organiza una pantalla

Patrón a seguir para código nuevo (ver `TeacherPanelPage` como referencia):

1. **Tipos** en `src/types/<recurso>.ts` y exportados desde `types/index.ts`.
2. **Servicio** en `src/services/`: funciones que llaman a la API. `courseService.ts` tiene
   un helper `solicitud()` que agrega el token y devuelve el mensaje de error real del back.
3. **Hook** en `src/hooks/use<Recurso>.ts`: estado de carga, error, datos y acciones.
   Debe evitar que una respuesta vieja pise a una nueva (flag `cancelado` o `AbortController`).
4. **Página** en `src/pages/`: arma la pantalla con `AppHeader` + `SideMenu` y componentes.
5. Si la página crece, separar secciones en `src/components/<pantalla>/`.

Muchos hooks viejos hacen `fetch` directo. Para código nuevo, centralizar las llamadas en un servicio.

## 7. Componentes y estilos

- **Reutilizar antes de crear.** Revisar `components/ui` y `components/layout`:
  - `AppHeader` (título, subtítulo, flecha atrás; acepta `onBack`), `SideMenu` (prop `active` = texto del ítem).
  - `StyledCard`, `StyledTable` (`StyledTableContainer`, `StyledTableCellHeader`), `StatCard`, `RankingBar`.
  - `ConfirmationModal`, `PaginationControls`, `ActionButton` / `DeleteButton`.
  - Utilidades: `formatDate` / `formatDateTime` (`utils/formatDate.ts`), `downloadCsv`.
- Si se crea un componente reutilizable, que sea genérico (props, sin lógica de una pantalla)
  y va en `components/ui`.
- **Colores del tema, no valores fijos:** `theme.palette.button.main` (naranja de marca,
  `BUTTON_ORANGE`), `theme.palette.primary.main`, `theme.palette.body.main`.
  Las constantes están en `theme/theme.ts`.
- El tema fuerza un estilo común para todos los `Button` (`unifiedButtonOverrides`);
  pisarlo requiere `!important`. Si se hace, dejar un comentario explicando por qué.
- Estilos con `sx` de MUI o `styled()`. Evitar `style={{}}` en línea y no mezclarlo con CSS modules.
- Avisos y errores: `Alert` de MUI (con `action` si hay botón) o `useNotification()` / `Snackbar`.
- Cuidar los estados de cada pantalla: **cargando**, **vacío**, **error** (sin mostrar datos viejos
  como si fueran actuales) y **datos**.
- En JSX, armar textos que mezclan variables y palabras en un solo string
  (`{`${n} días`}`) para que no se rompan si el navegador traduce la página.

## 8. Autenticación y roles

- `AuthContext` guarda `token`, `user`, `userId`, `rol` y `username` en `localStorage`.
- Leer la sesión con `useAuth()`: `user`, `token`, `loading`, `isAuthenticated`,
  `isAdmin`, `isTeacher`, `isStudent`, `hasRole(rol)`, `login`, `logout`, `updateUser`.
- Roles: `'ADMINISTRADOR' | 'DOCENTE' | 'ALUMNO'` (tipo `TipoRol`).
- Rutas protegidas en `App.tsx`:
  - `<ProtectedRoute>`: requiere sesión.
  - `<RoleGuard allowedRoles={['DOCENTE', 'ADMINISTRADOR']}>`: requiere rol.
- Las peticiones autenticadas mandan `Authorization: Bearer <token>`.
- **El front solo oculta**: los permisos reales los valida el back. Nunca confiar en un
  chequeo del front como única protección.
- Si una pantalla depende del rol, esperar a que `loading` sea `false` antes de pedir datos.

## 9. Agregar una pantalla nueva

1. Crear la página en `src/pages/`.
2. Agregar la ruta en `App.tsx` (antes de la ruta `*` del 404), con `ProtectedRoute` o `RoleGuard`.
3. Agregar el ítem en `SideMenu.tsx` en el/los menús que correspondan (admin, docente, alumno).
   El `text` del ítem debe coincidir con el `active` que pasa la página.
4. Si consume un endpoint nuevo, coordinar con el back el contrato y el orden de merge.

## 10. Git y Pull Requests

- Ramas desde `develop`: `SAB-XXX-descripcion-en-kebab-case`, `feature/...` o `fix/SAB-XXX-...`.
  Usar el mismo nombre que la rama del back cuando la tarea tiene las dos partes.
- Commits en español con formato *conventional commits*:
  `feat(area): ...`, `fix(area): ...`, `refactor(area): ...`, `feat(ui): ...` para componentes compartidos.
- No commitear `dist/` ni `.env` (`package-lock.json` está en el `.gitignore` de este repo).
- PRs contra `develop`, mergeados con **"Create a merge commit"**.
- Separar en commits distintos los cambios de formato y los de funcionalidad, para que el PR se pueda revisar.
- Si el PR depende de un PR del back, indicarlo y mergear primero el back (salvo que el front
  sea compatible con la versión actual de la API).

## 11. Checklist antes de abrir un PR

- [ ] `npx tsc --noEmit -p .` sin errores y `npm run build` compila.
- [ ] Probado en el navegador con el back local, con los roles que correspondan.
- [ ] Estados de carga, vacío y error contemplados.
- [ ] Se reutilizaron componentes de `components/ui` y colores del tema.
- [ ] Las llamadas a la API usan `API_BASE_URL` y mandan el token cuando hace falta.
- [ ] Sin `console.log` de depuración, código comentado ni archivos ajenos a la tarea.
