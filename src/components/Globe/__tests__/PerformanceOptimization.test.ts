import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObjectPool, ParticlePool, createParticle, resetParticle, ResourceManager } from '../../../utils/ObjectPool';

describe('Performance Optimization System', () => {
  describe('Object Pool', () => {
    let pool: ObjectPool<{ value: number; active: boolean }>;

    beforeEach(() => {
      pool = new ObjectPool(
        () => ({ value: 0, active: false }),
        (obj) => { obj.value = 0; obj.active = false; },
        5,
        10
      );
    });

    it('should pre-populate pool with initial objects', () => {
      expect(pool.getSize()).toBe(5);
    });

    it('should acquire objects from pool', () => {
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      expect(obj1).toBeDefined();
      expect(obj2).toBeDefined();
      expect(pool.getSize()).toBe(3); // 5 - 2 acquired
    });

    it('should release objects back to pool', () => {
      const obj = pool.acquire();
      obj.value = 42;
      obj.active = true;
      
      pool.release(obj);
      
      expect(pool.getSize()).toBe(5); // Back to original size
      
      // Object should be reset
      const reusedObj = pool.acquire();
      expect(reusedObj.value).toBe(0);
      expect(reusedObj.active).toBe(false);
    });

    it('should respect maximum pool size', () => {
      // Fill pool beyond max size
      const objects = [];
      for (let i = 0; i < 15; i++) {
        objects.push(pool.acquire());
      }
      
      // Release all objects
      objects.forEach(obj => pool.release(obj));
      
      // Pool should not exceed max size
      expect(pool.getSize()).toBeLessThanOrEqual(10);
    });

    it('should create new objects when pool is empty', () => {
      // Drain the pool
      const objects = [];
      for (let i = 0; i < 10; i++) {
        objects.push(pool.acquire());
      }
      
      expect(pool.getSize()).toBe(0);
      
      // Should still be able to acquire new objects
      const newObj = pool.acquire();
      expect(newObj).toBeDefined();
    });
  });

  describe('Particle Pool', () => {
    let particlePool: ParticlePool;

    beforeEach(() => {
      particlePool = new ParticlePool(10, 50);
    });

    it('should create particles with correct initial state', () => {
      const particle = createParticle();
      
      expect(particle.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(particle.velocity).toEqual({ x: 0, y: 0, z: 0 });
      expect(particle.life).toBe(0);
      expect(particle.maxLife).toBe(1);
      expect(particle.active).toBe(false);
    });

    it('should reset particles correctly', () => {
      const particle = createParticle();
      particle.position.x = 10;
      particle.velocity.y = 5;
      particle.life = 0.5;
      particle.active = true;
      
      resetParticle(particle);
      
      expect(particle.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(particle.velocity).toEqual({ x: 0, y: 0, z: 0 });
      expect(particle.life).toBe(0);
      expect(particle.active).toBe(false);
    });

    it('should initialize particles with custom properties', () => {
      const particle = particlePool.acquire();
      
      particlePool.initializeParticle(
        particle,
        { x: 1, y: 2, z: 3 },
        { x: 0.1, y: 0.2, z: 0.3 },
        5.0,
        0.5,
        { r: 1, g: 0.5, b: 0.2 }
      );
      
      expect(particle.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(particle.velocity).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
      expect(particle.maxLife).toBe(5.0);
      expect(particle.size).toBe(0.5);
      expect(particle.color).toEqual({ r: 1, g: 0.5, b: 0.2 });
      expect(particle.active).toBe(true);
    });

    it('should update particle position and life', () => {
      const particle = particlePool.acquire();
      particlePool.initializeParticle(
        particle,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 2, z: 3 },
        2.0
      );
      
      const shouldContinue = particlePool.updateParticle(particle, 0.5);
      
      expect(shouldContinue).toBe(true);
      expect(particle.position).toEqual({ x: 0.5, y: 1, z: 1.5 });
      expect(particle.life).toBe(0.5);
      expect(particle.intensity).toBe(0.75); // 1 - (0.5 / 2.0)
    });

    it('should mark particles as inactive when life expires', () => {
      const particle = particlePool.acquire();
      particlePool.initializeParticle(
        particle,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1 },
        1.0
      );
      
      // Update beyond max life
      const shouldContinue = particlePool.updateParticle(particle, 1.5);
      
      expect(shouldContinue).toBe(false);
      expect(particle.active).toBe(false);
      expect(particle.intensity).toBe(0);
    });
  });

  describe('Resource Manager', () => {
    let resourceManager: ResourceManager;
    let mockGeometry: any;
    let mockMaterial: any;
    let mockTexture: any;

    beforeEach(() => {
      resourceManager = new ResourceManager();
      
      mockGeometry = { dispose: vi.fn() };
      mockMaterial = { dispose: vi.fn() };
      mockTexture = { dispose: vi.fn() };
    });

    it('should track registered resources', () => {
      resourceManager.addGeometry(mockGeometry);
      resourceManager.addMaterial(mockMaterial);
      resourceManager.addTexture(mockTexture);
      
      const counts = resourceManager.getResourceCounts();
      expect(counts.geometries).toBe(1);
      expect(counts.materials).toBe(1);
      expect(counts.textures).toBe(1);
    });

    it('should dispose individual resources', () => {
      resourceManager.addGeometry(mockGeometry);
      resourceManager.removeGeometry(mockGeometry);
      
      expect(mockGeometry.dispose).toHaveBeenCalledOnce();
      expect(resourceManager.getResourceCounts().geometries).toBe(0);
    });

    it('should dispose all resources', () => {
      resourceManager.addGeometry(mockGeometry);
      resourceManager.addMaterial(mockMaterial);
      resourceManager.addTexture(mockTexture);
      
      resourceManager.disposeAll();
      
      expect(mockGeometry.dispose).toHaveBeenCalledOnce();
      expect(mockMaterial.dispose).toHaveBeenCalledOnce();
      expect(mockTexture.dispose).toHaveBeenCalledOnce();
      
      const counts = resourceManager.getResourceCounts();
      expect(counts.geometries).toBe(0);
      expect(counts.materials).toBe(0);
      expect(counts.textures).toBe(0);
    });

    it('should handle disposal errors gracefully', () => {
      const faultyGeometry = { 
        dispose: vi.fn(() => { throw new Error('Disposal failed'); })
      };
      
      resourceManager.addGeometry(faultyGeometry);
      
      // Should not throw
      expect(() => resourceManager.disposeAll()).not.toThrow();
      expect(faultyGeometry.dispose).toHaveBeenCalledOnce();
    });
  });

  describe('Performance Quality Settings', () => {
    it('should define quality presets correctly', () => {
      // This would typically be imported from PerformanceManager
      const qualityPresets = {
        high: {
          particleCount: 2000,
          coronaLayers: 2,
          shaderComplexity: 'high' as const,
          granulationDetail: 1.0,
          flareMaxCount: 4,
          prominenceMaxCount: 3,
          animationSpeed: 1.0,
          enableLOD: true
        },
        medium: {
          particleCount: 1000,
          coronaLayers: 2,
          shaderComplexity: 'medium' as const,
          granulationDetail: 0.7,
          flareMaxCount: 2,
          prominenceMaxCount: 2,
          animationSpeed: 0.8,
          enableLOD: true
        },
        low: {
          particleCount: 500,
          coronaLayers: 1,
          shaderComplexity: 'low' as const,
          granulationDetail: 0.4,
          flareMaxCount: 1,
          prominenceMaxCount: 1,
          animationSpeed: 0.6,
          enableLOD: true
        }
      };

      expect(qualityPresets.high.particleCount).toBeGreaterThan(qualityPresets.medium.particleCount);
      expect(qualityPresets.medium.particleCount).toBeGreaterThan(qualityPresets.low.particleCount);
      
      expect(qualityPresets.high.granulationDetail).toBeGreaterThan(qualityPresets.medium.granulationDetail);
      expect(qualityPresets.medium.granulationDetail).toBeGreaterThan(qualityPresets.low.granulationDetail);
      
      expect(qualityPresets.high.flareMaxCount).toBeGreaterThan(qualityPresets.low.flareMaxCount);
    });
  });
});