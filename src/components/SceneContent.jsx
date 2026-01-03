import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function SceneContent({ url, textureUrl }) {
  const boxRef = useRef()
  const rondellisRef = useRef([])
  const sceneGroupRef = useRef()
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
      const fallSpin = (Math.random() - 0.5) * 0.25
      const fallWobble = (Math.random() - 0.5) * 0.4
      const fallNoise = Math.random() * 0.1
      const startY = 4.2 + Math.random() * 2.6
      const finalY = -0.35 + Math.random() * 0.6
      const finalZ = 0.05 + Math.random() * 0.25
      const settleOffsetY = 0.03 + Math.random() * 0.02
      const settleOffsetZ = 0.02 + Math.random() * 0.02
      const finalRotation = [
        Math.PI / 2 + (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ]
      const startRotation = [
        Math.PI / 2 + randomTilt,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8
      ]
      data.push({
        id: i,
        // Posição final orgânica dentro da travessa
        finalX: Math.cos(angle) * distance,
        finalY,
        finalZ,
        startX: (Math.random() - 0.5) * 1.2,
        startY,
        startZ: 0.8 + Math.random() * 0.6,
        startRotation,
        fallRotation: [
          startRotation[0] + fallWobble,
          startRotation[1] + fallSpin,
          startRotation[2] - fallSpin
        ],
        finalRotation,
        settleOffsetY,
        settleOffsetZ,
        delay: i * 0.06 + fallNoise // Delay para caírem um por um com ruído
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
    const baseDropStart = 0.15
    const dropWindow = 0.65
    const dropDuration = 0.7
    const impactDuration = 0.12
    const settleDuration = 0.22

    gridData.forEach((item, i) => {
      const el = rondellisRef.current[i]
      if (!el) return

      const dropStart =
        baseDropStart + (i / Math.max(gridData.length - 1, 1)) * dropWindow + item.delay

      tl.to(el.position, {
        x: item.finalX,
        y: item.finalY + 0.18,
        z: item.finalZ + item.settleOffsetZ,
        ease: "power2.in",
        duration: dropDuration
      }, dropStart)

      tl.to(el.position, {
        y: item.finalY + item.settleOffsetY,
        z: item.finalZ,
        ease: "power2.out",
        duration: impactDuration
      }, dropStart + dropDuration)

      tl.to(el.position, {
        y: item.finalY,
        ease: "power1.out",
        duration: settleDuration
      }, dropStart + dropDuration + impactDuration)

      tl.to(el.rotation, {
        x: item.fallRotation[0],
        y: item.fallRotation[1],
        z: item.fallRotation[2],
        duration: dropDuration,
        ease: "power1.inOut"
      }, dropStart)

      tl.to(el.rotation, {
        x: item.finalRotation[0],
        y: item.finalRotation[1],
        z: item.finalRotation[2],
        duration: settleDuration + 0.2,
        ease: "power2.out"
      }, dropStart + dropDuration + impactDuration)
    })

  }, [gridData, ROTAÇÃO_INICIAL_Y])

  return (
    <group ref={sceneGroupRef} position={[1.4, -0.2, 0]}>
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
    </group>
  )
}
