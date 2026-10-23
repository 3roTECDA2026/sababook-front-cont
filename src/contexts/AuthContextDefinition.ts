// src/contexts/AuthContextDefinition.ts
import { createContext } from 'react';
import type { User, TipoRol } from '@/types';

// Tipo de error del login: credenciales incorrectas o problema de conexión con el servidor
export type TipoErrorLogin = 'credenciales' | 'conexion';

export interface AuthResult {
  success: boolean;
  error?: string;
  errorType?: TipoErrorLogin;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  hasRole: (role: TipoRol) => boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<AuthResult>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);