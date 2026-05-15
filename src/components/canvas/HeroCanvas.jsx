import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function SafeCube() {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#6D28D9" wireframe />
    </mesh>
  );
}

export default function HeroCanvas({ scrollProgress }) {
  const outOfView = scrollProgress >= 1;
  if (outOfView) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: '#050505', pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <SafeCube />
      </Canvas>
    </div>
  );
}
