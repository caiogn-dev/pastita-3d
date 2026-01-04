const StickyNarrative = ({ steps, activeStep, cardRef }) => {
  const step = steps[activeStep];
  if (!step) return null;

  return (
    <div className="sticky-narrative">
      <div ref={cardRef} className="sticky-narrative-card">
        <span className="sn-number">{step.number}</span>
        <h2 className="sn-title">{step.title}</h2>
        <p className="sn-subtitle">{step.subtitle}</p>
        
        {step.details && (
          <ul className="sn-list">
            {step.details.map((detail, i) => (
              <li key={i} className="sn-list-item">{detail}</li>
            ))}
          </ul>
        )}

        {step.cta && (
          <a href={step.ctaLink} className="sn-cta">
            {step.cta}
          </a>
        )}
      </div>
    </div>
  );
};

export default StickyNarrative;