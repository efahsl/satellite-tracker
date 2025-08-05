/**
 * Performance monitoring utilities to track WebGL rendering performance
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  memory: {
    geometries: number;
    textures: number;
  };
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameTimeHistory: number[] = [];
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
    memory: { geometries: 0, textures: 0 }
  };

  /**
   * Update performance metrics
   * @param renderer Three.js WebGL Renderer
   */
  update(renderer?: THREE.WebGLRenderer): PerformanceMetrics {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    // Update frame time history
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Calculate FPS every 250ms
    if (deltaTime >= 250) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.metrics.frameTime = Math.round(deltaTime / this.frameCount * 100) / 100;
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    // Get renderer info if available
    if (renderer) {
      const info = renderer.info;
      this.metrics.drawCalls = info.render.calls;
      this.metrics.triangles = info.render.triangles;
      this.metrics.geometries = info.memory.geometries;
      this.metrics.textures = info.memory.textures;
      this.metrics.programs = info.programs?.length || 0;
      this.metrics.memory.geometries = info.memory.geometries;
      this.metrics.memory.textures = info.memory.textures;
    }

    return { ...this.metrics };
  }

  /**
   * Get average frame time over the last 60 frames
   */
  getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.frameTimeHistory.length * 100) / 100;
  }

  /**
   * Check if performance is good (>= 50 FPS)
   */
  isPerformanceGood(): boolean {
    return this.metrics.fps >= 50;
  }

  /**
   * Get performance grade based on FPS
   */
  getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const fps = this.metrics.fps;
    if (fps >= 55) return 'A';
    if (fps >= 45) return 'B';
    if (fps >= 35) return 'C';
    if (fps >= 25) return 'D';
    return 'F';
  }

  /**
   * Log performance comparison between old and new trail systems
   */
  logTrailPerformanceComparison(oldMetrics: PerformanceMetrics, newMetrics: PerformanceMetrics): void {
    const fpsImprovement = ((newMetrics.fps - oldMetrics.fps) / oldMetrics.fps * 100);
    const drawCallReduction = oldMetrics.drawCalls - newMetrics.drawCalls;
    const triangleReduction = oldMetrics.triangles - newMetrics.triangles;
    const geometryReduction = oldMetrics.geometries - newMetrics.geometries;

    console.group('🚀 Trail Performance Comparison');
    console.log(`FPS: ${oldMetrics.fps} → ${newMetrics.fps} (${fpsImprovement > 0 ? '+' : ''}${fpsImprovement.toFixed(1)}%)`);
    console.log(`Draw Calls: ${oldMetrics.drawCalls} → ${newMetrics.drawCalls} (${drawCallReduction > 0 ? '-' : '+'}${Math.abs(drawCallReduction)})`);
    console.log(`Triangles: ${oldMetrics.triangles} → ${newMetrics.triangles} (${triangleReduction > 0 ? '-' : '+'}${Math.abs(triangleReduction)})`);
    console.log(`Geometries: ${oldMetrics.geometries} → ${newMetrics.geometries} (${geometryReduction > 0 ? '-' : '+'}${Math.abs(geometryReduction)})`);
    
    if (fpsImprovement > 10) {
      console.log('✅ Significant performance improvement achieved!');
    } else if (fpsImprovement > 0) {
      console.log('👍 Performance improvement achieved');
    } else {
      console.log('⚠️ Performance may have decreased');
    }
    console.groupEnd();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();