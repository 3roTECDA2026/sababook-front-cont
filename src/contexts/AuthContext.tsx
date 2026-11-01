
// src/contexts/AuthContext.tsx

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE_URL } from '@/environments/api';
import {
  AuthContext,
  AuthContextType,
  AuthResult,
} from './AuthContextDefinition';
import { useNavigate } from 'react-router-dom';
import type { User, TipoRol } from '@/types';
import { parseJsonResponse } from '@/utils/api';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { SESSION_EXPIRED_EVENT } from '@/utils/fetchInterceptor';

// =====================================================
// MENSAJES
// =====================================================

const MENSAJE_CREDENCIALES =
  'El correo o la contraseña no coinciden.';

const MENSAJE_CONEXION =
  'No pudimos conectar con el servidor. Inténtalo en un momento.';

const MENSAJE_EXPIRACION =
  'Tu sesión expiró. Volvé a iniciar sesión.';

// =====================================================
// TIPOS
// =====================================================

interface AuthProviderProps {
  children: ReactNode;
}

interface JwtPayload {
  exp?: number;
}

// =====================================================
// UTILIDADES JWT
// =====================================================

// Obtener la fecha de vencimiento del token.
const obtenerExpiracion = (token: string): number | null => {
  try {
    const partes = token.split('.');

    if (partes.length !== 3) {
      return null;
    }

    const base64 = partes[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const payload = JSON.parse(atob(base64)) as JwtPayload;

    return typeof payload.exp === 'number'
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
};

// Comprobar si el JWT venció.
const tokenExpirado = (token: string): boolean => {
  const expiracion = obtenerExpiracion(token);

  return expiracion === null || Date.now() >= expiracion;
};

// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  // SAB-121: controla la notificación de sesión expirada.
  const [avisoExpiracion, setAvisoExpiracion] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // LIMPIAR SESIÓN
  // =====================================================

  const limpiarSesion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');

    setUser(null);
    setToken(null);
  }, []);

  // =====================================================
  // CIERRE DE SESIÓN MANUAL
  // =====================================================

  const logout = useCallback((): void => {
    limpiarSesion();
    setAvisoExpiracion(false);

    navigate('/login', { replace: true });
  }, [limpiarSesion, navigate]);

  // =====================================================
  // SAB-121: CIERRE POR TOKEN EXPIRADO
  // =====================================================

  const cerrarSesionExpirada = useCallback(() => {
    const tokenActual = localStorage.getItem('token');

    if (!tokenActual) {
      return;
    }

    limpiarSesion();

    setLoading(false);
    setAvisoExpiracion(true);

    navigate('/login', { replace: true });
  }, [limpiarSesion, navigate]);

  // =====================================================
  // SAB-121: ESCUCHAR ERRORES 401 DEL INTERCEPTOR
  // =====================================================

  useEffect(() => {
    const manejar401 = () => {
      cerrarSesionExpirada();
    };

    window.addEventListener(
      SESSION_EXPIRED_EVENT,
      manejar401
    );

    return () => {
      window.removeEventListener(
        SESSION_EXPIRED_EVENT,
        manejar401
      );
    };
  }, [cerrarSesionExpirada]);

  // =====================================================
  // SAB-121: COMPROBAR VENCIMIENTO AUTOMÁTICAMENTE
  // =====================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    const expiracion = obtenerExpiracion(token);

    if (expiracion === null || expiracion <= Date.now()) {
      cerrarSesionExpirada();
      return;
    }

    const comprobarExpiracion = () => {
      if (tokenExpirado(token)) {
        cerrarSesionExpirada();
      }
    };

    const tiempoRestante = expiracion - Date.now();

    const temporizador = window.setTimeout(
      comprobarExpiracion,
      Math.min(tiempoRestante, 2147483647)
    );

    // Comprobar vencimiento al regresar a la pestaña.
    const alVolverAPestana = () => {
      if (document.visibilityState === 'visible') {
        comprobarExpiracion();
      }
    };

    document.addEventListener(
      'visibilitychange',
      alVolverAPestana
    );

    window.addEventListener(
      'focus',
      comprobarExpiracion
    );

    return () => {
      window.clearTimeout(temporizador);

      document.removeEventListener(
        'visibilitychange',
        alVolverAPestana
      );

      window.removeEventListener(
        'focus',
        comprobarExpiracion
      );
    };
  }, [token, cerrarSesionExpirada]);

  // =====================================================
  // RECUPERAR SESIÓN AL ABRIR LA APLICACIÓN
  // =====================================================

  useEffect(() => {
    const controller = new AbortController();
    let activo = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');

      if (!storedToken || !storedUserId) {
        if (activo) {
          setLoading(false);
        }

        return;
      }

      // SAB-121: no recuperar sesiones vencidas.
      if (tokenExpirado(storedToken)) {
        cerrarSesionExpirada();
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/users/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          }
        );

        if (!activo) {
          return;
        }

        if (response.ok) {
          const userData = await parseJsonResponse<User>(response);

          if (userData && !tokenExpirado(storedToken)) {
            const numericUserId = Number(
              userData.usuario_id || storedUserId
            );

            setToken(storedToken);

            setUser({
              ...userData,
              usuario_id: numericUserId,
              userId: String(numericUserId),
              rol: userData.rol,
            });
          } else if (tokenExpirado(storedToken)) {
            cerrarSesionExpirada();
          }
        } else if (response.status === 401) {
          cerrarSesionExpirada();
        } else {
          console.warn(
            'No se pudieron recuperar los datos del usuario:',
            response.status
          );
        }
      } catch (error) {
        if (
          (error as { name?: string })?.name === 'AbortError'
        ) {
          return;
        }

        console.error(
          'Error al cargar datos del usuario:',
          error
        );

        if (tokenExpirado(storedToken)) {
          cerrarSesionExpirada();
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [cerrarSesionExpirada]);

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    let response: Response;

    try {
      response = await fetch(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            contrasena: password,
          }),
        }
      );
    } catch (error) {
      console.error(
        'No se pudo conectar con el servidor:',
        error
      );

      return {
        success: false,
        errorType: 'conexion',
        error: MENSAJE_CONEXION,
      };
    }

    // El login incorrecto conserva su propio mensaje.
    if (
      response.status === 400 ||
      response.status === 401
    ) {
      return {
        success: false,
        errorType: 'credenciales',
        error: MENSAJE_CREDENCIALES,
      };
    }

    try {
      const data = await parseJsonResponse<{
        token: string;
        userId: number;
        rol?: TipoRol;
        user: User;
      }>(response);

      if (!response.ok) {
        throw new Error(
          `Error en el servidor (${response.status})`
        );
      }

      if (
        !data?.token ||
        !data?.userId ||
        !data?.user
      ) {
        throw new Error(
          'Respuesta de autenticación incompleta.'
        );
      }

      if (tokenExpirado(data.token)) {
        throw new Error(
          'El servidor devolvió un token inválido.'
        );
      }

      // Guardar sesión.
      localStorage.setItem('token', data.token);
      localStorage.setItem(
        'userId',
        String(data.userId)
      );

      if (data.rol) {
        localStorage.setItem(
          'rol',
          String(data.rol)
        );
      }

      const fullUser = data.user;

      if (fullUser.nombre) {
        localStorage.setItem(
          'username',
          fullUser.nombre
        );
      }

      const numericUserId = Number(
        fullUser.usuario_id || data.userId
      );

      setToken(data.token);
      setAvisoExpiracion(false);

      setUser({
        ...fullUser,
        usuario_id: numericUserId,
        userId: String(numericUserId),
        rol: fullUser.rol || data.rol,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        'Error al iniciar sesión:',
        error
      );

      return {
        success: false,
        errorType: 'conexion',
        error: MENSAJE_CONEXION,
      };
    }
  };

  // =====================================================
  // ACTUALIZAR USUARIO
  // =====================================================

  const updateUser = async (
    updatedData: Partial<User>
  ): Promise<AuthResult> => {
    try {
      const userId = localStorage.getItem('userId');

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const userData = await parseJsonResponse<
        Partial<User> & { error?: string }
      >(response);

      if (response.status === 401) {
        cerrarSesionExpirada();

        return {
          success: false,
          error: MENSAJE_EXPIRACION,
        };
      }

      if (response.ok && userData) {
        setUser((prevUser) =>
          prevUser
            ? {
                ...prevUser,
                ...userData,
              }
            : (userData as User)
        );

        if (userData.nombre) {
          localStorage.setItem(
            'username',
            userData.nombre
          );
        }

        return {
          success: true,
        };
      }

      throw new Error(
        userData?.error ||
          'Error al actualizar el usuario'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        'Error al actualizar usuario:',
        error
      );

      return {
        success: false,
        error: message,
      };
    }
  };

  // =====================================================
  // ROLES
  // =====================================================

  const roleName = String(
    user?.rol || ''
  ).toUpperCase().trim();

  const isAdmin =
    roleName === 'ADMINISTRADOR';

  const isTeacher =
    roleName === 'DOCENTE';

  const isStudent =
    roleName === 'ALUMNO';

  const hasRole = (role: TipoRol): boolean => {
    if (role === 'ADMINISTRADOR') {
      return isAdmin;
    }

    if (role === 'DOCENTE') {
      return isTeacher;
    }

    if (role === 'ALUMNO') {
      return isStudent;
    }

    return false;
  };

  // =====================================================
  // CONTEXTO
  // =====================================================

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAdmin,
    isTeacher,
    isStudent,
    hasRole,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  // =====================================================
  // PROVIDER + NOTIFICACIÓN SAB-121
  // =====================================================

  return (
    <AuthContext.Provider value={value}>
      {children}

      <Snackbar
        open={avisoExpiracion}
        autoHideDuration={10000}
        onClose={() => setAvisoExpiracion(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 2,
          mr: 2,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <Alert
          severity="info"
          variant="standard"
          icon={<AccessTimeRoundedIcon />}
          onClose={() => setAvisoExpiracion(false)}
          sx={{
            width: '100%',
            minWidth: {
              xs: 280,
              sm: 360,
            },
            maxWidth: 420,
            borderRadius: 3,
            boxShadow:
              '0 8px 30px rgba(0,0,0,0.16)',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary',
            alignItems: 'center',

            '& .MuiAlert-icon': {
              color: 'primary.main',
            },

            '& .MuiAlert-message': {
              py: 0.5,
            },
          }}
        >
          <AlertTitle
            sx={{
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            Sesión finalizada
          </AlertTitle>

          {MENSAJE_EXPIRACION}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};
