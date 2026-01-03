import React, { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import SmoothScroll from './components/SmoothScroll'
import RondelliFallAnimation from './components/RondelliFallAnimation'
import StickyNarrative from './components/StickyNarrative'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const mainRef = useRef(null)
  const narrativeCardRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)

  const narrativeSteps = [
    {
      number: '01',
      title: 'Pastita.',
      subtitle: 'A massa perfeita pra quem quer facilidade sem abrir mão do sabor.',
      details: ['Rondellis artesanais, recheios generosos e molhos que abraçam a massa.'],
      cta: 'Quero experimentar',
      ctaLink: '#pedido'
    },
    {
      number: '02',
      title: 'Rondellis artesanais, prontos pra impressionar.',
      subtitle: 'Massa leve e macia. Recheio de verdade.',
      details: [
        'Molhos que finalizam o prato.',
        'É só montar, aquecer e servir.',
      ],
    },
    {
      number: '03',
      title: 'Cozinhar bem não precisa ser complicado.',
      subtitle: 'A Pastita resolve isso pra você.',
      details: [
        'Você não precisa passar horas na cozinha.',
        'Nem errar ponto de massa.',
        'Nem fazer mil preparos.',
      ],
    },
    {
      number: '04',
      title: 'Pra hoje. Pra família. Pra impressionar.',
      subtitle: 'Pastita se adapta ao seu momento.',
      details: [
        'Almoço em família.',
        'Jantar especial.',
        'Visita de última hora.',
      ],
    },
    {
      number: '05',
      title: 'Combinações que fazem o prato brilhar.',
      subtitle: 'Escolha o molho ideal pro momento.',
      details: ['Pomodoro rústico.', 'Creme de queijo.', 'Molho da casa.'],
    },
    {
      number: '06',
      title: 'Quem prova, pede de novo.',
      subtitle: 'O sabor Pastita já virou escolha rápida pra muita gente.',
      details: ['+1.200 pratos servidos.', '98% voltariam a comprar.', '4,9★ avaliação média.'],
    },
    {
      number: '07',
      title: 'Modo Pastita: rápido e sem erro.',
      subtitle: 'É só montar, aquecer e servir.',
      details: ['20 minutos do forno à mesa.', 'Rende 2 a 3 porções.', 'Sem complicação.'],
    },
    {
      number: '08',
      title: 'Nada industrial. Nada sem graça.',
      subtitle: 'Receita pensada, produção cuidadosa, sabor consistente.',
      details: ['✔️ Receita pensada', '✔️ Produção cuidadosa', '✔️ Sabor consistente'],
    },
    {
      number: '09',
      title: 'Seu prato principal começa aqui.',
      subtitle: 'Seu próximo almoço com cara de ocasião começa com Pastita.',
      details: ['Prato principal pronto em minutos.'],
      cta: 'Peça agora',
      ctaLink: '#pedido'
    },
  ]

  useGSAP(
    () => {
      // narrativa sincronizada
      gsap.utils.toArray('section[data-step]').forEach((section) => {
        const stepIndex = Number(section.dataset.step)
        ScrollTrigger.create({
          trigger: section,
          start: 'top 40%',
          end: 'bottom 35%',
          onEnter: () => {
            setActiveStep(stepIndex)
            gsap.fromTo(
              narrativeCardRef.current,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            )
          },
          onEnterBack: () => {
            setActiveStep(stepIndex)
            gsap.fromTo(
              narrativeCardRef.current,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            )
          },
        })
      })
    },
    { scope: mainRef }
  )

  return (
    <SmoothScroll>
      <div
        ref={mainRef}
        className="main-wrapper"
        style={{ ...mainWrapperStyle, minHeight: `${narrativeSteps.length * 120}vh` }}
      >
        {/* Background Marsala Profundo com Vinheta */}
        <div style={vignetteStyle} />

        {/* Camada 3D Fixa */}
        <RondelliFallAnimation />

        {/* Interface Editorial */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <StickyNarrative
            steps={narrativeSteps}
            activeStep={activeStep}
            cardRef={narrativeCardRef}
          />
          {narrativeSteps.map((step, index) => (
            <section
              key={step.number}
              data-step={index}
              style={narrativeSectionStyle}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </SmoothScroll>
  )
}

// --- ESTILOS REFINADOS ---

const mainWrapperStyle = {
  backgroundColor: '#140204', // Marsala mais fechado (quase preto)
  width: '100%',
  position: 'relative',
}

const vignetteStyle = {
  position: 'fixed',
  top: 0,
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
