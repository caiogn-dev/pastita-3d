import React from 'react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="status-page">
      <div className="status-card">
        <div className="status-number">404</div>

        <h1 className="status-title">Pagina nao encontrada</h1>
        <p className="status-subtitle">
          A pagina que voce esta procurando nao existe ou foi movida.
        </p>

        <div className="status-actions">
          <Link href="/" className="status-button status-button-primary">
            Voltar ao inicio
          </Link>
          <Link href="/cardapio" className="status-button status-button-secondary">
            Ver cardapio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
