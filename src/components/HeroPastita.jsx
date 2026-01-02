import React from 'react'

export default function HeroPastita() {
  return (
    <section style={sectionStyle}>
      <div className="content-block" style={cardStyle}>
        <span style={eyebrowStyle}>Pastita</span>
        <h1 style={titleStyle}>A massa perfeita pra quem quer facilidade sem abrir mão do sabor.</h1>
        <p style={subtitleStyle}>
          Rondellis artesanais, recheios generosos e molhos que abraçam a massa.
        </p>
        <button style={primaryButtonStyle}>Quero experimentar</button>
      </div>
    </section>
  )
}

const sectionStyle = {
  minHeight: '120vh',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10%',
  pointerEvents: 'none'
}

const cardStyle = {
  maxWidth: '520px',
  padding: '2.5rem',
  borderLeft: '2px solid #d4af37',
  pointerEvents: 'all'
}

const eyebrowStyle = {
  textTransform: 'uppercase',
  letterSpacing: '4px',
  fontSize: '0.85rem',
  color: '#d4af37',
  fontWeight: 600
}

const titleStyle = {
  fontSize: 'clamp(2.6rem, 6vw, 4.8rem)',
  color: '#f8f1e7',
  margin: '1rem 0 0',
  fontWeight: 700,
  lineHeight: 1.05
}

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#ffffff',
  opacity: 0.72,
  marginTop: '1.5rem',
  lineHeight: 1.7
}

const primaryButtonStyle = {
  marginTop: '2.5rem',
  background: '#d4af37',
  color: '#140204',
  padding: '1rem 2.8rem',
  border: 'none',
  borderRadius: '2px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  cursor: 'pointer'
}
