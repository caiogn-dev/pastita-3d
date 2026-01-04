import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/Menu';
import CheckoutPage from './pages/CheckoutPage'; // Importe aqui

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cardapio" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} /> {/* Nova Rota */}
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;