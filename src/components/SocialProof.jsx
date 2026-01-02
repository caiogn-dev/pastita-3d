import React from 'react'

export default function SocialProof() {
  return (
    <section style={sectionStyle} data-step="5">
      <div className="content-block" style={cardStyle}>
        <span style={numberStyle}>05</span>
        <h2 style={titleStyle}>Quem prova, pede de novo.</h2>
        <p style={subtitleStyle}>
          A Pastita já virou escolha rápida pra quem quer sabor de verdade sem complicar a rotina.
        </p>
        <div style={statsStyle}>
          <div>
            <strong style={statValueStyle}>+1.200</strong>
            <span style={statLabelStyle}>pratos servidos</span>
          </div>
          <div>
            <strong style={statValueStyle}>98%</strong>
            <span style={statLabelStyle}>voltariam a comprar</span>
          </div>
          <div>
            <strong style={statValueStyle}>4,9★</strong>
            <span style={statLabelStyle}>avaliação média</span>
          </div>
        </div>
        <blockquote style={quoteStyle}>
          “Prático de verdade. Eu monto, aqueço e sai com cara de jantar especial.”
        </blockquote>
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

const statsStyle = {
  marginTop: '1.8rem',
  display: 'grid',
  gap: '1rem',
  color: '#ffffff',
  opacity: 0.85
}

const statValueStyle = {
  display: 'block',
  fontSize: '1.8rem',
  color: '#d4af37'
}

const statLabelStyle = {
  fontSize: '0.95rem',
  letterSpacing: '0.5px'
}

const quoteStyle = {
  marginTop: '1.6rem',
  color: '#f8f1e7',
  fontStyle: 'italic'
}
