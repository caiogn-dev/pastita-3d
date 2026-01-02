import React from 'react'

export default function WhyPastita() {
  return (
    <section style={sectionStyle}>
      <div className="content-block" style={cardStyle}>
        <span style={numberStyle}>02</span>
        <h2 style={titleStyle}>Cozinhar bem não precisa ser complicado.</h2>
        <p style={subtitleStyle}>Você não precisa:</p>
        <ul style={listStyle}>
          <li>Passar horas na cozinha</li>
          <li>Errar ponto de massa</li>
          <li>Fazer mil preparos</li>
        </ul>
        <p style={subtitleEmphasisStyle}>A Pastita resolve isso pra você.</p>
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
  maxWidth: '500px',
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
  opacity: 0.65,
  margin: 0,
  fontSize: '1rem'
}

const listStyle = {
  listStyle: 'none',
  margin: '1rem 0 1.5rem',
  padding: 0,
  color: '#ffffff',
  opacity: 0.75,
  lineHeight: 1.8
}

const subtitleEmphasisStyle = {
  color: '#d4af37',
  margin: 0,
  fontWeight: 600,
  fontSize: '1.05rem'
}
