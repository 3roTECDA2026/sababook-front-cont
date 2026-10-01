# 🛡️ Guía de Seguridad y Diagnóstico Frontend (sababook-front-cont)

Este documento describe el análisis de seguridad realizado sobre el repositorio frontend de **Sababook** (`sababook-front-cont`), detallando la integración de la autenticación mediante **JWT**, la protección de componentes de interfaz y el enrutamiento protegido.

---

## 1. 📌 Postura de Seguridad y Diagnóstico de Arquitectura

El frontend de Sababook integra una capa reactiva de autenticación construida sobre React Context (`AuthContext`) y React Router.

*   **Persistencia de Sesión:** El token de autenticación (`token`) y los datos mínimos de sesión (`userId`, `rol`) se conservan en `localStorage` ([src/contexts/AuthContext.tsx](file:///home/jmro/Documents/Institute_Projects_2026/repos/sababook-front-cont/src/contexts/AuthContext.tsx#L96-L101)).
*   **Encabezados HTTP:** Toda petición a endpoints protegidos de la API inyecta automáticamente el token de seguridad utilizando la convención estándar `Authorization: Bearer <token>`.
*   **Protección de Vistas:** Las rutas de la aplicación se aseguran mediante el componente envoltorio `<ProtectedRoute>` ([src/components/ProtectedRoute.tsx](file:///home/jmro/Documents/Institute_Projects_2026/repos/sababook-front-cont/src/components/ProtectedRoute.tsx#L10-L25)).

---

## 2. 🔐 Flujo de Autenticación y Protección de Vistas

### 2.1 Componente Envoltorio `ProtectedRoute`
Impide que usuarios anónimos o no autenticados accedan a las páginas de la aplicación mediante la manipulación manual de la URL:

```typescript
// src/components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

---

## 3. 🛡️ Implicaciones para el Desarrollo

*   **Seguridad de Capa Visual vs Backend:** El componente `ProtectedRoute` y el ocultamiento de botones por rol mejoran la experiencia de usuario (UX), pero **no sustituyen la validación del servidor**. El backend es siempre el responsable de validar la firma del token y los permisos del rol.
*   **Limpieza de Estado en Logout:** Al cerrar sesión, la función `logout` remueve explícitamente las claves de `localStorage` y limpia los estados de React para evitar la persistencia de credenciales en memoria local.

---

## 4. 📦 Política de Mantenimiento de Dependencias

*   **Auditoría periódica:** Ejecutar `npm audit` ante cualquier actualización de paquetes.
*   **Instalación reproducible:** Utilizar `npm ci` en entornos de integración y despliegue para garantizar las versiones exactas registradas en `package-lock.json`.
