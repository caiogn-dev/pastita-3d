import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartSidebar = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, toggleCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={toggleCart} />

      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>Seu Pedido</h2>
          <button onClick={toggleCart} className="cart-close-btn" aria-label="Fechar">
            x
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">[]</span>
              <p>Seu carrinho está vazio.</p>
              <button onClick={toggleCart} className="btn-secondary">
                Ver cardápio
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">R$ {Number(item.price).toFixed(2)}</p>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Diminuir quantidade"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="cart-item-remove"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            {isAuthenticated ? (
              <Link
                href="/checkout"
                onClick={toggleCart}
                className="btn-primary cart-checkout-btn"
              >
                FINALIZAR COMPRA
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={toggleCart}
                className="btn-primary cart-checkout-btn"
              >
                FAZER LOGIN PARA COMPRAR
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
