import React from 'react';
import { Link } from 'react-router-dom';
import InteractiveModel from '../components/InteractiveModel';
import Navbar from '../components/Navbar';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="container hero-container">
          
          {/* Lado Esquerdo: Texto */}
          <div className="hero-text">
            <span className="hero-eyebrow">
              Artesanal & Prático
            </span>
            <h1 className="hero-title">
              O Verdadeiro Sabor Italiano em Minutos.
            </h1>
            <p className="hero-description">
              Massas frescas, recheios generosos e a praticidade que você precisa. 
              Tire do freezer, aqueça e impressione.
            </p>
            <div className="hero-buttons">
              <Link to="/cardapio" className="btn-primary">Ver Cardápio</Link>
              <a href="#como-funciona" className="btn-secondary">Como Funciona</a>
            </div>
          </div>

          {/* Lado Direito: 3D Interativo */}
          <div className="hero-3d">
            <InteractiveModel />
          </div>

        </div>
        
        {/* Background Decorativo */}
        <div className="hero-bg-decoration"></div>
      </header>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Simples assim</span>
            <h2 className="section-title">Como Funciona</h2>
          </div>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Escolha</h3>
              <p>Navegue pelo nosso cardápio e escolha suas massas favoritas.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Receba</h3>
              <p>Entregamos congelado na sua casa, pronto para armazenar.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Prepare</h3>
              <p>Tire do freezer, aqueça em minutos e sirva uma refeição incrível.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Por que Pastita Section */}
      <section className="why-pastita">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Diferenciais</span>
            <h2 className="section-title">Por que escolher Pastita?</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🍝</span>
              <h3>Massa Artesanal</h3>
              <p>Feita com ingredientes selecionados e muito carinho.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⏱️</span>
              <h3>Pronto em Minutos</h3>
              <p>Do freezer para a mesa em menos de 15 minutos.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🧀</span>
              <h3>Recheios Generosos</h3>
              <p>Cada mordida é uma explosão de sabor.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Entrega Congelada</h3>
              <p>Mantém a qualidade e frescor até você.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para experimentar?</h2>
            <p>Descubra o sabor autêntico das massas artesanais Pastita.</p>
            <Link to="/cardapio" className="btn-primary btn-large">
              Ver Cardápio Completo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>PASTITA</h3>
              <p>Massas artesanais com o verdadeiro sabor italiano.</p>
            </div>
            <div className="footer-links">
              <h4>Links</h4>
              <Link to="/">Início</Link>
              <Link to="/cardapio">Cardápio</Link>
              <Link to="/login">Login</Link>
            </div>
            <div className="footer-contact">
              <h4>Contato</h4>
              <p>contato@pastita.com.br</p>
              <p>(11) 99999-9999</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Pastita. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;