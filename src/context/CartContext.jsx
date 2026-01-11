import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { buildMediaUrl } from '../utils/media';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_CACHE_TTL_MS = 5 * 60 * 1000;
let cartFetchPromise = null;
let cartCache = null;
let cartCacheTs = 0;

const readCartCache = () => {
  if (!cartCache || !cartCacheTs) return null;
  if (Date.now() - cartCacheTs > CART_CACHE_TTL_MS) {
    cartCache = null;
    cartCacheTs = 0;
    return null;
  }
  return cartCache;
};

const writeCartCache = (data) => {
  cartCache = data;
  cartCacheTs = Date.now();
};

const clearCartCache = () => {
  cartCache = null;
  cartCacheTs = 0;
};

export const CartProvider = ({ children }) => {
  // Separate state for products and combos
  const [cart, setCart] = useState([]);
  const [combos, setCombos] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const cartRef = useRef({ products: [], combos: [] });

  useEffect(() => {
    cartRef.current = { products: cart, combos };
  }, [cart, combos]);

  const normalizeCartItem = (item) => ({
    id: item.product?.id || item.id,
    cart_item_id: item.id,
    name: item.product?.name || item.produto_info?.nome || item.name,
    price: item.product?.price || item.produto_info?.preco || item.price,
    image: buildMediaUrl(item.product?.image || item.produto_info?.imagem_url),
    quantity: item.quantity || item.quantidade
  });

  const normalizeComboItem = (item) => ({
    id: item.combo?.id || item.id,
    cart_item_id: item.id,
    name: item.combo?.nome || item.combo_info?.nome || item.name,
    price: item.combo?.preco || item.combo_info?.preco || item.price,
    image: buildMediaUrl(item.combo?.imagem_url || item.combo_info?.imagem_url),
    quantity: item.quantity || item.quantidade,
    isCombo: true
  });

  const buildOptimisticItem = (product, quantity) => ({
    id: product.id,
    cart_item_id: `temp_${product.id}`,
    name: product.name || product.nome,
    price: product.price || product.preco,
    image: buildMediaUrl(product.image || product.imagem_url),
    quantity
  });

  const buildOptimisticCombo = (combo, quantity) => ({
    id: combo.id,
    cart_item_id: `temp_combo_${combo.id}`,
    name: combo.nome || combo.name,
    price: combo.preco || combo.price,
    image: buildMediaUrl(combo.imagem_url || combo.image),
    quantity,
    isCombo: true
  });

  const fetchCart = useCallback(async ({ force = false } = {}) => {
    if (!isAuthenticated) {
      clearCartCache();
      setCart([]);
      setCombos([]);
      return null;
    }

    const cached = readCartCache();
    if (!force && cached) {
      setCart(cached.products || []);
      setCombos(cached.combos || []);
      return cached;
    }

    if (cartFetchPromise) return cartFetchPromise;

    cartFetchPromise = (async () => {
      try {
        // Try Pastita API first, fallback to legacy
        let response;
        try {
          response = await api.get('/pastita/carrinho/');
        } catch {
          response = await api.get('/cart/list/');
        }

        const data = response.data;
        
        // Handle Pastita API response format
        if (data.itens !== undefined) {
          const formattedProducts = (data.itens || []).map(normalizeCartItem);
          const formattedCombos = (data.combos || []).map(normalizeComboItem);
          
          setCart(formattedProducts);
          setCombos(formattedCombos);
          writeCartCache({ products: formattedProducts, combos: formattedCombos });
          return { products: formattedProducts, combos: formattedCombos };
        }
        
        // Handle legacy API response format
        const items = data.items || [];
        const formattedCart = items.map(normalizeCartItem);
        setCart(formattedCart);
        setCombos([]);
        writeCartCache({ products: formattedCart, combos: [] });
        return { products: formattedCart, combos: [] };
      } catch {
        return null;
      } finally {
        cartFetchPromise = null;
      }
    })();

    return cartFetchPromise;
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [fetchCart, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearCartCache();
      setCart([]);
      setCombos([]);
    }
  }, [isAuthenticated]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Add product to cart
  const addToCart = async (product) => {
    setIsLoading(true);
    const previousCart = cartRef.current.products;
    
    setCart((prevCart) => {
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
      // Try Pastita API first
      try {
        await api.post('/pastita/carrinho/adicionar_produto/', {
          produto_id: product.id,
          quantidade: 1
        });
      } catch {
        await api.post('/cart/add_item/', {
          product_id: product.id,
          quantity: 1
        });
      }
      await fetchCart({ force: true });
    } catch {
      setCart(previousCart);
      alert('Erro ao adicionar ao carrinho. Verifique se está logado.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add combo to cart
  const addComboToCart = async (combo) => {
    setIsLoading(true);
    const previousCombos = cartRef.current.combos;
    
    setCombos((prevCombos) => {
      const existingIndex = prevCombos.findIndex((item) => item.id === combo.id);
      if (existingIndex >= 0) {
        const updated = [...prevCombos];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      return [...prevCombos, buildOptimisticCombo(combo, 1)];
    });
    setIsCartOpen(true);

    try {
      await api.post('/pastita/carrinho/adicionar_combo/', {
        combo_id: combo.id,
        quantidade: 1
      });
      await fetchCart({ force: true });
    } catch {
      setCombos(previousCombos);
      alert('Erro ao adicionar combo ao carrinho.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    const previousCart = cartRef.current.products;
    const item = cart.find((i) => i.id === productId);
    
    setCart((prevCart) => prevCart.filter((i) => i.id !== productId));
    
    try {
      if (item?.cart_item_id) {
        try {
          await api.delete(`/pastita/carrinho/remover-produto/${item.cart_item_id}/`);
        } catch {
          await api.post('/cart/remove_item/', { product_id: productId });
        }
      }
    } catch {
      setCart(previousCart);
    }
  };

  // Remove combo from cart
  const removeComboFromCart = async (comboId) => {
    const previousCombos = cartRef.current.combos;
    const item = combos.find((i) => i.id === comboId);
    
    setCombos((prevCombos) => prevCombos.filter((i) => i.id !== comboId));
    
    try {
      if (item?.cart_item_id) {
        await api.delete(`/pastita/carrinho/remover-combo/${item.cart_item_id}/`);
      }
    } catch {
      setCombos(previousCombos);
    }
  };

  // Update product quantity
  const updateQuantity = async (productId, amount) => {
    const currentItem = cart.find((item) => item.id === productId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + amount;
    if (newQuantity < 1) return;

    const previousCart = cartRef.current.products;
    setCart((prevCart) => prevCart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      if (currentItem.cart_item_id) {
        try {
          await api.post(`/pastita/carrinho/atualizar-produto/${currentItem.cart_item_id}/`, {
            quantidade: newQuantity
          });
        } catch {
          await api.post('/cart/update_item/', {
            product_id: productId,
            quantity: newQuantity
          });
        }
      }
      await fetchCart({ force: true });
    } catch {
      setCart(previousCart);
    }
  };

  // Update combo quantity
  const updateComboQuantity = async (comboId, amount) => {
    const currentItem = combos.find((item) => item.id === comboId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + amount;
    if (newQuantity < 1) return;

    const previousCombos = cartRef.current.combos;
    setCombos((prevCombos) => prevCombos.map((item) =>
      item.id === comboId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      if (currentItem.cart_item_id) {
        await api.post(`/pastita/carrinho/atualizar-combo/${currentItem.cart_item_id}/`, {
          quantidade: newQuantity
        });
      }
      await fetchCart({ force: true });
    } catch {
      setCombos(previousCombos);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      try {
        await api.delete('/pastita/carrinho/limpar/');
      } catch {
        await api.post('/cart/clear/');
      }
      setCart([]);
      setCombos([]);
      clearCartCache();
    } catch {
      // Silently fail
    }
  };

  // Calculate totals
  const productTotal = cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  const comboTotal = combos.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  const cartTotal = productTotal + comboTotal;
  
  const productCount = cart.reduce((count, item) => count + item.quantity, 0);
  const comboCount = combos.reduce((count, item) => count + item.quantity, 0);
  const cartCount = productCount + comboCount;

  const hasItems = cart.length > 0 || combos.length > 0;

  return (
    <CartContext.Provider value={{
      // Products
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      
      // Combos
      combos,
      addComboToCart,
      removeComboFromCart,
      updateComboQuantity,
      
      // Totals
      cartCount,
      cartTotal,
      productTotal,
      comboTotal,
      hasItems,
      
      // UI State
      isCartOpen,
      isLoading,
      toggleCart,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
