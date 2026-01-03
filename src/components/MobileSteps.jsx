import React from 'react'

export default function MobileSteps({ steps }) {
  return (
    <div className="mobile-steps-container">
      {/* Header Hero Section */}
      <div style={headerStyle}>
        <h1 style={heroTitleStyle}>Pastita</h1>
        <p style={heroSubtitleStyle}>A massa perfeita para quem quer facilidade sem abrir mão do sabor</p>
      </div>

      {/* All Steps as Cards */}
      {steps.map((step, index) => (
        <div key={step.number} className="mobile-step-card">
          <span className="sn-number">{step.number}</span>
          <h2 className="sn-title">{step.title}</h2>
          <p className="sn-subtitle">{step.subtitle}</p>
          {step.details?.length ? (
            <ul className="sn-list">
              {step.details.map((item) => (
                <li key={item} className="sn-list-item">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {step.cta ? (
            <a href={step.ctaLink || '#pedido'} className="sn-cta">
              {step.cta}
            </a>
          ) : null}
        </div>
      ))}

      {/* Footer Spacing */}
      <div style={{ height: '2rem' }} />
    </div>
  )
}

const headerStyle = {
  textAlign: 'center',
  padding: '2rem 1.5rem',
  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
  borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
  marginBottom: '1rem'
}

const heroTitleStyle = {
  fontSize: '2.2rem',
  fontWeight: 700,
  color: '#d4af37',
  margin: '0 0 0.5rem 0',
  letterSpacing: '2px'
}

const heroSubtitleStyle = {
  fontSize: '1rem',
  color: '#ffffff',
  opacity: 0.85,
  margin: 0,
  lineHeight: 1.5
}
