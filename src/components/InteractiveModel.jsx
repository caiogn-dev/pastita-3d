import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Float } from '@react-three/drei';

function Model() {
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
    <div className="model-container">
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
            <Model />
          </Float>
          <Environment preset="city" />
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2.5}
            far={8}
          />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
