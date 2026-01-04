// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components e Pages
import PrivateRoute from './components/PrivateRoute'; // Certifique-se que criou este arquivo
import LandingPage from './pages/LandingPage';
import Cardapio from './pages/Cardapio';
import CheckoutPage from './pages/CheckoutPage';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    // 1. AuthProvider envolve tudo (Sistema de Segurança)
    <AuthProvider>
      {/* 2. CartProvider vem dentro, pois pode precisar do User */}
      <CartProvider>
        {/* 3. Router habilita a navegação */}
        <Router>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            {/* Rotas Protegidas (Layout Wrapper) */}
            <Route element={<PrivateRoute />}>
              <Route path="/cardapio" element={<Cardapio />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
            
            {/* Fallback para rota inexistente */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;