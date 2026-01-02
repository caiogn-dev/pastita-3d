import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, Environment, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import SmoothScroll from './components/SmoothScroll'
import SceneContent from './components/SceneContent'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const mainRef = useRef()

  useGSAP(() => {
    // Animação refinada: Texto surge com fade e um leve movimento lateral
    gsap.utils.toArray('.content-box').forEach((box, i) => {
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
          
          <section style={sectionStyle}>
            <div className="content-box" style={cardStyle}>
              <span style={numberStyle}>01</span>
              <h1 style={titleStyle}>PUREZA</h1>
              <p style={subtitleStyle}>Massa de sêmola de trigo duro. Simples e autêntica.</p>
            </div>
          </section>

          <section style={sectionStyle}>
            <div className="content-box" style={{ ...cardStyle, marginLeft: 'auto', borderLeft: 'none', borderRight: '2px solid #d4af37', textAlign: 'right' }}>
              <span style={numberStyle}>02</span>
              <h1 style={titleStyle}>O CORTE</h1>
              <p style={subtitleStyle}>Rondellis moldados para a retenção perfeita do molho.</p>
            </div>
          </section>

          <section style={sectionStyle}>
            <div className="content-box" style={cardStyle}>
              <span style={numberStyle}>03</span>
              <h1 style={titleStyle}>ARTESANAL</h1>
              <p style={subtitleStyle}>Produção em pequenos lotes para garantir o frescor.</p>
            </div>
          </section>

          <section style={finalSectionStyle}>
            <div className="content-box" style={{ textAlign: 'center' }}>
              <h1 style={{ ...titleStyle, fontSize: 'clamp(3rem, 15vw, 10rem)' }}>PASTITA</h1>
              <p style={{ ...subtitleStyle, margin: '0 auto' }}>12 Unidades. Prontas para sua experiência.</p>
              <button style={btnStyle}>RESERVAR AGORA</button>
            </div>
          </section>

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

const finalSectionStyle = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'none'
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