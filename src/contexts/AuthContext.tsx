// src/contexts/AuthContext.tsx
import { useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE_URL } from '@/environments/api';
import { AuthContext, AuthContextType, AuthResult } from './AuthContextDefinition';
import { useNavigate } from 'react-router-dom';
import type { User, TipoRol } from '@/types';
import { parseJsonResponse } from '@/utils/api';

// Mensajes del login: los define el front para no depender del texto que manda el back
const MENSAJE_CREDENCIALES = 'El correo o la contraseña no coinciden.';
const MENSAJE_CONEXION = 'No pudimos conectar con el servidor. Inténtalo en un momento.';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const logout = useCallback((): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("rol");
    localStorage.removeItem("username");
    setUser(null);
    setToken(null);
    navigate("/login");
  }, [navigate]);

  // Cargar usuario desde localStorage al iniciar la aplicación
  useEffect(() => {
    const controller = new AbortController();

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      if (storedToken && storedUserId) {
        setToken(storedToken);
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/users/${storedUserId}`,
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            },
          );

          if (response.ok) {
            const userData = await parseJsonResponse(response);
            if (userData) {
              const numericUserId = Number(userData.usuario_id || storedUserId);
              setUser({
                ...userData,
                usuario_id: numericUserId,
                userId: String(numericUserId),
                rol: userData.rol,
              });
            }
          } else {
            logout();
          }
        } catch (error) {
          if ((error as { name?: string })?.name === 'AbortError') return;
          console.error("Error al cargar datos del usuario:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
    return () => controller.abort();
  }, [logout]);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    let response: Response;

    // Si el fetch falla, el servidor no respondió (caído o sin conexión)
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contrasena: password }),
      });
    } catch (error) {
      console.error("No se pudo conectar con el servidor:", error);
      return { success: false, errorType: 'conexion', error: MENSAJE_CONEXION };
    }

    // 400 o 401: el correo o la contraseña no son correctos
    if (response.status === 400 || response.status === 401) {
      return { success: false, errorType: 'credenciales', error: MENSAJE_CREDENCIALES };
    }

    try {
      const data = await parseJsonResponse(response);

      // Cualquier otro error (por ejemplo un 500) se informa como problema del servidor
      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status})`);
      }

      if (!data?.token || !data?.userId || !data?.user) {
        throw new Error("Respuesta de autenticación incompleta.");
      }

      // Guardar datos en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.userId));
      if (data.rol) {
        localStorage.setItem("rol", String(data.rol));
      }
      setToken(data.token);

      const fullUser = data.user;

      if (fullUser.nombre) {
        localStorage.setItem("username", fullUser.nombre);
      }

      const numericUserId = Number(fullUser.usuario_id || data.userId);

      setUser({
        ...fullUser,
        usuario_id: numericUserId,
        userId: String(numericUserId),
        rol: fullUser.rol || data.rol,
      });

      return { success: true };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return { success: false, errorType: 'conexion', error: MENSAJE_CONEXION };
    }
  };

  const updateUser = async (
    updatedData: Partial<User>,
  ): Promise<AuthResult> => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const userData = await parseJsonResponse(response);

      if (response.ok && userData) {
        setUser((prevUser) =>
          prevUser ? { ...prevUser, ...userData } : userData,
        );
        if (userData.nombre) {
          localStorage.setItem("username", userData.nombre);
        }
        return { success: true };
      } else {
        const errorMsg = userData?.error || "Error al actualizar el usuario";
        throw new Error(errorMsg);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error al actualizar usuario:", error);
      return { success: false, error: message };
    }
  };

  const roleName = String(user?.rol || '').toUpperCase().trim();
  const isAdmin = roleName === 'ADMINISTRADOR';
  const isTeacher = roleName === 'DOCENTE';
  const isStudent = roleName === 'ALUMNO';

  const hasRole = (role: TipoRol): boolean => {
    if (role === 'ADMINISTRADOR') return isAdmin;
    if (role === 'DOCENTE') return isTeacher;
    if (role === 'ALUMNO') return isStudent;
    return false;
  };

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};