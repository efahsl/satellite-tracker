import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';

export interface QualitySettings {
  particleCount: number;
  coronaLayers: number;
  shaderComplexity: 'low' | 'medium' | 'high';
  granulationDetail: number;
  flareMaxCount: number;
  prominenceMaxCount: number;
  animationSpeed: number;
  enableLOD: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  frameTime: number;
  memoryUsage?: number;
  isStable: boolean;
}

interface PerformanceManagerContextType {
  qualitySettings: QualitySettings;
  performanceMetrics: PerformanceMetrics;
  updateQuality: (settings: Partial<QualitySettings>) => void;
  getOptimalQuality: (distance: number) => QualitySettings;
  isPerformanceCritical: boolean;
}

const PerformanceManagerContext = createContext<PerformanceManagerContextType | null>(null);

// Quality presets for different performance levels
const QUALITY_PRESETS = {
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

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  TARGET_FPS: 30,
  CRITICAL_FPS: 20,
  STABLE_FRAME_COUNT: 60, // Frames to consider for stability
  QUALITY_ADJUSTMENT_DELAY: 2000, // ms before adjusting quality
  MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024 // 100MB
};

interface PerformanceManagerProps {
  children: React.ReactNode;
  targetFps?: number;
  enableAutoQuality?: boolean;
}

