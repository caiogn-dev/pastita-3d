import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const PROMO_STORAGE_KEY = 'pastitaPromoSeen';
const PROMO_EVENT = 'pastita-promo';

const subscribePromo = (callback) => {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener(PROMO_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(PROMO_EVENT, handler);
  };
};

const getPromoSnapshot = () => {
  if (typeof window === 'undefined') return true;
  return Boolean(sessionStorage.getItem(PROMO_STORAGE_KEY));
};

const getPromoServerSnapshot = () => true;

const LandingPage = () => {
  const hasSeenPromo = useSyncExternalStore(
    subscribePromo,
    getPromoSnapshot,
    getPromoServerSnapshot
  );
  const [promoDismissed, setPromoDismissed] = useState(false);
  const showPromo = !hasSeenPromo && !promoDismissed;

  const handleClosePromo = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PROMO_STORAGE_KEY, '1');
      window.dispatchEvent(new Event(PROMO_EVENT));
    }
    setPromoDismissed(true);
  };

  return (
    <div className="landing-page">
      <Navbar />

      {showPromo && (
        <div className="promo-modal-overlay" onClick={handleClosePromo} role="presentation">
          <div
            className="promo-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Promoção Pastita 10% OFF"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="promo-close" onClick={handleClosePromo} aria-label="Fechar promoção">
              x
            </button>
            <div className="promo-badge">Novidade</div>
            <h3>Ganhe 10% OFF no primeiro pedido</h3>
            <p>
              Crie sua conta agora e receba um cupom exclusivo para usar na primeira compra.
              Válido para pedidos feitos pelo site.
            </p>
            <div className="promo-actions">
              <Link href="/registro" className="btn-primary">Criar conta e ganhar 10%</Link>
              <button type="button" className="btn-secondary" onClick={handleClosePromo}>
                Ver cardápio primeiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="hero-section">
        <div className="container hero-container">

          {/* Lado Esquerdo: Texto */}
          <div className="hero-text">
            <span className="hero-eyebrow">
              Artesanal & Prático
            </span>
            <h1 className="hero-title">
              O verdadeiro sabor italiano em minutos.
            </h1>
            <p className="hero-description">
              Massas frescas, recheios generosos e a praticidade que você precisa.
              Tire do freezer, aqueça e impressione.
            </p>
            <div className="hero-buttons">
              <Link href="/cardapio" className="btn-primary">Ver cardápio</Link>
              <a href="#como-funciona" className="btn-secondary">Como funciona</a>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-image-frame">
              <img
                src="/4queijos.webp"
                alt="Rondelli quatro queijos Pastita"
                className="hero-image"
                loading="eager"
              />
            </div>
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
            <h2 className="section-title">Como funciona</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Escolha</h3>
              <p>Navegue pelo nosso cardápio e escolha suas massas favoritas.</p>
            </div>
            <div className="step-arrow" aria-hidden="true">
              <svg viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8h30" />
                <path d="M26 3l6 5-6 5" />
              </svg>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Receba</h3>
              <p>Entregamos congelado na sua casa, pronto para armazenar.</p>
            </div>
            <div className="step-arrow" aria-hidden="true">
              <svg viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8h30" />
                <path d="M26 3l6 5-6 5" />
              </svg>
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
              <span className="feature-icon">
                <img
                  src="/hat-chef.svg"
                  alt="Chef artesanal"
                  className="feature-icon-image"
                />
              </span>
              <h3>Massa artesanal</h3>
              <p>Feita com ingredientes selecionados e muito carinho.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <img
                  src="/alarm-clock.svg"
                  alt="Pronto em minutos"
                  className="feature-icon-image"
                />
              </span>
              <h3>Pronto em minutos</h3>
              <p>Do freezer para a mesa em menos de 15 minutos.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <img
                  src="/heart-partner-handshake.svg"
                  alt="Feito com carinho"
                  className="feature-icon-image"
                />
              </span>
              <h3>Recheios generosos</h3>
              <p>Cada mordida é uma explosão de sabor.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">
                <img
                  src="/snowflake.svg"
                  alt="Entrega congelada"
                  className="feature-icon-image"
                />
              </span>
              <h3>Entrega congelada</h3>
              <p>Mantém a qualidade e o frescor até você.</p>
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
            <Link href="/cardapio" className="btn-primary btn-large">
              Ver cardápio completo
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
              <Link href="/">Início</Link>
              <Link href="/cardapio">Cardápio</Link>
              <Link href="/login">Login</Link>
            </div>
            <div className="footer-contact">
              <h4>Contato</h4>
              <p>contato@pastita.com.br</p>
              <a href="https://api.whatsapp.com/send?phone=556391172166">WhatsApp</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>(C) 2026 Pastita. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
