import React from 'react'

export default function StickyNarrative({ steps, activeStep }) {
  const step = steps[activeStep] ?? steps[0]

  return (
    <aside className="sticky-narrative" style={wrapperStyle} aria-live="polite">
      <div style={cardStyle}>
        <span style={numberStyle}>{step.number}</span>
        <h2 style={titleStyle}>{step.title}</h2>
        <p style={subtitleStyle}>{step.subtitle}</p>
        {step.details?.length ? (
          <ul style={listStyle}>
            {step.details.map((item) => (
              <li key={item} style={listItemStyle}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {step.cta ? (
          <a href={step.ctaLink || '#pedido'} style={ctaStyle}>
            {step.cta}
          </a>
        ) : null}
      </div>
    </aside>
  )
}

const wrapperStyle = {
  position: 'fixed',
  top: '12%',
  left: '7%',
  zIndex: 3,
  width: 'min(420px, 85vw)',
  pointerEvents: 'none'
}

const cardStyle = {
  background: 'rgba(20, 2, 4, 0.65)',
  border: '1px solid rgba(212, 175, 55, 0.4)',
  padding: '2rem',
  backdropFilter: 'blur(8px)',
  pointerEvents: 'auto'
}

const numberStyle = {
  display: 'block',
  color: '#d4af37',
  fontFamily: 'monospace',
  letterSpacing: '5px',
  fontSize: '0.9rem'
}

const titleStyle = {
  color: '#f8f1e7',
  fontSize: 'clamp(1.6rem, 3vw, 2.3rem)',
  margin: '0.8rem 0',
  fontWeight: 700,
  lineHeight: 1.15
}

const subtitleStyle = {
  color: '#ffffff',
  opacity: 0.78,
  lineHeight: 1.6,
  marginBottom: '1rem'
}

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gap: '0.5rem',
  color: '#ffffff',
  opacity: 0.8
}

const listItemStyle = {
  fontSize: '0.95rem'
}

const ctaStyle = {
  display: 'inline-block',
  marginTop: '1.5rem',
  padding: '0.85rem 2.2rem',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontWeight: 700,
  background: '#d4af37',
  color: '#140204',
  textDecoration: 'none'
}
