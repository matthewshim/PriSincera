import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import useMousePosition from '../../hooks/useMousePosition';

function StarPrism({ mouseRef }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Base slow rotation
    let targetRotY = Math.sin(t / 4) / 4;
    let targetRotX = Math.cos(t / 4) / 4;
    
    // Magnetic mouse tracking
    if (mouseRef.current) {
      const { x, y } = mouseRef.current;
      // Convert client coordinates to normalized device coordinates (-1 to 1)
      const nx = (x / window.innerWidth) * 2 - 1;
      const ny = -(y / window.innerHeight) * 2 + 1;
      
      targetRotY += nx * 0.5;
      targetRotX += ny * 0.5;
    }
    
    // Smooth lerp (spring-like tension)
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.05);
    meshRef.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        {/* Octahedron represents the Star Prism Constellation */}
        <octahedronGeometry args={[2, 0]} />
        <MeshTransmissionMaterial 
          backside
          backsideThickness={1}
          thickness={0.8}
          chromaticAberration={0.15}
          anisotropy={0.3}
          distortion={0.6}
          distortionScale={0.5}
          temporalDistortion={0.2}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#A78BFA"
          attenuationColor="#6D28D9"
          attenuationDistance={2}
          roughness={0.1}
          metalness={0.1}
        />
        {/* Inner glow */}
        <pointLight intensity={0.5} color="#A78BFA" distance={4} />
      </mesh>
      
      {/* Wireframe outer shell to simulate constellation lines on the glass */}
      <mesh>
        <octahedronGeometry args={[2.02, 0]} />
        <meshBasicMaterial color="#C4B5FD" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function DeepSpace() {
  return (
    <group>
      {/* Vast starfield */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
      {/* Volumetric dust/sparkles */}
      <Sparkles count={200} scale={15} size={2} speed={0.4} opacity={0.2} color="#C4B5FD" />
      <Sparkles count={50} scale={10} size={5} speed={0.2} opacity={0.5} color="#7C3AED" />
    </group>
  );
}

function CameraRig({ mouseRef, scrollProgress }) {
  useFrame((state) => {
    let targetX = 0;
    let targetY = 0;
    let targetZ = 6;
    
    // Parallax tracking
    if (mouseRef.current) {
      const { x, y } = mouseRef.current;
      const nx = (x / window.innerWidth) * 2 - 1;
      const ny = -(y / window.innerHeight) * 2 + 1;
      
      targetX = nx * 1.5;
      targetY = ny * 1.5;
    }
    
    // Zoom in when scrolling
    if (scrollProgress > 0) {
      targetZ = 6 - scrollProgress * 15; // Fly through the prism
    }
    
    // Spring physics application via lerp
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroCanvas({ scrollProgress }) {
  const { raw: mouseRef } = useMousePosition();

  // Performance: Pause rendering when scrolled entirely past
  const outOfView = scrollProgress >= 1;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: '#050505', opacity: outOfView ? 0 : 1, transition: 'opacity 0.5s' }}>
      {/* We unmount Canvas when completely out of view to save memory */}
      {!outOfView && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]} // Dynamic pixel ratio
          gl={{ powerPreference: 'high-performance', antialias: false, stencil: false, depth: true }}
        >
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} color="#E9D5FF" />
          <pointLight position={[-10, -10, -10]} intensity={0.8} color="#7C3AED" />
          
          <DeepSpace />
          <StarPrism mouseRef={mouseRef} />
          <CameraRig mouseRef={mouseRef} scrollProgress={scrollProgress} />
          
          {/* IBL (Image Based Lighting) for the glass refraction */}
          <Environment preset="city" />
        </Canvas>
      )}
    </div>
  );
}
