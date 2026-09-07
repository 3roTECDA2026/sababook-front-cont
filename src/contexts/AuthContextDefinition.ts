// src/contexts/AuthContextDefinition.ts
import { createContext } from 'react';
import type { User } from '../types';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<AuthResult>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);