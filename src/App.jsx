import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import SmoothScroll from './components/SmoothScroll'
import RondelliFallAnimation from './components/RondelliFallAnimation'
import StickyNarrative from './components/StickyNarrative'
import MobileSteps from './components/MobileSteps'
import Menu from './components/Menu' // Importação do cardápio

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const mainRef = useRef(null)
  const narrativeCardRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const narrativeSteps = [
    {
      number: '01',
      title: 'Pastita.',
      subtitle: 'A massa perfeita pra quem quer facilidade sem abrir mão do sabor.',
      details: ['Rondellis artesanais, recheios generosos e molhos que abraçam a massa.'],
      cta: 'Quero experimentar',
      ctaLink: '#cardapio'
    },
    // ... (Mantenha seus passos 02 a 08 aqui conforme seu código original)
    {
      number: '09',
      title: 'Seu prato principal começa aqui.',
      subtitle: 'Seu próximo almoço com cara de ocasião começa com Pastita.',
      details: ['Prato principal pronto em minutos.'],
      cta: 'Peça agora',
      ctaLink: '#cardapio'
    },
  ]

  useGSAP(() => {
    if (isMobile) return
    gsap.utils.toArray('section[data-step]').forEach((section) => {
      const stepIndex = Number(section.dataset.step)
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 35%',
        onEnter: () => setActiveStep(stepIndex),
        onEnterBack: () => setActiveStep(stepIndex),
      })
    })
  }, { scope: mainRef, dependencies: [isMobile] })

  return (
    <SmoothScroll>
      <div
        ref={mainRef}
        className="main-wrapper"
        style={isMobile ? mobileMainWrapperStyle : desktopMainWrapperStyle}
      >
        {!isMobile && <div className="vignette-overlay" style={vignetteStyle} />}
        {!isMobile && <RondelliFallAnimation />}

        <div style={{ position: 'relative', zIndex: 2 }}>
          {!isMobile ? (
            <>
              <StickyNarrative
                steps={narrativeSteps}
                activeStep={activeStep}
                cardRef={narrativeCardRef}
              />
              {narrativeSteps.map((step, index) => (
                <section key={step.number} data-step={index} style={narrativeSectionStyle} />
              ))}
            </>
          ) : (
            <MobileSteps steps={narrativeSteps} />
          )}

          {/* Seção do Cardápio inserida no fluxo */}
          <div id="cardapio" style={{ backgroundColor: '#140204', position: 'relative', zIndex: 10 }}>
            <Menu />
          </div>
        </div>
      </div>
    </SmoothScroll>
  )
}

// --- ESTILOS (DEFINIÇÕES OBRIGATÓRIAS) ---

const desktopMainWrapperStyle = {
  backgroundColor: '#140204',
  width: '100%',
  position: 'relative',
  minHeight: 'auto' 
}

const mobileMainWrapperStyle = {
  backgroundColor: '#140204',
  width: '100%',
  position: 'relative',
  minHeight: 'auto'
}

const vignetteStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(20,2,4,1) 90%)',
  zIndex: 1,
  pointerEvents: 'none',
}

const narrativeSectionStyle = {
  minHeight: '115vh',
  pointerEvents: 'none',
}