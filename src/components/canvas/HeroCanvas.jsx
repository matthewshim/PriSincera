import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useMousePosition from '../../hooks/useMousePosition';
import ErrorBoundary from '../common/ErrorBoundary';

function StarPrism({ mouseRef }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    let targetRotY = Math.sin(t / 4) / 4;
    let targetRotX = Math.cos(t / 4) / 4;
    
    if (mouseRef.current) {
      const { x, y } = mouseRef.current;
      const nx = (x / window.innerWidth) * 2 - 1;
      const ny = -(y / window.innerHeight) * 2 + 1;
      targetRotY += nx * 0.5;
      targetRotX += ny * 0.5;
    }
    
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.05);
    meshRef.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <group ref={meshRef}>
      {/* Outer Shell - Simple, robust StandardMaterial */}
      <mesh>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial 
          color="#6D28D9" 
          emissive="#3B0764"
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Wireframe inner/outer */}
      <mesh>
        <octahedronGeometry args={[2.05, 0]} />
        <meshBasicMaterial color="#C4B5FD" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function SimpleStars() {
  const starsRef = useRef();
  
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  // Very lightweight manual starfield using Points (no drei required)
  const [positions] = React.useState(() => {
    const pos = new Float32Array(500 * 3); // 500 stars, very safe
    for (let i = 0; i < 500; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#C4B5FD" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function CameraRig({ mouseRef, scrollProgress }) {
  useFrame((state) => {
    let targetX = 0;
    let targetY = 0;
    let targetZ = 6;
    
    if (mouseRef.current) {
      const { x, y } = mouseRef.current;
      const nx = (x / window.innerWidth) * 2 - 1;
      const ny = -(y / window.innerHeight) * 2 + 1;
      targetX = nx * 1.5;
      targetY = ny * 1.5;
    }
    
    if (scrollProgress > 0) {
      targetZ = 6 - scrollProgress * 10;
    }
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

const FallbackUI = () => (
  <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, #1A1A1A 0%, #050505 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* A graceful 2D fallback if WebGL completely fails */}
    <div style={{ width: '300px', height: '300px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.1), transparent)', border: '1px solid rgba(167, 139, 250, 0.05)', boxShadow: '0 0 60px rgba(109, 40, 217, 0.15)' }}></div>
  </div>
);

export default function HeroCanvas({ scrollProgress }) {
  const { raw: mouseRef } = useMousePosition();
  const outOfView = scrollProgress >= 1;

  if (outOfView) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: '#050505', pointerEvents: 'none' }}>
      {/* ErrorBoundary ensures that if WebGL crashes, the entire website doesn't crash with it */}
      <ErrorBoundary fallback={<FallbackUI />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'default', antialias: false, stencil: false, depth: true }}
          onError={(e) => console.error("Canvas Error:", e)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#C4B5FD" />
          
          <SimpleStars />
          <StarPrism mouseRef={mouseRef} />
          <CameraRig mouseRef={mouseRef} scrollProgress={scrollProgress} />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
