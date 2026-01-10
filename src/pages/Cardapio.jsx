import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import useSWR from 'swr';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import LoginModal from '../components/LoginModal';
import Navbar from '../components/Navbar';
import FavoriteButton from '../components/FavoriteButton';
import StockBadge from '../components/StockBadge';
import { Button, Badge, Input, Skeleton, EmptyState } from '../components/ui';

const fetchProducts = (url) => api.get(url).then((res) => res.data);

const CATEGORY_PRIORITY = ['rondelli', 'rondellis', 'molho', 'molhos'];
const WEIGHTED_CATEGORIES = new Set(['rondelli', 'rondellis', 'molho', 'molhos']);

const normalizeCategory = (value) => (value || '')
  .toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '')
  .trim();

const getCategoryRank = (value) => {
  const normalized = normalizeCategory(value);
  const index = CATEGORY_PRIORITY.indexOf(normalized);
  return index === -1 ? CATEGORY_PRIORITY.length + 1 : index;
};

const getProductWeightLabel = (product) => {
  const normalized = normalizeCategory(product?.category);
  if (WEIGHTED_CATEGORIES.has(normalized)) {
    return '500g';
  }
  return '';
};

// Product Image with fallback
const ProductImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div className="product-image product-image-empty">
        <div className="product-image-fallback">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>Sem imagem</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-image ${isLoading ? 'product-image-loading' : ''}`}>
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

// Loading skeleton for products
const ProductsSkeleton = () => (
  <div className="products-grid">
    {Array.from({ length: 6 }, (_, i) => (
      <Skeleton.ProductCard key={i} />
    ))}
  </div>
);

const Cardapio = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorited } = useWishlist();
  const { data, error, isLoading, mutate } = useSWR('/products/', fetchProducts, {
    dedupingInterval: 60 * 1000,
    revalidateOnFocus: false
  });

  useEffect(() => {
    if (error) {
      // Error is handled by the UI - no console logging in production
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
    return Array.from(new Set(values)).sort((a, b) => {
      const rankA = getCategoryRank(a);
      const rankB = getCategoryRank(b);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.localeCompare(b, 'pt-BR');
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesFavorites = !showFavoritesOnly || isFavorited(product.id);
      if (!normalizedQuery) {
        return matchesCategory && matchesFavorites;
      }
      const haystack = `${product.name || ''} ${product.description || ''}`.toLowerCase();
      return matchesCategory && matchesFavorites && haystack.includes(normalizedQuery);
    });
    return filtered.slice().sort((a, b) => {
      const rankA = getCategoryRank(a.category);
      const rankB = getCategoryRank(b.category);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return (a.name || '').localeCompare(b.name || '', 'pt-BR');
    });
  }, [products, query, categoryFilter, showFavoritesOnly, isFavorited]);

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

  const handleClearSearch = () => {
    setQuery('');
    setCategoryFilter('all');
    setShowFavoritesOnly(false);
  };

  const handleToggleFavorites = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowFavoritesOnly(!showFavoritesOnly);
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
        <div className="container">
          <ProductsSkeleton />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="container">
          <EmptyState.Error onAction={() => mutate()} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="container">
          <EmptyState.Products onAction={() => window.location.href = '/'} />
        </div>
      )}

      {/* Grid de Produtos */}
      {!loading && !error && products.length > 0 && (
        <div className="container">
          <div className="cardapio-filters">
            <div className="cardapio-search">
              <Input
                type="text"
                placeholder="Buscar por nome ou descrição"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                fullWidth
                leftIcon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                }
              />
            </div>
            <div className="cardapio-category-buttons" role="tablist" aria-label="Categorias">
              <button
                type="button"
                className={`category-chip ${categoryFilter === 'all' && !showFavoritesOnly ? 'active' : ''}`}
                onClick={() => { setCategoryFilter('all'); setShowFavoritesOnly(false); }}
                role="tab"
                aria-selected={categoryFilter === 'all' && !showFavoritesOnly}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-chip ${categoryFilter === category && !showFavoritesOnly ? 'active' : ''}`}
                  onClick={() => { setCategoryFilter(category); setShowFavoritesOnly(false); }}
                  role="tab"
                  aria-selected={categoryFilter === category && !showFavoritesOnly}
                >
                  {category}
                </button>
              ))}
              <button
                type="button"
                className={`category-chip favorites-chip ${showFavoritesOnly ? 'active' : ''}`}
                onClick={handleToggleFavorites}
                role="tab"
                aria-selected={showFavoritesOnly}
              >
                ❤️ Favoritos
              </button>
            </div>
          </div>

          {/* No results for search */}
          {filteredProducts.length === 0 && (query || categoryFilter !== 'all') && (
            <EmptyState.Search query={query} onAction={handleClearSearch} />
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((p) => {
                const inStock = Number(p.stock_quantity) > 0;
                const weightLabel = getProductWeightLabel(p);
                return (
                  <div key={p.id} className="product-card">
                    <div className="product-image-wrapper">
                      <ProductImage src={p.image || p.image_url} alt={p.name} />
                      <div className="product-price">
                        R$ {Number(p.price).toFixed(2)}
                      </div>
                      <div className="product-favorite">
                        <FavoriteButton productId={p.id} size="small" />
                      </div>
                      <StockBadge quantity={p.stock_quantity} />
                    </div>

                    <div className="product-content">
                      <h3 className="product-name">{p.name}</h3>
                      {weightLabel && (
                        <Badge variant="marsala" size="sm" className="product-weight">
                          {weightLabel}
                        </Badge>
                      )}
                      <p className="product-description line-clamp-2">{p.description}</p>
                      
                      <Button 
                        variant={inStock ? 'outline' : 'ghost'}
                        fullWidth
                        onClick={() => handleAddToCart(p)}
                        disabled={!inStock}
                      >
                        {inStock ? 'Adicionar' : 'Indisponível'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cardapio;
