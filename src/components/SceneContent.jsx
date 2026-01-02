import React, { useRef, useMemo, useLayoutEffect } from 'react' // <--- Importado corretamente agora
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function SceneContent({ url, textureUrl }) {
  const boxRef = useRef()
  const rondellisRef = useRef([])
  const { scene } = useGLTF(url)
  const texture = useTexture(textureUrl)
  
  texture.flipY = false
  texture.colorSpace = THREE.SRGBColorSpace

  const ROTAÇÃO_INICIAL_Y = -Math.PI / 2 

  // Criando dados para 12 rondellis (Grid 3x4)
  const gridData = useMemo(() => {
    const data = []
    for (let i = 0; i < 12; i++) {
      data.push({
        id: i,
        // Posição final no grid dentro da caixa
        finalX: (i % 3 - 1) * 0.25, 
        finalY: (Math.floor(i / 3) - 1.5) * 0.25,
        delay: i * 0.08 // Delay para caírem um por um
      })
    }
    return data
  }, [])

  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ 
          map: texture, 
          roughness: 0.4, 
          metalness: 0.1 
        })
      }
    })
  }, [scene, texture])

  useGSAP(() => {
    if (!boxRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".main-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    })

    // 1. Animação da Caixa: Rotaciona e se posiciona para o "encaixe" final
    tl.to(boxRef.current.rotation, { 
      y: ROTAÇÃO_INICIAL_Y + Math.PI * 2, 
      x: 0.3 
    }, 0)

    // 2. Animação dos 12 Rondellis
    gridData.forEach((item, i) => {
      const el = rondellisRef.current[i]
      if (!el) return

      // Fase 1: Orbitando a caixa (Scroll inicial)
      tl.to(el.position, {
        x: Math.cos(i) * 3,
        y: Math.sin(i) * 3,
        z: 3,
        duration: 1
      }, 0)

      // Fase 2: Caindo no Grid 3x4 (Scroll final)
      tl.to(el.position, {
        x: item.finalX,
        y: item.finalY + 0.2, // Ajuste de altura na caixa
        z: 0.1,
        ease: "power2.inOut",
        duration: 1
      }, 1 + item.delay)

      tl.to(el.rotation, {
        x: Math.PI / 2, // Ficam deitados no grid
        y: 0,
        z: 0,
        duration: 1
      }, 1 + item.delay)
    })

  }, [gridData, ROTAÇÃO_INICIAL_Y])

  return (
    <>
      <group ref={boxRef} rotation={[0, ROTAÇÃO_INICIAL_Y, 0]}>
        <primitive object={scene} scale={5} />
      </group>

      {gridData.map((item, i) => (
        <mesh 
          key={item.id} 
          ref={el => rondellisRef.current[i] = el}
          position={[(Math.random() - 0.5) * 5, 5, -5]} // Começam espalhados fora da tela
        >
          <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </>
  )
}