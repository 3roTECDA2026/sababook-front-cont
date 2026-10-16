// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importaciones de Páginas
import Home from './pages/Home';
import LoginPage from './pages/LoginRegister';
import Favs from './pages/Favs';
import Profile from './pages/Profile';
import MyForum from './pages/MyForums';
import DashboardPage from './pages/DashboardPage';
import BookDetailsPage from './pages/BookDetailsPage';
import MyComments from './pages/MyComments';
import Comments from './pages/Comments';
import Insignias from './pages/Insignias';
import ForumDetailsPage from './pages/ForumDetailsPage';
import TriviaPage from './pages/TriviaPage';
import BookCommentsAdmin from './pages/BookCommentsAdmin';
import ForumCommentsAdmin from './pages/ForumCommentsAdmin';
import CafesLiterarios from './pages/CafesLiterarios';
import CourseBooksPage from './pages/CourseBooksPage';

// Importaciones de Nuevos Módulos (Radio Sábato y Feed Muro)
import { RadioPlayer } from './components/RadioPlayer';
import { FeedMuro } from './components/FeedMuro';

// Importación de Ruta Protegida
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favoritos"
        element={
          <ProtectedRoute>
            <Favs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-comentarios"
        element={
          <ProtectedRoute>
            <MyComments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comments"
        element={
          <ProtectedRoute>
            <Comments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book/:id"
        element={
          <ProtectedRoute>
            <BookDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookdetails/:id"
        element={
          <ProtectedRoute>
            <BookDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foro/detalle/:id"
        element={
          <ProtectedRoute>
            <ForumDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foro/:id"
        element={
          <ProtectedRoute>
            <ForumDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/foros"
        element={
          <ProtectedRoute>
            <MyForum />
          </ProtectedRoute>
        }
      />

      {/* Nuevas Rutas: Radio Sábato y Muro de Actividades */}
      <Route
        path="/radio"
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-6">
              <RadioPlayer />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-6">
              <FeedMuro />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Ruta de administración de comentarios de foros (Protegida) */}
      <Route
        path="/dashboard/forum-comments/:foroId"
        element={
          <RoleGuard allowedRoles={['ADMINISTRADOR']}>
            <ForumCommentsAdmin />
          </RoleGuard>
        }
      />

      {/* Ruta para generar trivia (Docentes y Administradores) */}
      <Route
        path="/trivia"
        element={
          <RoleGuard allowedRoles={['DOCENTE', 'ADMINISTRADOR']}>
            <TriviaPage />
          </RoleGuard>
        }
      />

      {/* Ruta principal de administración */}
      <Route
        path="/dashboard"
        element={
          <RoleGuard allowedRoles={['ADMINISTRADOR']}>
            <DashboardPage />
          </RoleGuard>
        }
      />

      {/* Ruta para administrar comentarios de libros */}
      <Route
        path="/dashboard/book-comments/:bookId"
        element={
          <RoleGuard allowedRoles={['ADMINISTRADOR']}>
            <BookCommentsAdmin />
          </RoleGuard>
        }
      />

      <Route
        path="/insignias"
        element={
          <ProtectedRoute>
            <Insignias />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cafes"
        element={
          <ProtectedRoute>
            <CafesLiterarios />
          </ProtectedRoute>
        }
      />

      {/* Asignación de libros a cursos (Administrador y Docente) */}
      <Route
        path="/cursos/libros"
        element={
          <RoleGuard allowedRoles={['DOCENTE', 'ADMINISTRADOR']}>
            <CourseBooksPage />
          </RoleGuard>
        }
      />

      {/* Ruta 404 debe ir al final */}
      <Route path="*" element={<div>Página no encontrada (404)</div>} />
    </Routes>
  );
}

export default App;