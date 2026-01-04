import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import LandingPage from './pages/LandingPage';
import Cardapio from './pages/Cardapio';
import CheckoutPage from './pages/CheckoutPage'; // Importe aqui

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/checkout" element={<CheckoutPage />} /> {/* Nova Rota */}
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;