import React from 'react'

export default function FinalCTA() {
  return (
    <section style={sectionStyle}>
      <div className="content-block" style={cardStyle}>
        <h2 style={titleStyle}>Seu prato principal começa aqui.</h2>
        <p style={subtitleStyle}>Pastita entrega o sabor e o cuidado que fazem o almoço virar ocasião.</p>
        <button style={buttonStyle}>Peça agora</button>
      </div>
    </section>
  )
}

const sectionStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 10%',
  pointerEvents: 'none'
}

const cardStyle = {
  textAlign: 'center',
  maxWidth: '620px',
  pointerEvents: 'all'
}

const titleStyle = {
  fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
  color: '#f8f1e7',
  marginBottom: '1.2rem',
  fontWeight: 700,
  lineHeight: 1.1
}

const subtitleStyle = {
  color: '#ffffff',
  opacity: 0.72,
  fontSize: '1.1rem',
  lineHeight: 1.6
}

const buttonStyle = {
  marginTop: '2.5rem',
  background: 'transparent',
  color: '#d4af37',
  padding: '1rem 3rem',
  border: '1px solid #d4af37',
  borderRadius: '2px',
  fontWeight: 700,
  letterSpacing: '3px',
  textTransform: 'uppercase',
  cursor: 'pointer'
}
