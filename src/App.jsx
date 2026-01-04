import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext'; // <--- IMPORTANTE

import LandingPage from './pages/LandingPage';
import Cardapio from './pages/Cardapio';
import CheckoutPage from './pages/CheckoutPage';
import Login from './pages/Login';     // <--- NOVA
import Register from './pages/Register'; // <--- NOVA

function App() {
  return (
    <AuthProvider> {/* O AuthProvider deve envolver tudo */}
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cardapio" element={<Cardapio />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;