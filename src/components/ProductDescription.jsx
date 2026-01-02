import React from 'react'

export default function ProductDescription() {
  return (
    <section style={sectionStyle}>
      <div className="content-block" style={cardStyle}>
        <span style={numberStyle}>01</span>
        <h2 style={titleStyle}>Rondellis artesanais, prontos pra impressionar.</h2>
        <ul style={listStyle}>
          <li>Massa leve e macia</li>
          <li>Recheio de verdade</li>
          <li>Molhos que finalizam o prato</li>
        </ul>
        <p style={subtitleStyle}>É só montar, aquecer e servir.</p>
      </div>
    </section>
  )
}

const sectionStyle = {
  minHeight: '110vh',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10%',
  pointerEvents: 'none'
}

const cardStyle = {
  maxWidth: '480px',
  padding: '2.3rem',
  borderLeft: '2px solid #d4af37',
  pointerEvents: 'all'
}

const numberStyle = {
  display: 'block',
  fontSize: '0.9rem',
  color: '#d4af37',
  fontFamily: 'monospace',
  letterSpacing: '5px'
}

const titleStyle = {
  fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
  color: '#f8f1e7',
  margin: '1rem 0 1.2rem',
  fontWeight: 600,
  lineHeight: 1.1
}

const listStyle = {
  margin: 0,
  paddingLeft: '1.2rem',
  color: '#ffffff',
  opacity: 0.75,
  lineHeight: 1.8
}

const subtitleStyle = {
  marginTop: '1.5rem',
  color: '#ffffff',
  opacity: 0.7,
  fontSize: '1.05rem'
}
