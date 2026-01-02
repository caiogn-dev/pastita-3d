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
      )
    })
  }, { scope: mainRef })

  return (
    <SmoothScroll>
      <div ref={mainRef} className="main-wrapper" style={mainWrapperStyle}>
        
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
