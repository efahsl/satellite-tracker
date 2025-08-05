import React, { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, ShaderMaterial, MeshBasicMaterial } from 'three';
import { usePerformance } from '../../state/PerformanceContext';

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
  const { state } = usePerformance();
  const { sunEnabled } = state.settings;
  
  const sunRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);
  const rimGlowRef = useRef<Mesh>(null);

  // Custom shader for realistic sun surface
  const sunShaderMaterial = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      intensity: { value: intensity }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      // Noise function for surface texture
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for(int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        // Create radial gradient from center to edge
        float distFromCenter = length(vUv - 0.5) * 2.0;
        
        // Surface texture using noise
        vec2 noiseCoord = vUv * 8.0 + time * 0.1;
        float surfaceNoise = fbm(noiseCoord) * 0.3;
        
        // Color gradient: bright yellow center to orange/red edges
        vec3 centerColor = vec3(1.0, 0.95, 0.3);  // Bright yellow
        vec3 midColor = vec3(1.0, 0.6, 0.1);      // Orange
        vec3 edgeColor = vec3(0.9, 0.3, 0.1);     // Red-orange
        
        vec3 color;
        if (distFromCenter < 0.4) {
          color = mix(centerColor, midColor, distFromCenter / 0.4);
        } else {
          color = mix(midColor, edgeColor, (distFromCenter - 0.4) / 0.6);
        }
        
        // Add surface texture variation
        color += surfaceNoise * 0.2;
        
        // Brighten the center more
        float centerBrightness = 1.0 - smoothstep(0.0, 0.6, distFromCenter);
        color += centerBrightness * 0.3;
        
        // Apply intensity
        color *= intensity;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  // Update animation and position
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Position sun at calculated position
    const normalizedPosition = sunPosition.clone().normalize().multiplyScalar(distance);
    
    if (sunRef.current) {
      sunRef.current.position.copy(normalizedPosition);
      // Add subtle rotation
      sunRef.current.rotation.y = time * 0.05;
      sunRef.current.rotation.x = time * 0.02;
    }
    
    if (coronaRef.current) {
      coronaRef.current.position.copy(normalizedPosition);
      coronaRef.current.rotation.z = time * 0.03;
    }
    
    if (rimGlowRef.current) {
      rimGlowRef.current.position.copy(normalizedPosition);
    }
    
    // Update shader time uniform
    sunShaderMaterial.uniforms.time.value = time;
  });

  if (!visible || !sunEnabled) return null;

  return (
    <group>
      {/* Main realistic sun sphere */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <primitive object={sunShaderMaterial} />
      </mesh>

      {/* Bright rim glow - very close to surface */}
      <mesh ref={rimGlowRef}>
        <sphereGeometry args={[size * 1.05, 32, 32]} />
        <meshBasicMaterial
          color="#ffeb3b"
          transparent={true}
          opacity={0.4}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {/* Contained corona effect */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[size * 1.2, 24, 24]} />
        <meshBasicMaterial
          color="#ff9800"
          transparent={true}
          opacity={0.15}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {/* Very subtle outer atmosphere - contained */}
      <mesh>
        <sphereGeometry args={[size * 1.4, 16, 16]} />
        <meshBasicMaterial
          color="#fff176"
          transparent={true}
          opacity={0.05}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>
    </group>
  );
});

export default Sun;
