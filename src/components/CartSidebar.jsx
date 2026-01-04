import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartSidebar = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, toggleCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay Escuro (Clica fora pra fechar) */}
      <div 
        onClick={toggleCart}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99
        }}
      />

      {/* A Gaveta Lateral */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '400px',
        backgroundColor: '#fff', boxShadow: '-5px 0 25px rgba(0,0,0,0.2)', zIndex: 100,
        display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
      }}>
        
        {/* Header do Carrinho */}
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--color-marsala)', fontSize: '1.5rem', margin: 0 }}>Seu Pedido</h2>
          <button onClick={toggleCart} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {/* Lista de Itens */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>Seu carrinho está vazio.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f5f5f5' }}>
                <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '0.95rem' }}>{item.name}</h4>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--color-marsala)', fontWeight: 'bold' }}>R$ {Number(item.price).toFixed(2)}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '2px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                      <span style={{ padding: '0 5px', fontSize: '0.9rem' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '2px 8px', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ color: '#999', fontSize: '0.8rem', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Remover</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer com Total e Botão */}
        <div style={{ padding: '25px', backgroundColor: '#f9f9f9', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
            <span>Total:</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
          <Link 
            to="/checkout" 
            onClick={toggleCart}
            className="btn-primary" 
            style={{ display: 'block', width: '100%', textAlign: 'center', padding: '15px', borderRadius: '8px' }}
          >
            FINALIZAR COMPRA
          </Link>
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
};

export default CartSidebar;