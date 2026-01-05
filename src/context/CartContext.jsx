import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { buildMediaUrl } from '../utils/media';

const CartContext = createContext();
const CART_CACHE_KEY = 'pastita_cart_cache_v1';
const CART_CACHE_TTL_MS = 2 * 60 * 1000;
let cartFetchPromise = null;
let cartFetchToken = null;

const readCartCache = () => {
  try {
    const raw = localStorage.getItem(CART_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCartCache = (token, items) => {
  try {
    localStorage.setItem(CART_CACHE_KEY, JSON.stringify({
      token,
      ts: Date.now(),
      data: items
    }));
  } catch {
    // ignore cache write errors
  }
};

const clearCartCache = () => {
  try {
    localStorage.removeItem(CART_CACHE_KEY);
  } catch {
    // ignore cache clear errors
  }
};

const isCartCacheValid = (cache, token) => {
  if (!cache || cache.token !== token || !cache.ts) {
    return false;
  }
  return Date.now() - cache.ts < CART_CACHE_TTL_MS;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initRef = useRef(false);

  const fetchCart = useCallback(async ({ force = false } = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearCartCache();
      setCart([]);
      return null;
    }

    const cached = readCartCache();
    if (!force && isCartCacheValid(cached, token)) {
      setCart(cached.data);
      return cached.data;
    }

    if (cartFetchPromise && cartFetchToken === token) {
      return cartFetchPromise;
    }

    cartFetchToken = token;
    cartFetchPromise = (async () => {
      try {
        const response = await api.get('/cart/');
        if (localStorage.getItem('token') !== token) {
          return null;
        }
        const items = response.data.items || [];

        const formattedCart = items.map((item) => ({
          id: item.product.id,
          cart_item_id: item.id,
          name: item.product.name,
          price: item.product.price,
          image: buildMediaUrl(item.product.image),
          quantity: item.quantity
        }));

        setCart(formattedCart);
        writeCartCache(token, formattedCart);
        return formattedCart;
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        return null;
      } finally {
        cartFetchPromise = null;
      }
    })();

    return cartFetchPromise;
  }, []);

  useEffect(() => {
    if (initRef.current) {
      return;
    }
    initRef.current = true;
    fetchCart();
  }, [fetchCart]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = async (product) => {
    setIsLoading(true);
    try {
      await api.post('/cart/add_item/', {
        product_id: product.id,
        quantity: 1
      });

      await fetchCart({ force: true });
      setIsCartOpen(true);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao adicionar ao carrinho. Verifique se esta logado.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.post('/cart/remove_item/', { product_id: productId });
      await fetchCart({ force: true });
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const updateQuantity = async (productId, amount) => {
    const currentItem = cart.find((item) => item.id === productId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + amount;
    if (newQuantity < 1) return;

    try {
      await api.post('/cart/update_item/', {
        product_id: productId,
        quantity: newQuantity
      });
      await fetchCart({ force: true });
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const clearCart = async () => {
    try {
      await api.post('/cart/clear/');
      setCart([]);
      clearCartCache();
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      isCartOpen,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
