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
      const finalX = (i % 3 - 1) * 0.25
      const finalY = (Math.floor(i / 3) - 1.5) * 0.25
      const finalZ = 0.15
      const rotationVariance = () => (Math.random() - 0.5) * 0.4
      data.push({
        id: i,
        // Posição final no grid dentro da caixa
        finalX,
        finalY,
        finalZ,
        startX: finalX + (Math.random() - 0.5) * 0.05,
        startY: 3 + Math.random() * 1.5,
        startZ: finalZ + (Math.random() - 0.5) * 0.05,
        startRotation: {
          x: rotationVariance(),
          y: rotationVariance(),
          z: rotationVariance()
        },
        endRotation: {
          x: Math.PI / 2,
          y: rotationVariance() * 0.5,
          z: rotationVariance() * 0.5
        },
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

    // 2. Animação dos 12 Rondellis (queda vertical com gravidade e amortecimento)
    gridData.forEach((item, i) => {
      const el = rondellisRef.current[i]
      if (!el) return

      // Queda com sensação de gravidade
      tl.to(el.position, {
        x: item.finalX,
        y: item.finalY + 0.25,
        z: item.finalZ,
        ease: "power2.in",
        duration: 1
      }, item.delay)

      // Amortecimento leve no pouso
      tl.to(el.position, {
        y: item.finalY + 0.2,
        ease: "bounce.out",
        duration: 0.35
      }, item.delay + 0.85)

      tl.to(el.rotation, {
        x: item.endRotation.x,
        y: item.endRotation.y,
        z: item.endRotation.z,
        ease: "power2.out",
        duration: 1
      }, item.delay)
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
          rotation={[item.startRotation.x, item.startRotation.y, item.startRotation.z]}
        >
          <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </>
  )
}
