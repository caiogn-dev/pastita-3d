import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { buildMediaUrl } from '../utils/media';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_CACHE_TTL_MS = 2 * 60 * 1000;
let cartFetchPromise = null;
let cartCache = null;
let cartCacheTs = 0;

const readCartCache = () => {
  if (!cartCache || !cartCacheTs) {
    return null;
  }
  if (Date.now() - cartCacheTs > CART_CACHE_TTL_MS) {
    cartCache = null;
    cartCacheTs = 0;
    return null;
  }
  return cartCache;
};

const writeCartCache = (items) => {
  cartCache = items;
  cartCacheTs = Date.now();
};

const clearCartCache = () => {
  cartCache = null;
  cartCacheTs = 0;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const normalizeCartItem = (item) => ({
    id: item.product.id,
    cart_item_id: item.id,
    name: item.product.name,
    price: item.product.price,
    image: buildMediaUrl(item.product.image),
    quantity: item.quantity
  });

  const updateCartState = (nextCart) => {
    setCart((prevCart) => {
      const resolved = typeof nextCart === 'function' ? nextCart(prevCart) : nextCart;
      writeCartCache(resolved);
      return resolved;
    });
  };

  const fetchCart = useCallback(async ({ force = false } = {}) => {
    if (!isAuthenticated) {
      clearCartCache();
      setCart([]);
      return null;
    }

    const cached = readCartCache();
    if (!force && cached) {
      setCart(cached);
      return cached;
    }

    if (cartFetchPromise) {
      return cartFetchPromise;
    }

    cartFetchPromise = (async () => {
      try {
        const response = await api.get('/cart/');
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
        writeCartCache(formattedCart);
        return formattedCart;
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        return null;
      } finally {
        cartFetchPromise = null;
      }
    })();

    return cartFetchPromise;
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearCartCache();
      setCart([]);
    }
  }, [isAuthenticated]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = async (product) => {
    setIsLoading(true);
    try {
      const response = await api.post('/cart/add_item/', {
        product_id: product.id,
        quantity: 1
      });

      if (response.data?.item) {
        const newItem = normalizeCartItem(response.data.item);
        updateCartState((prevCart) => {
          const existingIndex = prevCart.findIndex((item) => item.id === newItem.id);
          if (existingIndex >= 0) {
            const updated = [...prevCart];
            updated[existingIndex] = { ...updated[existingIndex], quantity: newItem.quantity };
            return updated;
          }
          return [...prevCart, newItem];
        });
      } else {
        await fetchCart({ force: true });
      }
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
      updateCartState((prevCart) => prevCart.filter((item) => item.id !== productId));
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
      const response = await api.post('/cart/update_item/', {
        product_id: productId,
        quantity: newQuantity
      });
      if (response.data?.item) {
        const updatedItem = normalizeCartItem(response.data.item);
        updateCartState((prevCart) => prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: updatedItem.quantity } : item
        ));
      } else {
        await fetchCart({ force: true });
      }
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
