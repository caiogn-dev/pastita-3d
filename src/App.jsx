import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import SmoothScroll from './components/SmoothScroll'
import RondelliFallAnimation from './components/RondelliFallAnimation'
import HeroPastita from './components/HeroPastita'
import ProductDescription from './components/ProductDescription'
import WhyPastita from './components/WhyPastita'
import UsageMoments from './components/UsageMoments'
import SauceSection from './components/SauceSection'
import FinalCTA from './components/FinalCTA'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const mainRef = useRef()
  const contentRef = useRef()
  const [activeStep, setActiveStep] = useState(0)
  const activeStepRef = useRef(0)

  const narrativeSteps = [
    {
      number: '01',
      title: 'Pastita.',
      subtitle: 'A massa perfeita pra quem quer facilidade sem abrir mão do sabor.',
      details: ['Rondellis artesanais, recheios generosos e molhos que abraçam a massa.'],
    },
    {
      number: '02',
      title: 'Sem complicar.',
      subtitle: 'Cozinhar bem não precisa ser complicado.',
      details: [
        'Você não precisa passar horas na cozinha.',
        'Nem errar ponto de massa ou fazer mil preparos.',
        'A Pastita resolve isso pra você.',
      ],
    },
    {
      number: '03',
      title: 'O produto aparece.',
      subtitle: 'Rondellis artesanais, prontos pra impressionar.',
      details: [
        'Massa leve e macia.',
        'Recheio de verdade.',
        'Molhos que finalizam o prato. É só montar, aquecer e servir.',
      ],
    },
    {
      number: '04',
      title: 'Pra hoje. Pra família. Pra impressionar.',
      subtitle: 'Pastita se adapta ao seu momento.',
      details: ['Almoço em família.', 'Jantar especial.', 'Visita de última hora.'],
    },
    {
      number: '05',
      title: 'Seu prato principal começa aqui.',
      subtitle: 'Nada industrial. Nada sem graça. Só receita pensada, produção cuidadosa e sabor consistente.',
      details: ['👉 Peça agora'],
      cta: 'Peça agora',
    },
  ]

  useGSAP(() => {
    // Animação refinada: Texto surge com fade e um leve movimento lateral
    gsap.utils.toArray('.content-block').forEach((box, i) => {
      gsap.fromTo(box,
        { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
        { 
          opacity: 1, x: 0, 
          scrollTrigger: {
            trigger: box,
            start: "top 85%",
            end: "top 40%",
            scrub: true
          }
        }
      },
    })
  }, { scope: mainRef })

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
          <HeroPastita />
          <ProductDescription />
          <WhyPastita />
          <UsageMoments />
          <SauceSection />
          <FinalCTA />
        </div>
      </div>
    </SmoothScroll>
  )
}

// --- ESTILOS REFINADOS ---

const mainWrapperStyle = {
  backgroundColor: '#140204', // Marsala mais fechado (quase preto)
  width: '100%',
  minHeight: '640vh',
  position: 'relative',
}

const vignetteStyle = {
  position: 'fixed',
  top: 0,
  width: '100vw',
  height: '100vh',
  background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(20,2,4,1) 90%)',
  zIndex: 1,
  pointerEvents: 'none'
}
