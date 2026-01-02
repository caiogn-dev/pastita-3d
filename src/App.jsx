import React, { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import SmoothScroll from './components/SmoothScroll'
import SceneContent from './components/SceneContent'

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
      cta: 'Quero experimentar',
    },
    {
      number: '02',
      title: 'Produto em cena.',
      subtitle: 'Rondellis artesanais, prontos pra impressionar.',
      details: [
        'Massa leve e macia.',
        'Recheio de verdade.',
        'Molhos que finalizam o prato. É só montar, aquecer e servir.',
      ],
    },
    {
      number: '03',
      title: 'Movimento que abre apetite.',
      subtitle: 'Como se os rondellis estivessem sendo servidos direto na travessa.',
      details: [
        'Entrada de cima pra baixo, como se estivessem chegando direto na travessa.',
        'Leve gravidade, rotação suave, impacto delicado.',
      ],
    },
    {
      number: '04',
      title: 'Cozinhar bem não precisa ser complicado.',
      subtitle: 'A Pastita resolve isso pra você.',
      details: [
        'Você não precisa passar horas na cozinha.',
        'Pra hoje. Pra família. Pra impressionar.',
        'Almoço em família, jantar especial, visita de última hora.',
      ],
    },
    {
      number: '05',
      title: 'Seu prato principal começa aqui.',
      subtitle: 'Nada industrial. Nada sem graça.',
      details: ['✔️ Receita pensada', '✔️ Produção cuidadosa', '✔️ Sabor consistente'],
      cta: 'Peça agora',
    },
  ]

  useGSAP(() => {
    const segment = 1 / narrativeSteps.length
    const copyDelay = segment * 0.15
    const card = contentRef.current
    const setOpacity = gsap.quickSetter(card, 'opacity')
    const setY = gsap.quickSetter(card, 'y', 'px')
    const setScale = gsap.quickSetter(card, 'scale')

    gsap.set(card, { opacity: 0, y: 40, scale: 0.96 })

    ScrollTrigger.create({
      trigger: mainRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress
        const currentSegment = Math.min(
          narrativeSteps.length - 1,
          Math.floor(progress / segment)
        )
        const segmentStart = currentSegment * segment
        const segmentEnd = segmentStart + segment
        const localProgress = gsap.utils.mapRange(segmentStart, segmentEnd, 0, 1, progress)
        const eased = gsap.parseEase('power2.out')(localProgress)

        setOpacity(gsap.utils.interpolate(0.2, 1, eased))
        setY(gsap.utils.interpolate(60, 0, eased))
        setScale(gsap.utils.interpolate(0.94, 1, eased))

        const delayedIndex = Math.min(
          narrativeSteps.length - 1,
          Math.floor(Math.max(0, progress - copyDelay) / segment)
        )

        if (delayedIndex !== activeStepRef.current) {
          activeStepRef.current = delayedIndex
          setActiveStep(delayedIndex)
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
        <div style={canvasContainerStyle}>
          <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
            <Environment preset="city" />
            
            {/* Iluminação de Estúdio Premium */}
            <ambientLight intensity={0.3} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#fff" />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#630d16" />
            <rectAreaLight width={5} height={5} intensity={5} position={[0, 5, -5]} color="#d4af37" />

            <Suspense fallback={null}>
              <SceneContent url="/embalagem.glb" textureUrl="/design.png" />
            </Suspense>
            
            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={3} far={4.5} />
          </Canvas>
        </div>

        {/* Interface Editorial */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={storyLayerStyle}>
            <div ref={contentRef} className="content-box" style={cardStyle}>
              <span style={numberStyle}>{narrativeSteps[activeStep].number}</span>
              <h1 style={titleStyle}>{narrativeSteps[activeStep].title}</h1>
              <p style={subtitleStyle}>{narrativeSteps[activeStep].subtitle}</p>
              {narrativeSteps[activeStep].details?.map((text) => (
                <p key={text} style={detailStyle}>{text}</p>
              ))}
              {narrativeSteps[activeStep].cta && (
                <button style={btnStyle}>{narrativeSteps[activeStep].cta}</button>
              )}
            </div>
          </div>
          {narrativeSteps.map((step) => (
            <section key={step.number} style={sectionStyle} aria-hidden="true" />
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
  minHeight: '600vh',
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

const canvasContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  zIndex: 0
}

const sectionStyle = {
  height: '120vh', // Mais espaço entre seções para menos poluição
  display: 'flex',
  alignItems: 'center',
  padding: '0 10%',
  pointerEvents: 'none',
}

const storyLayerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10%',
  pointerEvents: 'none',
}

const cardStyle = {
  padding: '2rem',
  borderLeft: '2px solid #d4af37',
  maxWidth: '450px',
  pointerEvents: 'all'
}

const numberStyle = {
  display: 'block',
  fontSize: '1rem',
  color: '#d4af37',
  fontFamily: 'monospace',
  letterSpacing: '5px',
  marginBottom: '1rem'
}

const titleStyle = { 
  fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
  color: '#d4af37', 
  margin: 0, 
  fontWeight: '900',
  lineHeight: 0.9,
  letterSpacing: '-2px',
  textTransform: 'uppercase',
  fontFamily: 'sans-serif'
}

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#ffffff',
  opacity: 0.7,
  marginTop: '1.5rem',
  fontFamily: 'serif',
  lineHeight: '1.5',
  maxWidth: '350px'
}

const detailStyle = {
  fontSize: '1rem',
  color: '#ffffff',
  opacity: 0.85,
  marginTop: '0.75rem',
  fontFamily: 'serif',
  lineHeight: '1.5',
  maxWidth: '350px'
}

const btnStyle = {
  background: 'transparent',
  color: '#d4af37',
  padding: '1rem 3rem',
  border: '1px solid #d4af37',
  borderRadius: '2px', // Quadrado é mais moderno que redondo
  fontWeight: 'bold',
  marginTop: '3rem',
  cursor: 'pointer',
  fontSize: '0.9rem',
  letterSpacing: '3px',
  transition: 'all 0.3s ease',
  pointerEvents: 'all'
}
