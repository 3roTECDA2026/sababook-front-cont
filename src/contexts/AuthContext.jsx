import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../environments/api';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

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
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser({
              ...userData,
              userId: storedUserId,
              rol: localStorage.getItem('rol'),
            });
          } else if (response.status === 401 || response.status === 403) {
            // ARREGLO: solo desloguear si el token realmente es inválido o expiró.
            // Antes, cualquier respuesta distinta de 2xx (incluyendo errores 500
            // transitorios, por ejemplo un hiccup de conexión a la base de datos)
            // hacía logout() y expulsaba al usuario de la sesión sin motivo real.
            logout();
          } else {
            // Error transitorio del servidor (500, etc.): NO desloguear.
            // Mantenemos la sesión con los datos que ya teníamos en localStorage
            // para no expulsar al usuario por una falla momentánea del backend/DB.
            console.warn('Error temporal al validar sesión, se mantiene el token.');
            setUser({
              userId: storedUserId,
              rol: localStorage.getItem('rol'),
              nombre: localStorage.getItem('username'),
            });
          }
        } catch (error) {
          // ARREGLO: un error de red (backend caído, sin conexión, DNS, etc.)
          // tampoco debería cerrar la sesión del usuario. Mantenemos el estado
          // con lo último guardado en localStorage.
          console.error('Error al cargar datos del usuario:', error);
          setUser({
            userId: storedUserId,
            rol: localStorage.getItem('rol'),
            nombre: localStorage.getItem('username'),
          });
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
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
          'Authorization': `Bearer ${data.token}`
        }
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
      const errorMessage =
        error.message.includes('Failed to fetch')
          ? 'No se pudo conectar con el servidor. ¿Está en ejecución?'
          : error.message;
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    setUser(null);
    setToken(null);
  };

  const updateUser = async (updatedData) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          ...user,
          ...userData
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
      console.error('Error al actualizar usuario:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
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