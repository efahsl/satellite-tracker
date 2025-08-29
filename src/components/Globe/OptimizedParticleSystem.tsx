import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Points, 
  BufferGeometry, 
  BufferAttribute, 
  PointsMaterial, 
  AdditiveBlending,
  Vector3
} from 'three';
import { ParticlePool, PooledParticle, globalResourceManager } from '../../utils/ObjectPool';
import { usePerformanceManager } from './PerformanceManager';

interface OptimizedParticleSystemProps {
  maxParticles: number;
  emissionRate: number;
  particleLife: number;
  startPosition: Vector3;
  startVelocity: Vector3;
  velocityVariation: number;
  size: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  enabled: boolean;
}

export const OptimizedParticleSystem: React.FC<OptimizedParticleSystemProps> = ({
  maxParticles,
  emissionRate,
  particleLife,
  startPosition,
  startVelocity,
  velocityVariation,
  size,
  color,
  opacity,
  enabled
}) => {
  const pointsRef = useRef<Points>(null);
  const particlePool = useRef<ParticlePool>();
  const activeParticles = useRef<PooledParticle[]>([]);
  const lastEmissionTime = useRef(0);
  const geometryRef = useRef<BufferGeometry>();
  const materialRef = useRef<PointsMaterial>();
  
  const { qualitySettings, isPerformanceCritical } = usePerformanceManager();

  // Adjust particle count based on performance
  const effectiveMaxParticles = useMemo(() => {
    if (isPerformanceCritical) {
      return Math.floor(maxParticles * 0.5);
    }
    return Math.floor(maxParticles * qualitySettings.particleCount / 2000);
  }, [maxParticles, qualitySettings.particleCount, isPerformanceCritical]);

  // Initialize particle pool
  useEffect(() => {
    particlePool.current = new ParticlePool(
      Math.floor(effectiveMaxParticles * 0.5),
      effectiveMaxParticles
    );

    return () => {
      // Clean up active particles
      activeParticles.current.forEach(particle => {
        if (particlePool.current) {
          particlePool.current.release(particle);
        }
      });
      activeParticles.current = [];
    };
  }, [effectiveMaxParticles]);

  // Create geometry and material
  const { geometry, material } = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(effectiveMaxParticles * 3);
    const colors = new Float32Array(effectiveMaxParticles * 3);
    const sizes = new Float32Array(effectiveMaxParticles);
    const opacities = new Float32Array(effectiveMaxParticles);

    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.setAttribute('size', new BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new BufferAttribute(opacities, 1));

    const mat = new PointsMaterial({
      size: size,
      sizeAttenuation: true,
      transparent: true,
      opacity: opacity,
      vertexColors: true,
      blending: AdditiveBlending,
      depthWrite: false
    });

    // Register resources for cleanup
    globalResourceManager.addGeometry(geo);
    globalResourceManager.addMaterial(mat);

    geometryRef.current = geo;
    materialRef.current = mat;

    return { geometry: geo, material: mat };
  }, [effectiveMaxParticles, size, opacity]);

  // Emit new particles
  const emitParticle = (time: number) => {
    if (!particlePool.current || activeParticles.current.length >= effectiveMaxParticles) {
      return;
    }

    const particle = particlePool.current.acquire();
    
    // Random velocity variation
    const velocityX = startVelocity.x + (Math.random() - 0.5) * velocityVariation;
    const velocityY = startVelocity.y + (Math.random() - 0.5) * velocityVariation;
    const velocityZ = startVelocity.z + (Math.random() - 0.5) * velocityVariation;

    particlePool.current.initializeParticle(
      particle,
      { x: startPosition.x, y: startPosition.y, z: startPosition.z },
      { x: velocityX, y: velocityY, z: velocityZ },
      particleLife,
      size * (0.8 + Math.random() * 0.4),
      color
    );

    activeParticles.current.push(particle);
  };

  // Update particle system
  useFrame((state) => {
    if (!enabled || !particlePool.current || !geometry) return;

    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();

    // Emit new particles based on emission rate
    const emissionInterval = 1 / emissionRate;
    if (time - lastEmissionTime.current >= emissionInterval) {
      emitParticle(time);
      lastEmissionTime.current = time;
    }

    // Update existing particles
    const particlesToRemove: number[] = [];
    
    activeParticles.current.forEach((particle, index) => {
      const shouldKeep = particlePool.current!.updateParticle(particle, deltaTime);
      if (!shouldKeep) {
        particlesToRemove.push(index);
      }
    });

    // Remove dead particles (in reverse order to maintain indices)
    for (let i = particlesToRemove.length - 1; i >= 0; i--) {
      const index = particlesToRemove[i];
      const particle = activeParticles.current[index];
      particlePool.current.release(particle);
      activeParticles.current.splice(index, 1);
    }

    // Update geometry attributes
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;
    const opacities = geometry.attributes.opacity?.array as Float32Array;

    // Clear arrays
    positions.fill(0);
    colors.fill(0);
    sizes.fill(0);
    if (opacities) opacities.fill(0);

    // Update active particles
    activeParticles.current.forEach((particle, index) => {
      const i3 = index * 3;
      
      // Position
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      // Color
      colors[i3] = particle.color.r;
      colors[i3 + 1] = particle.color.g;
      colors[i3 + 2] = particle.color.b;

      // Size
      sizes[index] = particle.size * particle.intensity;

      // Opacity
      if (opacities) {
        opacities[index] = particle.intensity;
      }
    });

    // Mark attributes as needing update
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    if (geometry.attributes.opacity) {
      geometry.attributes.opacity.needsUpdate = true;
    }

    // Update draw range to only render active particles
    geometry.setDrawRange(0, activeParticles.current.length);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        globalResourceManager.removeGeometry(geometryRef.current);
      }
      if (materialRef.current) {
        globalResourceManager.removeMaterial(materialRef.current);
      }
    };
  }, []);

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
};

export default OptimizedParticleSystem;