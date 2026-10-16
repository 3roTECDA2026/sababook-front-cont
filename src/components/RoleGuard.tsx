// src/components/RoleGuard.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { TipoRol } from '@/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: TipoRol[];
  redirectTo?: string;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  redirectTo = '/home',
}: RoleGuardProps) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = allowedRoles.some((role) => hasRole(role));

  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
