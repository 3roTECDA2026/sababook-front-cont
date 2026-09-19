// src/contexts/AuthContext.tsx
import { useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../environments/api';
import { AuthContext, AuthContextType, AuthResult } from './AuthContextDefinition';
import type { User } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  // Cargar usuario desde localStorage al iniciar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');

      if (storedToken && storedUserId) {
        setToken(storedToken);
        try {
          // Obtener los datos del usuario desde la API
          const response = await fetch(`${API_BASE_URL}/api/v1/user/${storedUserId}`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser({
              ...userData,
              userId: storedUserId,
              rol: localStorage.getItem('rol'),
            });
          } else {
            // Si el token no es válido, limpiar el localStorage
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
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar los datos básicos
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

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profileData.error || 'No se pudo obtener el perfil del usuario');
      }

      // Guardar el nombre en localStorage
      localStorage.setItem('username', profileData.nombre);

      // Actualizar el estado del usuario
      setUser({
        ...profileData,
        userId: data.userId,
        rol: data.rol,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const errorMessage = message.includes('Failed to fetch')
        ? 'No se pudo conectar con el servidor. ¿Está en ejecución?'
        : message;
      return { success: false, error: errorMessage };
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    setUser(null);
    setToken(null);
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

      if (response.ok) {
        const userData = await response.json();
        setUser({
          ...user,
          ...userData,
        });
        // Actualizar localStorage si es necesario
        if (userData.nombre) {
          localStorage.setItem('username', userData.nombre);
        }
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el usuario');
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