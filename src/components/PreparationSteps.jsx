import React from 'react'

export default function PreparationSteps() {
  return (
    <section style={sectionStyle} data-step="6">
      <div className="content-block" style={cardStyle}>
        <span style={numberStyle}>06</span>
        <h2 style={titleStyle}>Modo Pastita: rápido e sem erro.</h2>
        <ol style={listStyle}>
          <li>Preaqueça o forno e aqueça o molho.</li>
          <li>Monte os rondellis, cubra com o molho.</li>
          <li>Finalizou? É só servir.</li>
        </ol>
        <div style={metaStyle}>
          <span>⏱️ 20 min</span>
          <span>🍽️ 2 a 3 porções</span>
        </div>
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

const metaStyle = {
  marginTop: '1.8rem',
  display: 'flex',
  gap: '1.5rem',
  color: '#d4af37',
  fontWeight: 600
}