export const PerformanceManager: React.FC<PerformanceManagerProps> = ({
  children,
  targetFps = PERFORMANCE_THRESHOLDS.TARGET_FPS,
  enableAutoQuality = true
}) => {
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>(QUALITY_PRESETS.high);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFps: 60,
    frameTime: 16.67,
    isStable: true
  });

  // Performance monitoring refs
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const frameTimeHistory = useRef<number[]>([]);
  const lastQualityAdjustment = useRef(0);
  const animationId = useRef<number>();
  const currentQualityLevel = useRef<'high' | 'medium' | 'low'>('high');

  // Memory monitoring
  const memoryMonitorInterval = useRef<NodeJS.Timeout>();

  // Performance monitoring loop
  const monitorPerformance = useCallback(() => {
    frameCount.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;
    const frameTime = deltaTime;

    // Update frame time history
    frameTimeHistory.current.push(frameTime);
    if (frameTimeHistory.current.length > PERFORMANCE_THRESHOLDS.STABLE_FRAME_COUNT) {
      frameTimeHistory.current.shift();
    }

    // Calculate FPS every 250ms
    if (deltaTime >= 250) {
      const currentFps = Math.round((frameCount.current * 1000) / deltaTime);
      
      // Update FPS history
      fpsHistory.current.push(currentFps);
      if (fpsHistory.current.length > 20) {
        fpsHistory.current.shift();
      }

      // Calculate average FPS
      const avgFps = Math.round(
        fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
      );

      // Calculate average frame time
      const avgFrameTime = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length;

      // Determine stability
      const fpsVariance = Math.max(...fpsHistory.current) - Math.min(...fpsHistory.current);
      const isStable = fpsVariance < 10 && avgFps >= targetFps * 0.9;

      // Update metrics
      setPerformanceMetrics({
        fps: currentFps,
        avgFps,
        frameTime: avgFrameTime,
        isStable
      });

      // Auto quality adjustment
      if (enableAutoQuality && currentTime - lastQualityAdjustment.current > PERFORMANCE_THRESHOLDS.QUALITY_ADJUSTMENT_DELAY) {
        adjustQualityBasedOnPerformance(avgFps, isStable);
      }

      // Reset counters
      frameCount.current = 0;
      lastTime.current = currentTime;
    }

    animationId.current = requestAnimationFrame(monitorPerformance);
  }, [targetFps, enableAutoQuality]);

  // Auto quality adjustment logic
  const adjustQualityBasedOnPerformance = useCallback((avgFps: number, isStable: boolean) => {
    const now = performance.now();
    
    // Don't adjust too frequently
    if (now - lastQualityAdjustment.current < PERFORMANCE_THRESHOLDS.QUALITY_ADJUSTMENT_DELAY) {
      return;
    }

    let newQualityLevel = currentQualityLevel.current;

    // Downgrade quality if performance is poor
    if (avgFps < PERFORMANCE_THRESHOLDS.CRITICAL_FPS || !isStable) {
      if (currentQualityLevel.current === 'high') {
        newQualityLevel = 'medium';
      } else if (currentQualityLevel.current === 'medium') {
        newQualityLevel = 'low';
      }
    }
    // Upgrade quality if performance is good and stable
    else if (avgFps > targetFps * 1.2 && isStable) {
      if (currentQualityLevel.current === 'low') {
        newQualityLevel = 'medium';
      } else if (currentQualityLevel.current === 'medium') {
        newQualityLevel = 'high';
      }
    }

    // Apply quality change if needed
    if (newQualityLevel !== currentQualityLevel.current) {
      currentQualityLevel.current = newQualityLevel;
      setQualitySettings(QUALITY_PRESETS[newQualityLevel]);
      lastQualityAdjustment.current = now;
      
      console.log(`Performance: Quality adjusted to ${newQualityLevel} (FPS: ${avgFps})`);
    }
  }, [targetFps]);

  // Memory monitoring
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMemory = memInfo.usedJSHeapSize;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        memoryUsage: usedMemory
      }));

      // Warn if memory usage is high
      if (usedMemory > PERFORMANCE_THRESHOLDS.MEMORY_WARNING_THRESHOLD) {
        console.warn(`High memory usage detected: ${(usedMemory / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }, []);

  // Level of Detail calculation based on viewing distance
  const getOptimalQuality = useCallback((distance: number): QualitySettings => {
    if (!qualitySettings.enableLOD) {
      return qualitySettings;
    }

    // Distance-based quality scaling
    const normalizedDistance = Math.max(0, Math.min(1, (distance - 10) / 40)); // 10-50 units range
    
    const lodSettings = { ...qualitySettings };
    
    // Reduce particle count with distance
    lodSettings.particleCount = Math.floor(qualitySettings.particleCount * (1 - normalizedDistance * 0.7));
    
    // Reduce granulation detail with distance
    lodSettings.granulationDetail = qualitySettings.granulationDetail * (1 - normalizedDistance * 0.5);
    
    // Reduce flare count with distance
    lodSettings.flareMaxCount = Math.max(1, Math.floor(qualitySettings.flareMaxCount * (1 - normalizedDistance * 0.5)));
    
    // Simplify shader complexity at far distances
    if (normalizedDistance > 0.7 && qualitySettings.shaderComplexity === 'high') {
      lodSettings.shaderComplexity = 'medium';
    } else if (normalizedDistance > 0.9 && qualitySettings.shaderComplexity === 'medium') {
      lodSettings.shaderComplexity = 'low';
    }

    return lodSettings;
  }, [qualitySettings]);

  // Manual quality update
  const updateQuality = useCallback((settings: Partial<QualitySettings>) => {
    setQualitySettings(prev => ({ ...prev, ...settings }));
    lastQualityAdjustment.current = performance.now();
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    animationId.current = requestAnimationFrame(monitorPerformance);
    
    // Start memory monitoring
    memoryMonitorInterval.current = setInterval(monitorMemory, 5000);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      if (memoryMonitorInterval.current) {
        clearInterval(memoryMonitorInterval.current);
      }
    };
  }, [monitorPerformance, monitorMemory]);

  const contextValue: PerformanceManagerContextType = {
    qualitySettings,
    performanceMetrics,
    updateQuality,
    getOptimalQuality,
    isPerformanceCritical: performanceMetrics.avgFps < PERFORMANCE_THRESHOLDS.CRITICAL_FPS
  };

  return (
    <PerformanceManagerContext.Provider value={contextValue}>
      {children}
    </PerformanceManagerContext.Provider>
  );
};

export const usePerformanceManager = (): PerformanceManagerContextType => {
  const context = useContext(PerformanceManagerContext);
  if (!context) {
    throw new Error('usePerformanceManager must be used within a PerformanceManager');
  }
  return context;
};