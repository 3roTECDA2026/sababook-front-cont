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
import BookCommentsAdmin from './components/BookCommentsAdmin';
import ForumCommentsAdmin from './components/ForumCommentsAdmin';

// Importación de Ruta Protegida
import { ProtectedRoute } from './components/ProtectedRoute';

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
        path="/foros"
        element={
          <ProtectedRoute>
            <MyForum />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard/forum-comments/:foroId" element={<ForumCommentsAdmin />} />

      {/* Ruta principal de administración */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Ruta para administrar comentarios de libros */}
      <Route
        path="/dashboard/book-comments/:bookId"
        element={
          <ProtectedRoute>
            <BookCommentsAdmin />
          </ProtectedRoute>
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

      {/* Ruta 404 debe ir al final */}
      <Route path="*" element={<div>Página no encontrada (404)</div>} />
    </Routes>
  );
}

export default App;