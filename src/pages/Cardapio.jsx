import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useSWR from 'swr';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import Navbar from '../components/Navbar';
import './Cardapio.css';

const fetchProducts = (url) => api.get(url).then((res) => res.data);

const Cardapio = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const { addToCart, cartCount, toggleCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { data, error, isLoading } = useSWR('/products/', fetchProducts, {
    dedupingInterval: 60 * 1000,
    revalidateOnFocus: false
  });

  useEffect(() => {
    if (error) {
      console.error('Erro menu:', error);
    }
  }, [error]);

  const products = useMemo(() => {
    const payload = data?.results ?? data ?? [];
    return Array.isArray(payload) ? payload : [];
  }, [data]);

  const loading = isLoading && products.length === 0;

  const categories = useMemo(() => {
    const values = products
      .map((product) => (product.category || '').trim())
      .filter(Boolean);
    return Array.from(new Set(values));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      if (!normalizedQuery) {
        return matchesCategory;
      }
      const haystack = `${product.name || ''} ${product.description || ''}`.toLowerCase();
      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [products, query, categoryFilter]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setPendingProduct(product);
      setShowLoginModal(true);
      return;
    }
    if (product.stock_quantity <= 0) {
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
        <h1 className="cardapio-title">Nosso Cardapio</h1>
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
          <p>Nenhum produto disponivel no momento.</p>
          <Link to="/" className="btn-secondary">Voltar ao Inicio</Link>
        </div>
      )}

      {/* Grid de Produtos */}
      {!loading && products.length > 0 && (
        <div className="container">
          <div className="cardapio-filters">
            <div className="cardapio-search">
              <input
                type="text"
                placeholder="Buscar por nome ou descricao"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="cardapio-category">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="products-grid">
            {filteredProducts.map((p) => {
              const imageUrl = p.image;
              const inStock = Number(p.stock_quantity) > 0;
              return (
              <div key={p.id} className="product-card">
                <div className={`product-image ${imageUrl ? '' : 'product-image-empty'}`}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="product-image-fallback">Sem imagem</div>
                  )}
                  <div className="product-price">
                    R$ {Number(p.price).toFixed(2)}
                  </div>
                  {!inStock && (
                    <div className="product-stock-badge">Sem estoque</div>
                  )}
                </div>

                <div className="product-content">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-description">{p.description}</p>
                  
                  <button 
                    onClick={() => handleAddToCart(p)}
                    className={`product-add-btn ${inStock ? '' : 'product-add-btn-disabled'}`}
                    disabled={!inStock}
                  >
                    {inStock ? 'Adicionar' : 'Indisponivel'}
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cardapio;
