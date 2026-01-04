// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import InteractiveModel from '../components/InteractiveModel';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navbar Simplificada */}
      <nav style={{ padding: '20px 0', borderBottom: '1px solid #eee' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'var(--color-marsala)', fontSize: '24px' }}>PASTITA</h1>
          <div style={{ display: 'flex', gap: '20px' }}>
             <Link to="/cardapio" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '500' }}>Cardápio</Link>
             <Link to="/login" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: '500' }}>Login</Link>
             <Link to="/cardapio" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Peça Agora</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          
          {/* Lado Esquerdo: Texto */}
          <div className="hero-text">
            <span style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
              Artesanal & Prático
            </span>
            <h1 style={{ fontSize: '4rem', lineHeight: '1.1', margin: '15px 0 25px' }}>
              O Verdadeiro Sabor Italiano em Minutos.
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '40px', maxWidth: '500px' }}>
              Massas frescas, recheios generosos e a praticidade que você precisa. 
              Tire do freezer, aqueça e impressione.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/cardapio" className="btn-primary">Ver Cardápio</Link>
              <Link to="/sobre" className="btn-secondary">Como Funciona</Link>
            </div>
          </div>

          {/* Lado Direito: 3D Interativo */}
          <div className="hero-3d" style={{ height: '600px' }}>
            <InteractiveModel />
          </div>

        </div>
        
        {/* Background Decorativo (Opcional) */}
        <div style={{ 
          position: 'absolute', 
          top: 0, right: 0, width: '40%', height: '100%', 
          backgroundColor: '#f0e6e6', zIndex: -1, 
          borderBottomLeftRadius: '200px' 
        }}></div>
      </header>
    </div>
  );
};

export default LandingPage;