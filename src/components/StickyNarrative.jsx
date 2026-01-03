import React from 'react'

export default function StickyNarrative({ steps, activeStep, cardRef }) {
  const step = steps[activeStep] ?? steps[0]

  return (
    <aside className="sticky-narrative" aria-live="polite">
      <div ref={cardRef} className="sticky-narrative-card">
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
    </aside>
  )
}
