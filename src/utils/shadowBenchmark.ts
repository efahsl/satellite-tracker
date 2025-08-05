/**
 * Shadow Performance Benchmark Utility
 * Demonstrates the performance impact of different shadow configurations
 */

import { WebGLCapabilities } from './webglDetection';
import { ShadowConfig } from './shadowOptimization';

export interface ShadowBenchmarkResult {
  configuration: string;
  shadowMapSize: number;
  memoryUsage: number; // MB
  estimatedFPS: number;
  qualityScore: number; // 1-10
  recommendation: 'optimal' | 'good' | 'acceptable' | 'poor';
}

/**
 * Benchmark different shadow configurations for a given hardware setup
 */
export const benchmarkShadowConfigurations = (capabilities: WebGLCapabilities): ShadowBenchmarkResult[] => {
  const results: ShadowBenchmarkResult[] = [];

  // Test configurations
  const configs = [
    { name: 'Ultra High', size: 4096, cascades: 4 },
    { name: 'High', size: 2048, cascades: 3 },
    { name: 'Medium', size: 1024, cascades: 2 },
    { name: 'Low', size: 512, cascades: 1 },
    { name: 'Disabled', size: 0, cascades: 0 }
  ];

  configs.forEach(config => {
    const memoryUsage = config.size > 0 ? 
      Math.round((config.size * config.size * 4 * config.cascades) / (1024 * 1024)) : 0;
    
    let estimatedFPS = 60;
    let qualityScore = 10;
    let recommendation: ShadowBenchmarkResult['recommendation'] = 'optimal';

    if (config.size === 0) {
      // No shadows
      estimatedFPS = 75;
      qualityScore = 3;
      recommendation = 'poor';
    } else if (!capabilities.isHighPerformance) {
      // Software renderer penalty
      estimatedFPS = Math.max(20, 60 - (memoryUsage * 8));
      qualityScore = Math.max(1, 10 - (memoryUsage * 2));
      recommendation = memoryUsage > 4 ? 'poor' : 'acceptable';
    } else if (capabilities.maxTextureSize < config.size) {
      // Hardware limitation
      estimatedFPS = 30;
      qualityScore = 4;
      recommendation = 'poor';
    } else {
      // Calculate performance impact
      const performanceImpact = memoryUsage / 16; // Rough estimate
      estimatedFPS = Math.max(30, 60 - performanceImpact);
      qualityScore = Math.min(10, 10 - (performanceImpact / 4));
      
      if (estimatedFPS >= 55) recommendation = 'optimal';
      else if (estimatedFPS >= 45) recommendation = 'good';
      else if (estimatedFPS >= 35) recommendation = 'acceptable';
      else recommendation = 'poor';
    }

    results.push({
      configuration: config.name,
      shadowMapSize: config.size,
      memoryUsage,
      estimatedFPS: Math.round(estimatedFPS),
      qualityScore: Math.round(qualityScore * 10) / 10,
      recommendation
    });
  });

  return results;
};

/**
 * Get the optimal shadow configuration from benchmark results
 */
export const getOptimalShadowConfig = (results: ShadowBenchmarkResult[]): ShadowBenchmarkResult => {
  // Find the best balance between quality and performance
  const optimalResults = results.filter(r => r.recommendation === 'optimal');
  const goodResults = results.filter(r => r.recommendation === 'good');
  
  if (optimalResults.length > 0) {
    return optimalResults.reduce((best, current) => 
      current.qualityScore > best.qualityScore ? current : best
    );
  }
  
  if (goodResults.length > 0) {
    return goodResults.reduce((best, current) => 
      current.qualityScore > best.qualityScore ? current : best
    );
  }
  
  // Fallback to best acceptable option
  return results.filter(r => r.recommendation === 'acceptable')[0] || results[results.length - 1];
};

/**
 * Log shadow benchmark results to console
 */
export const logShadowBenchmark = (capabilities: WebGLCapabilities): void => {
  const results = benchmarkShadowConfigurations(capabilities);
  const optimal = getOptimalShadowConfig(results);

  console.group('🌄 Shadow Performance Benchmark');
  console.log(`Hardware: ${capabilities.renderer}`);
  console.log(`Max Texture Size: ${capabilities.maxTextureSize}px`);
  console.log(`High Performance: ${capabilities.isHighPerformance ? '✅' : '❌'}`);
  console.log('');
  
  console.table(results.map(r => ({
    Configuration: r.configuration,
    'Shadow Size': r.shadowMapSize > 0 ? `${r.shadowMapSize}x${r.shadowMapSize}` : 'Disabled',
    'Memory (MB)': r.memoryUsage,
    'Est. FPS': r.estimatedFPS,
    'Quality': r.qualityScore,
    'Status': r.recommendation === 'optimal' ? '🟢 Optimal' :
              r.recommendation === 'good' ? '🟡 Good' :
              r.recommendation === 'acceptable' ? '🟠 OK' : '🔴 Poor'
  })));

  console.log(`\n📊 Recommended: ${optimal.configuration} (${optimal.shadowMapSize}x${optimal.shadowMapSize})`);
  console.log(`Expected Performance: ${optimal.estimatedFPS} FPS, Quality: ${optimal.qualityScore}/10`);
  console.groupEnd();
};

/**
 * Calculate shadow memory savings from optimization
 */
export const calculateShadowSavings = (oldSize: number, newSize: number, cascades = 1): {
  memorySaved: number;
  percentageSaved: number;
  performanceGain: number;
} => {
  const oldMemory = (oldSize * oldSize * 4 * cascades) / (1024 * 1024);
  const newMemory = newSize > 0 ? (newSize * newSize * 4 * cascades) / (1024 * 1024) : 0;
  
  const memorySaved = oldMemory - newMemory;
  const percentageSaved = (memorySaved / oldMemory) * 100;
  const performanceGain = memorySaved * 2; // Rough estimate: 2 FPS per MB saved

  return {
    memorySaved: Math.round(memorySaved * 100) / 100,
    percentageSaved: Math.round(percentageSaved),
    performanceGain: Math.round(performanceGain)
  };
};