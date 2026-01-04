import React from 'react'

export default function SauceSection() {
  return (
    <section style={sectionStyle} data-step="7">
      <div className="content-block" style={cardStyle}>
        <span style={numberStyle}>07</span>
        <h2 style={titleStyle}>Molhos artesanais que abraçam cada rondelli.</h2>
        <p style={subtitleStyle}>
          Nada industrial. Nada sem graça. Receitas pensadas para realçar o recheio e deixar o prato
          com acabamento de restaurante.
        </p>
        <div style={checklistStyle}>
          <span>✔️ Receita pensada</span>
          <span>✔️ Produção cuidadosa</span>
          <span>✔️ Sabor consistente</span>
        </div>
      </div>
    </section>
  )
}

const sectionStyle = {
  minHeight: '110vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 10%',
  pointerEvents: 'none'
}

const cardStyle = {
  maxWidth: '520px',
  padding: '2.3rem',
  borderRight: '2px solid #d4af37',
  textAlign: 'right',
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

const subtitleStyle = {
  color: '#ffffff',
  opacity: 0.7,
  margin: 0,
  fontSize: '1.05rem',
  lineHeight: 1.7
}

const checklistStyle = {
  marginTop: '1.8rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  color: '#d4af37',
  fontWeight: 600
}
