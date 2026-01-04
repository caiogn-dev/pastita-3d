import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={numberStyle}>404</div>
        
        <h1 style={titleStyle}>Página não encontrada</h1>
        <p style={subtitleStyle}>
          A página que você está procurando não existe ou foi movida.
        </p>

        <div style={buttonContainerStyle}>
          <Link to="/" style={primaryButtonStyle}>
            Voltar ao Início
          </Link>
          <Link to="/cardapio" style={secondaryButtonStyle}>
            Ver Cardápio
          </Link>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-cream)',
  padding: '20px',
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '50px 40px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
};

const numberStyle = {
  fontSize: '8rem',
  fontWeight: '800',
  color: 'var(--color-marsala)',
  lineHeight: '1',
  marginBottom: '16px',
  opacity: '0.2',
};

const titleStyle = {
  fontSize: '2rem',
  color: 'var(--color-marsala)',
  marginBottom: '12px',
  fontWeight: '700',
};

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#666',
  marginBottom: '32px',
};

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const primaryButtonStyle = {
  display: 'block',
  backgroundColor: 'var(--color-marsala)',
  color: '#fff',
  padding: '14px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
};

const secondaryButtonStyle = {
  display: 'block',
  backgroundColor: 'transparent',
  color: 'var(--color-marsala)',
  padding: '14px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  border: '2px solid var(--color-marsala)',
  transition: 'all 0.3s ease',
};

export default NotFound;
