import React, { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

interface SunProps {
  sunPosition: Vector3;
  size?: number;
  distance?: number;
  intensity?: number;
  visible?: boolean;
}

const Sun: React.FC<SunProps> = memo(({
  sunPosition,
  size = 2.0,
  distance = 50,
  intensity = 1.0,
  visible = true
}) => {
  const sunRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  // Update animation and position
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Position sun at calculated position
    const normalizedPosition = sunPosition.clone().normalize().multiplyScalar(distance);
    
    if (sunRef.current) {
      sunRef.current.position.copy(normalizedPosition);
      // Add subtle rotation
      sunRef.current.rotation.y = time * 0.1;
    }
    
    if (coronaRef.current) {
      coronaRef.current.position.copy(normalizedPosition);
      coronaRef.current.rotation.z = time * 0.05;
    }
    
    if (glowRef.current) {
      glowRef.current.position.copy(normalizedPosition);
      glowRef.current.rotation.x = time * 0.03;
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Main sun sphere */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color="#ffdd44"
          transparent={false}
        />
      </mesh>

      {/* Corona glow effect */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[size * 1.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff6b35"
          transparent={true}
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2.2, 16, 16]} />
        <meshBasicMaterial
          color="#ffaa44"
          transparent={true}
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Lens flare effect (subtle) */}
      <mesh>
        <sphereGeometry args={[size * 3.0, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent={true}
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
});

export default Sun;
