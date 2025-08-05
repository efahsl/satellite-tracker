/**
 * Generic object pool for efficient memory management
 * Reduces garbage collection by reusing objects
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * Get an object from the pool
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  /**
   * Get current pool size
   */
  getSize(): number {
    return this.pool.length;
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool.length = 0;
  }
}

/**
 * Particle object for solar effects
 */
export interface PooledParticle {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
  size: number;
  color: { r: number; g: number; b: number };
  intensity: number;
  active: boolean;
}

/**
 * Factory function for creating particles
 */
export const createParticle = (): PooledParticle => ({
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  life: 0,
  maxLife: 1,
  size: 0.1,
  color: { r: 1, g: 1, b: 1 },
  intensity: 1,
  active: false
});

/**
 * Reset function for particles
 */
export const resetParticle = (particle: PooledParticle): void => {
  particle.position.x = 0;
  particle.position.y = 0;
  particle.position.z = 0;
  particle.velocity.x = 0;
  particle.velocity.y = 0;
  particle.velocity.z = 0;
  particle.life = 0;
  particle.maxLife = 1;
  particle.size = 0.1;
  particle.color.r = 1;
  particle.color.g = 1;
  particle.color.b = 1;
  particle.intensity = 1;
  particle.active = false;
};

/**
 * Specialized particle pool for solar effects
 */
export class ParticlePool extends ObjectPool<PooledParticle> {
  constructor(initialSize: number = 50, maxSize: number = 500) {
    super(createParticle, resetParticle, initialSize, maxSize);
  }

  /**
   * Initialize a particle with specific properties
   */
  initializeParticle(
    particle: PooledParticle,
    position: { x: number; y: number; z: number },
    velocity: { x: number; y: number; z: number },
    life: number,
    size: number = 0.1,
    color: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 }
  ): void {
    particle.position.x = position.x;
    particle.position.y = position.y;
    particle.position.z = position.z;
    particle.velocity.x = velocity.x;
    particle.velocity.y = velocity.y;
    particle.velocity.z = velocity.z;
    particle.life = 0;
    particle.maxLife = life;
    particle.size = size;
    particle.color.r = color.r;
    particle.color.g = color.g;
    particle.color.b = color.b;
    particle.intensity = 1;
    particle.active = true;
  }

  /**
   * Update particle and return false if it should be released
   */
  updateParticle(particle: PooledParticle, deltaTime: number): boolean {
    if (!particle.active) return false;

    particle.life += deltaTime;
    
    // Update position
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    particle.position.z += particle.velocity.z * deltaTime;

    // Update intensity based on life
    const lifeRatio = particle.life / particle.maxLife;
    particle.intensity = Math.max(0, 1 - lifeRatio);

    // Check if particle should die
    if (particle.life >= particle.maxLife) {
      particle.active = false;
      return false;
    }

    return true;
  }
}

/**
 * Resource manager for tracking and cleaning up Three.js resources
 */
export class ResourceManager {
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();

  /**
   * Register a geometry for cleanup
   */
  addGeometry(geometry: THREE.BufferGeometry): void {
    this.geometries.add(geometry);
  }

  /**
   * Register a material for cleanup
   */
  addMaterial(material: THREE.Material): void {
    this.materials.add(material);
  }

  /**
   * Register a texture for cleanup
   */
  addTexture(texture: THREE.Texture): void {
    this.textures.add(texture);
  }

  /**
   * Remove and dispose of a geometry
   */
  removeGeometry(geometry: THREE.BufferGeometry): void {
    if (this.geometries.has(geometry)) {
      geometry.dispose();
      this.geometries.delete(geometry);
    }
  }

  /**
   * Remove and dispose of a material
   */
  removeMaterial(material: THREE.Material): void {
    if (this.materials.has(material)) {
      material.dispose();
      this.materials.delete(material);
    }
  }

  /**
   * Remove and dispose of a texture
   */
  removeTexture(texture: THREE.Texture): void {
    if (this.textures.has(texture)) {
      texture.dispose();
      this.textures.delete(texture);
    }
  }

  /**
   * Dispose of all registered resources
   */
  disposeAll(): void {
    // Dispose geometries
    this.geometries.forEach(geometry => {
      try {
        geometry.dispose();
      } catch (error) {
        console.warn('Error disposing geometry:', error);
      }
    });
    this.geometries.clear();

    // Dispose materials
    this.materials.forEach(material => {
      try {
        material.dispose();
      } catch (error) {
        console.warn('Error disposing material:', error);
      }
    });
    this.materials.clear();

    // Dispose textures
    this.textures.forEach(texture => {
      try {
        texture.dispose();
      } catch (error) {
        console.warn('Error disposing texture:', error);
      }
    });
    this.textures.clear();
  }

  /**
   * Get resource counts for monitoring
   */
  getResourceCounts(): { geometries: number; materials: number; textures: number } {
    return {
      geometries: this.geometries.size,
      materials: this.materials.size,
      textures: this.textures.size
    };
  }
}

/**
 * Global resource manager instance
 */
export const globalResourceManager = new ResourceManager();