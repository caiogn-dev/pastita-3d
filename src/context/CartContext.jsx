import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Carregar carrinho do Banco de Dados ao iniciar (se estiver logado)
  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; 

    try {
      const response = await api.get('/cart/');
      // O backend retorna algo como { id: 1, items: [...] }
      // Precisamos garantir que estamos pegando o array de items
      const items = response.data.items || [];
      
      // Mapeia para o formato que seu front usa (se necessário ajustar campos)
      const formattedCart = items.map(item => ({
        id: item.product.id, // ID do produto
        cart_item_id: item.id, // ID do item no carrinho (importante para updates)
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity
      }));
      
      setCart(formattedCart);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  };

  // Carrega o carrinho quando o componente monta
  useEffect(() => {
    fetchCart();
  }, []);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // 2. Adicionar Item (Sincronizado com API)
  const addToCart = async (product) => {
    setIsLoading(true);
    try {
      // Chama a API para salvar no banco
      await api.post('/cart/add_item/', {
        product_id: product.id,
        quantity: 1
      });
      
      // Recarrega o carrinho atualizado do servidor
      await fetchCart(); 
      setIsCartOpen(true);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Erro ao adicionar ao carrinho. Verifique se está logado.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Remover Item (Sincronizado com API)
  const removeFromCart = async (productId) => {
    try {
      await api.post('/cart/remove_item/', { product_id: productId });
      await fetchCart(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };

  // 4. Atualizar Quantidade (Sincronizado com API)
  const updateQuantity = async (productId, amount) => {
    // Acha o item localmente só para saber a qtd atual
    const currentItem = cart.find(item => item.id === productId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + amount;
    if (newQuantity < 1) return;

    try {
      await api.post('/cart/update_item/', {
        product_id: productId,
        quantity: newQuantity
      });
      await fetchCart();
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
    }
  };

  // Limpa apenas visualmente (usado após checkout sucesso)
  const clearCart = () => {
    setCart([]);
  };

  // Cálculos visuais
  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart,
      fetchCart, // Exportando caso precise forçar atualização de fora
      cartTotal, 
      cartCount,
      isCartOpen,
      toggleCart,
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);