import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'

import SceneContent from './SceneContent'

export default function RondelliFallAnimation() {
  return (
    <div style={canvasContainerStyle}>
      <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
        <Environment preset="city" />

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
  )
}

const canvasContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  zIndex: 0
}
