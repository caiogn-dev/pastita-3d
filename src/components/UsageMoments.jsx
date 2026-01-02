import React from 'react'

export default function UsageMoments() {
  return (
    <section style={sectionStyle}>
      <div className="content-block" style={cardStyle}>
        <span style={numberStyle}>03</span>
        <h2 style={titleStyle}>Pra hoje. Pra família. Pra impressionar.</h2>
        <div style={pillGroupStyle}>
          <span style={pillStyle}>Almoço em família</span>
          <span style={pillStyle}>Jantar especial</span>
          <span style={pillStyle}>Visita de última hora</span>
        </div>
        <p style={subtitleStyle}>Pastita se adapta ao seu momento.</p>
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
  margin: '1rem 0 1.5rem',
  fontWeight: 600,
  lineHeight: 1.1
}

const pillGroupStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.8rem'
}

const pillStyle = {
  padding: '0.6rem 1.2rem',
  border: '1px solid rgba(212, 175, 55, 0.6)',
  borderRadius: '999px',
  color: '#ffffff',
  fontSize: '0.95rem',
  letterSpacing: '0.5px'
}

const subtitleStyle = {
  marginTop: '1.8rem',
  color: '#ffffff',
  opacity: 0.7,
  fontSize: '1.05rem'
}
