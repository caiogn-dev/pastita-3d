// src/components/InteractiveModel.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Float } from '@react-three/drei';

function Model() {
  // Carregando o seu modelo (certifique-se que embalagem.glb está na pasta public)
  const { scene } = useGLTF('/embalagem.glb');
  
  return (
    <primitive 
      object={scene} 
      scale={4.5} 
      rotation={[0.2, -0.5, 0]} 
    />
  );
}

export default function InteractiveModel() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* Luzes para destacar o produto */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          {/* Float faz o objeto flutuar levemente */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Model />
          </Float>
          
          {/* Sombra no chão */}
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </Suspense>

        {/* Permite o usuário girar o objeto (Zoom desabilitado para não quebrar o layout) */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}