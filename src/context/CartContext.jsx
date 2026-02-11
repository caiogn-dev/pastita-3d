import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api, { DEFAULT_STORE_SLUG } from '../services/api';
import { buildMediaUrl } from '../utils/media';
import { useAuth } from './AuthContext';

const CartContext = createContext();
// Alinhado com cache de perfil para reduzir requisições em navegação rápida
const CART_CACHE_TTL_MS = 5 * 60 * 1000;
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
  const cartRef = useRef([]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Suporta tanto o formato antigo quanto o novo do backend
  const normalizeCartItem = (item) => ({
    id: item.product?.id || item.product || item.id,
    cart_item_id: item.id,
    name: item.product_name || item.product?.name || item.name,
    price: Number(item.unit_price || item.price),
    image: buildMediaUrl(item.product_image || item.product?.image || item.image),
    quantity: item.quantity
  });

  const buildOptimisticItem = (product, quantity) => ({
    id: product.id,
    cart_item_id: null,
    name: product.name,
    price: Number(product.price) || 0,
    image: buildMediaUrl(product.image),
    quantity
  });

  const updateCartState = (nextCart) => {
    setCart((prevCart) => {
      const resolved = typeof nextCart === 'function' ? nextCart(prevCart) : nextCart;
      writeCartCache(resolved);
      return resolved;
    });
  };

  const fetchCart = useCallback(async ({ force = false, storeSlug = DEFAULT_STORE_SLUG } = {}) => {
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
        // Novo endpoint RESTful
        const response = await api.get(`/stores/${storeSlug}/cart/`);
        const cartData = response.data || {};
        const items = Array.isArray(cartData.items) ? cartData.items : [];

        const formattedCart = items.map((item) => {
          const normalized = normalizeCartItem(item);
          // garante quantity numérico
          normalized.quantity = Number(normalized.quantity) || 0;
          return normalized;
        });

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

  const addToCart = async (product, storeSlug = DEFAULT_STORE_SLUG) => {
    setIsLoading(true);
    const previousCart = cartRef.current;
    updateCartState((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      return [...prevCart, buildOptimisticItem(product, 1)];
    });
    setIsCartOpen(true);

    try {
      const response = await api.post(`/stores/${storeSlug}/cart/add/`, {
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
      } else if (response.data?.items) {
        const formatted = response.data.items.map((it) => {
          const n = normalizeCartItem(it);
          n.quantity = Number(n.quantity) || 0;
          return n;
        });
        setCart(formatted);
        writeCartCache(formatted);
      } else {
        await fetchCart({ force: true, storeSlug });
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      updateCartState(previousCart);
      alert('Erro ao adicionar ao carrinho. Verifique se esta logado.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId, cartItemId, storeSlug = DEFAULT_STORE_SLUG) => {
    const previousCart = cartRef.current;
    updateCartState((prevCart) => prevCart.filter((item) => item.id !== productId));
    try {
      // cartItemId é o id do item no carrinho (não do produto)
      const response = await api.delete(`/stores/${storeSlug}/cart/item/${cartItemId}/`);
      if (response.data?.items) {
        const formatted = response.data.items.map((it) => {
          const n = normalizeCartItem(it);
          n.quantity = Number(n.quantity) || 0;
          return n;
        });
        setCart(formatted);
        writeCartCache(formatted);
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      updateCartState(previousCart);
    }
  };

  const updateQuantity = async (productId, amount, cartItemId, storeSlug = DEFAULT_STORE_SLUG) => {
    const currentItem = cart.find((item) => item.id === productId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + amount;
    if (newQuantity < 1) return;

    const previousCart = cartRef.current;
    updateCartState((prevCart) => prevCart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      const response = await api.patch(`/stores/${storeSlug}/cart/item/${cartItemId}/`, {
        quantity: newQuantity
      });
      if (response.data?.items) {
        const formatted = response.data.items.map((it) => {
          const n = normalizeCartItem(it);
          n.quantity = Number(n.quantity) || 0;
          return n;
        });
        setCart(formatted);
        writeCartCache(formatted);
      } else if (response.data?.item) {
        const updatedItem = normalizeCartItem(response.data.item);
        updateCartState((prevCart) => prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: updatedItem.quantity } : item
        ));
      } else {
        await fetchCart({ force: true, storeSlug });
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      updateCartState(previousCart);
    }
  };

  const clearCart = async (storeSlug = DEFAULT_STORE_SLUG) => {
    try {
      await api.delete(`/stores/${storeSlug}/cart/clear/`);
      setCart([]);
      clearCartCache();
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    return total + (isNaN(price) ? 0 : price) * (isNaN(quantity) ? 0 : quantity);
  }, 0);
  const cartCount = cart.reduce((count, item) => {
    const quantity = Number(item.quantity);
    return count + (isNaN(quantity) ? 0 : quantity);
  }, 0);

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
