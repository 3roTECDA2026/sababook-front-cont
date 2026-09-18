// src/contexts/AuthContext.tsx
import { useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE_URL } from '../environments/api';
import { AuthContext, AuthContextType, AuthResult } from './AuthContextDefinition';
import type { User } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

// Función auxiliar para parsear JSON de forma segura
const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback((): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    setUser(null);
    setToken(null);
  }, []);

  // Cargar usuario desde localStorage al iniciar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');

      if (storedToken && storedUserId) {
        setToken(storedToken);
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/user/${storedUserId}`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await parseJsonResponse(response);
            if (userData) {
              setUser({
                ...userData,
                userId: storedUserId,
                rol: localStorage.getItem('rol'),
              });
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena: password }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Error en el servidor (${response.status})`;
        throw new Error(errorMsg);
      }

      if (!data?.token || !data?.userId) {
        throw new Error('Respuesta de autenticación incompleta.');
      }

      // Guardar datos en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('rol', data.rol);
      setToken(data.token);

      // Obtener el perfil completo del usuario
      const profileResponse = await fetch(`${API_BASE_URL}/api/v1/user/${data.userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
      });

      const profileData = await parseJsonResponse(profileResponse);

      if (!profileResponse.ok) {
        const profileError = profileData?.error || 'No se pudo obtener el perfil del usuario';
        throw new Error(profileError);
      }

      if (profileData?.nombre) {
        localStorage.setItem('username', profileData.nombre);
      }

      setUser({
        ...profileData,
        userId: data.userId,
        rol: data.rol,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const errorMessage = message.includes('Failed to fetch')
        ? 'No se pudo conectar con el servidor backend.'
        : message;
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (updatedData: Partial<User>): Promise<AuthResult> => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const userData = await parseJsonResponse(response);

      if (response.ok && userData) {
        setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : userData));
        if (userData.nombre) {
          localStorage.setItem('username', userData.nombre);
        }
        return { success: true };
      } else {
        const errorMsg = userData?.error || 'Error al actualizar el usuario';
        throw new Error(errorMsg);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error al actualizar usuario:', error);
      return { success: false, error: message };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};