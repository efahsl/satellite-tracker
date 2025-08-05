/**
 * Advanced Shadow Optimization System
 * Provides adaptive shadow quality based on hardware capabilities and scene complexity
 */

import * as THREE from 'three';
import { WebGLCapabilities } from './webglDetection';

export interface ShadowConfig {
  enabled: boolean;
  mapSize: number;
  cascades: number;
  bias: number;
  normalBias: number;
  radius: number;
  near: number;
  far: number;
  cameraSize: number;
}

/**
 * Gets optimal shadow configuration based on hardware capabilities
 */
export const getOptimalShadowConfig = (capabilities: WebGLCapabilities): ShadowConfig => {
  // Disable shadows on software renderers
  if (!capabilities.isHighPerformance) {
    return {
      enabled: false,
      mapSize: 512,
      cascades: 1,
      bias: -0.0001,
      normalBias: 0.02,
      radius: 1,
      near: 0.1,
      far: 50,
      cameraSize: 10
    };
  }

  // High-end hardware configuration
  if (capabilities.maxTextureSize >= 4096 && capabilities.version === 2) {
    return {
      enabled: true,
      mapSize: 2048,
      cascades: 3,
      bias: -0.00005,
      normalBias: 0.01,
      radius: 4,
      near: 0.1,
      far: 50,
      cameraSize: 12
    };
  }

  // Mid-range hardware configuration
  if (capabilities.maxTextureSize >= 2048) {
    return {
      enabled: true,
      mapSize: 1024,
      cascades: 2,
      bias: -0.0001,
      normalBias: 0.02,
      radius: 2,
      near: 0.1,
      far: 50,
      cameraSize: 10
    };
  }

  // Low-end hardware configuration
  return {
    enabled: true,
    mapSize: 512,
    cascades: 1,
    bias: -0.0005,
    normalBias: 0.05,
    radius: 1,
    near: 0.5,
    far: 30,
    cameraSize: 8
  };
};

/**
 * Shadow Quality Manager - handles dynamic shadow quality adjustment
 */
export class ShadowQualityManager {
  private renderer: THREE.WebGLRenderer | null;
  private shadowConfig: ShadowConfig;
  private performanceHistory: number[] = [];
  private lastAdjustment = 0;
  private adjustmentCooldown = 5000; // 5 seconds between adjustments

  constructor(renderer: THREE.WebGLRenderer | null, capabilities: WebGLCapabilities) {
    this.renderer = renderer;
    this.shadowConfig = getOptimalShadowConfig(capabilities);
    if (renderer) {
      this.configureShadows();
    }
  }

  /**
   * Configure renderer shadow settings
   */
  private configureShadows(): void {
    if (!this.renderer) return;
    
    this.renderer.shadowMap.enabled = this.shadowConfig.enabled;
    
    if (this.shadowConfig.enabled) {
      // Use PCF soft shadows for better quality
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Set shadow map size
      this.renderer.shadowMap.setSize(this.shadowConfig.mapSize, this.shadowConfig.mapSize);
      
      console.log(`🌄 Shadow system configured: ${this.shadowConfig.mapSize}x${this.shadowConfig.mapSize}, ${this.shadowConfig.cascades} cascades`);
    } else {
      console.log('🌄 Shadows disabled for performance');
    }
  }

  /**
   * Configure a directional light for optimal shadows
   */
  configureShadowLight(light: THREE.DirectionalLight): void {
    if (!this.shadowConfig.enabled) {
      light.castShadow = false;
      return;
    }

    light.castShadow = true;
    light.shadow.mapSize.width = this.shadowConfig.mapSize;
    light.shadow.mapSize.height = this.shadowConfig.mapSize;
    
    // Configure shadow camera
    const camera = light.shadow.camera as THREE.OrthographicCamera;
    camera.near = this.shadowConfig.near;
    camera.far = this.shadowConfig.far;
    camera.left = -this.shadowConfig.cameraSize;
    camera.right = this.shadowConfig.cameraSize;
    camera.top = this.shadowConfig.cameraSize;
    camera.bottom = -this.shadowConfig.cameraSize;
    
    // Set shadow bias to prevent shadow acne
    light.shadow.bias = this.shadowConfig.bias;
    light.shadow.normalBias = this.shadowConfig.normalBias;
    light.shadow.radius = this.shadowConfig.radius;
    
    // Update shadow camera projection
    camera.updateProjectionMatrix();
  }

  /**
   * Update shadow quality based on performance
   */
  updateQuality(currentFPS: number): void {
    const now = Date.now();
    
    // Add to performance history
    this.performanceHistory.push(currentFPS);
    if (this.performanceHistory.length > 60) {
      this.performanceHistory.shift();
    }

    // Only adjust if enough time has passed
    if (now - this.lastAdjustment < this.adjustmentCooldown) {
      return;
    }

    // Calculate average FPS over last 60 frames
    const avgFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    
    // Adjust shadow quality based on performance
    if (avgFPS < 30 && this.shadowConfig.mapSize > 512) {
      // Reduce shadow quality
      this.shadowConfig.mapSize = Math.max(512, this.shadowConfig.mapSize / 2);
      this.configureShadows();
      this.lastAdjustment = now;
      console.log(`🔽 Reduced shadow quality to ${this.shadowConfig.mapSize}x${this.shadowConfig.mapSize} (FPS: ${avgFPS.toFixed(1)})`);
    } else if (avgFPS > 55 && this.shadowConfig.mapSize < 2048) {
      // Increase shadow quality
      this.shadowConfig.mapSize = Math.min(2048, this.shadowConfig.mapSize * 2);
      this.configureShadows();
      this.lastAdjustment = now;
      console.log(`🔼 Increased shadow quality to ${this.shadowConfig.mapSize}x${this.shadowConfig.mapSize} (FPS: ${avgFPS.toFixed(1)})`);
    }
  }

  /**
   * Get current shadow configuration
   */
  getConfig(): ShadowConfig {
    return { ...this.shadowConfig };
  }

  /**
   * Disable shadows completely (for emergency performance mode)
   */
  disableShadows(): void {
    this.shadowConfig.enabled = false;
    this.renderer.shadowMap.enabled = false;
    console.log('🚫 Shadows disabled for emergency performance mode');
  }

  /**
   * Get shadow memory usage estimation
   */
  getMemoryUsage(): number {
    if (!this.shadowConfig.enabled) return 0;
    
    // Each shadow map uses: width * height * 4 bytes (RGBA) * cascades
    const bytesPerPixel = 4;
    const pixelsPerMap = this.shadowConfig.mapSize * this.shadowConfig.mapSize;
    const totalBytes = pixelsPerMap * bytesPerPixel * this.shadowConfig.cascades;
    
    return Math.round(totalBytes / (1024 * 1024)); // Convert to MB
  }
}

/**
 * Optimized shadow receiver material
 */
export const createShadowReceivingMaterial = (baseColor: THREE.Color): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.8,
    metalness: 0.1,
    // Enable shadow receiving
    receiveShadow: true,
    // Optimize for shadow receiving
    shadowSide: THREE.DoubleSide,
  });
};

/**
 * Configure object for optimal shadow casting/receiving
 */
export const configureShadowObject = (
  object: THREE.Object3D, 
  castShadow = true, 
  receiveShadow = true
): void => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
      
      // Optimize material for shadows
      if (child.material instanceof THREE.Material) {
        child.material.shadowSide = THREE.DoubleSide;
      }
    }
  });
};