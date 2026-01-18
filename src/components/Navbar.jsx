import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const { isAuthenticated, signOut, profile, user } = useAuth();
  const { store } = useStore();
  const router = useRouter();

  const isActive = (path) => router.pathname === path;
  
  // Dynamic branding based on store
  const brandInfo = useMemo(() => {
    const defaultBrand = {
      name: 'Pastita',
      logo: '/pastita-logo.ico',
      primaryColor: '#722F37',
    };
    
    if (!store) return defaultBrand;
    
    // Check if it's Agrião
    const isAgriao = store.name?.toLowerCase().includes('agriao') || 
                     store.slug?.toLowerCase().includes('agriao');
    
    if (isAgriao) {
      return {
        name: store.name || 'Agrião',
        logo: store.logo_url || '/agriao-logo.png',
        primaryColor: '#4A5D23',
      };
    }
    
    return {
      name: store.name || 'Pastita',
      logo: store.logo_url || '/pastita-logo.ico',
      primaryColor: store.primary_color || '#722F37',
    };
  }, [store]);
  
  // Apply brand colors to CSS variables
  useEffect(() => {
    if (brandInfo.primaryColor) {
      document.documentElement.style.setProperty('--color-marsala', brandInfo.primaryColor);
    }
  }, [brandInfo.primaryColor]);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const displayName = useMemo(() => {
    const firstName = profile?.first_name?.trim();
    const lastName = profile?.last_name?.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const loginFirstName = user?.first_name?.trim();
    const loginLastName = user?.last_name?.trim();
    const loginFullName = [loginFirstName, loginLastName].filter(Boolean).join(' ');
    return fullName
      || loginFullName
      || profile?.email
      || profile?.phone
      || user?.email
      || user?.phone
      || 'Usuário';
  }, [profile, user]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileNavigate = (path) => {
    closeMobileMenu();
    router.push(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Dynamic Logo based on store */}
        <Link href="/" className="navbar-logo" onClick={closeMobileMenu} aria-label={brandInfo.name}>
          <img 
            src={brandInfo.logo} 
            alt={brandInfo.name} 
            className="navbar-logo-image"
            onError={(e) => {
              // Fallback to default logo on error
              e.currentTarget.src = '/pastita-logo.ico';
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link 
            href="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Início
          </Link>
          <Link 
            href="/cardapio" 
            className={`navbar-link ${isActive('/cardapio') ? 'active' : ''}`}
          >
            Cardápio
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link
                href="/perfil"
                className={`navbar-link ${isActive('/perfil') ? 'active' : ''}`}
              >
                Perfil
              </Link>
              <span className="navbar-user">
                Olá, {displayName}
              </span>
              <button onClick={signOut} className="navbar-link navbar-logout">
                Sair
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
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
          href="/"
          className={`navbar-mobile-link ${isActive('/') ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          Início
        </Link>
        <button
          type="button"
          className={`navbar-mobile-link ${isActive('/cardapio') ? 'active' : ''}`}
          onClick={() => handleMobileNavigate('/cardapio')}
        >
          Cardápio
        </button>
        
        {isAuthenticated ? (
          <>
            <button
              type="button"
              className={`navbar-mobile-link ${isActive('/perfil') ? 'active' : ''}`}
              onClick={() => handleMobileNavigate('/perfil')}
            >
              Perfil
            </button>
            <span className="navbar-mobile-user">
              Olá, {displayName}
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
            <button
              type="button"
              className={`navbar-mobile-link ${isActive('/login') ? 'active' : ''}`}
              onClick={() => handleMobileNavigate('/login')}
            >
              Login
            </button>
            <button
              type="button"
              className="navbar-mobile-link navbar-mobile-register"
              onClick={() => handleMobileNavigate('/registro')}
            >
              Criar conta
            </button>
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
