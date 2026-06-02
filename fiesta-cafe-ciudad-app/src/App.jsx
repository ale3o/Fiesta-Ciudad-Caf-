import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importar pantallas
import Login from './pages/auth/Login';
import VerifyAge from './pages/auth/VerifyAge';
import Dashboard from './pages/dashboard/Dashboard';
import PlaceDetail from './pages/place/PlaceDetail';
import Register from './pages/auth/Register';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rutas Públicas */}
    	{/* Rutas Públicas */}
	<Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
	<Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
	<Route path="/verify-age" element={<VerifyAge />} />
      
      {/* Rutas Protegidas */}
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/place/:id" element={user ? <PlaceDetail /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}