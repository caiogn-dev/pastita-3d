import React, { useRef, useMemo, useLayoutEffect } from 'react'
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

  // Criando dados para rondellis com distribuição orgânica
  const gridData = useMemo(() => {
    const data = []
    const radius = 0.55
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.sqrt(Math.random()) * radius
      const randomTilt = (Math.random() - 0.5) * 0.8
      data.push({
        id: i,
        // Posição final orgânica dentro da travessa
        finalX: Math.cos(angle) * distance,
        finalY: -0.35 + Math.random() * 0.6,
        finalZ: 0.05 + Math.random() * 0.25,
        startX: (Math.random() - 0.5) * 1.2,
        startY: 3.5 + Math.random() * 2.5,
        startZ: 0.8 + Math.random() * 0.6,
        startRotation: [
          Math.PI / 2 + randomTilt,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8
        ],
        finalRotation: [
          Math.PI / 2 + (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ],
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

    // 2. Animação dos 12 Rondellis (caindo de cima para a travessa)
    gridData.forEach((item, i) => {
      const el = rondellisRef.current[i]
      if (!el) return

      tl.to(el.position, {
        x: item.finalX,
        y: item.finalY + 0.2,
        z: item.finalZ + 0.05,
        ease: "power2.in",
        duration: 0.9
      }, 0.4 + item.delay)

      tl.to(el.position, {
        y: item.finalY,
        z: item.finalZ,
        ease: "power2.out",
        duration: 0.25
      }, 1.3 + item.delay)

      tl.to(el.rotation, {
        x: item.finalRotation[0],
        y: item.finalRotation[1],
        z: item.finalRotation[2],
        duration: 0.9,
        ease: "power2.out"
      }, 0.4 + item.delay)
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
          position={[item.startX, item.startY, item.startZ]}
          rotation={item.startRotation}
        >
          <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </>
  )
}
