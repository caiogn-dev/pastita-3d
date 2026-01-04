import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import Navbar from '../components/Navbar';
import './Cardapio.css';

const Cardapio = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  
  const { addToCart, cartCount, toggleCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api.get('/products/')
      .then(res => {
        const data = res.data.results || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Erro menu:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setPendingProduct(product);
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
  };

  const handleLoginSuccess = () => {
    if (pendingProduct) {
      addToCart(pendingProduct);
      setPendingProduct(null);
    }
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setPendingProduct(null);
  };

  return (
    <div className="cardapio-page">
      <Navbar />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleCloseModal}
        onSuccess={handleLoginSuccess}
      />

      {/* Header */}
      <div className="cardapio-header">
        <span className="cardapio-subtitle">Artesanal</span>
        <h1 className="cardapio-title">Nosso Cardápio</h1>
        <div className="cardapio-divider"></div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="cardapio-loading">
          <div className="spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="cardapio-empty">
          <p>Nenhum produto disponível no momento.</p>
          <Link to="/" className="btn-secondary">Voltar ao Início</Link>
        </div>
      )}

      {/* Grid de Produtos */}
      {!loading && products.length > 0 && (
        <div className="container">
          <div className="products-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-image">
                  <img src={p.image} alt={p.name} />
                  <div className="product-price">
                    R$ {Number(p.price).toFixed(2)}
                  </div>
                </div>

                <div className="product-content">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-description">{p.description}</p>
                  
                  <button 
                    onClick={() => handleAddToCart(p)}
                    className="product-add-btn"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cardapio;