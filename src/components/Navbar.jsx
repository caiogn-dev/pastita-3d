import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const { isAuthenticated, signOut, profile } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          PASTITA
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link 
            to="/cardapio" 
            className={`navbar-link ${isActive('/cardapio') ? 'active' : ''}`}
          >
            Cardapio
          </Link>
          
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                Ola, {profile?.first_name || 'Usuario'}
              </span>
              <button onClick={signOut} className="navbar-link navbar-logout">
                Sair
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
            >
              Login
            </Link>
          )}
        </div>

        {/* Cart Button */}
        <button onClick={toggleCart} className="navbar-cart-btn">
          <span className="cart-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M6 6h15l-1.5 9h-12zM6 6l-1.5-3h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="cart-text">Carrinho</span>
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </button>

        {/* Mobile Menu Button */}
        <button 
          className={`navbar-mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link 
          to="/" 
          className={`navbar-mobile-link ${isActive('/') ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Inicio
        </Link>
        <Link 
          to="/cardapio" 
          className={`navbar-mobile-link ${isActive('/cardapio') ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Cardapio
        </Link>
        
        {isAuthenticated ? (
          <>
            <span className="navbar-mobile-user">
              Ola, {profile?.first_name || 'Usuario'}
            </span>
            <button 
              onClick={() => { signOut(); closeMobileMenu(); }} 
              className="navbar-mobile-link navbar-mobile-logout"
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`navbar-mobile-link ${isActive('/login') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Login
            </Link>
            <Link 
              to="/registro" 
              className="navbar-mobile-link navbar-mobile-register"
              onClick={closeMobileMenu}
            >
              Criar Conta
            </Link>
          </>
        )}
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="navbar-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;
