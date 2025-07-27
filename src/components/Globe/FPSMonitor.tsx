import React, { useRef, useEffect, useState, memo } from 'react';

interface FPSMonitorProps {
  warningThreshold?: number;
  criticalThreshold?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const FPSMonitor: React.FC<FPSMonitorProps> = memo(({
  warningThreshold = 30,
  criticalThreshold = 20,
  position = 'top-right'
}) => {
  const [fps, setFps] = useState(60);
  const [avgFps, setAvgFps] = useState(60);
  const [minFps, setMinFps] = useState(60);
  const [maxFps, setMaxFps] = useState(60);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const animationId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime.current;
      
      // Update FPS every 250ms
      if (delta >= 250) {
        const currentFps = Math.round((frameCount.current * 1000) / delta);
        setFps(currentFps);
        
        // Update history
        fpsHistory.current.push(currentFps);
        if (fpsHistory.current.length > 20) {
          fpsHistory.current.shift();
        }
        
        // Calculate statistics
        const avg = Math.round(
          fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
        );
        setAvgFps(avg);
        
        const min = Math.min(...fpsHistory.current);
        const max = Math.max(...fpsHistory.current);
        setMinFps(min);
        setMaxFps(max);
        
        // Reset counters
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId.current = requestAnimationFrame(measureFPS);
    };
    
    animationId.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  // Determine color based on FPS
  const getColor = (fps: number) => {
    if (fps >= warningThreshold) return '#00ff00'; // Green
    if (fps >= criticalThreshold) return '#ffaa00'; // Orange
    return '#ff0000'; // Red
  };

  // Position styles
  const positionStyles = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 }
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles[position],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.4',
        minWidth: '120px',
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
        FPS: <span style={{ color: getColor(fps) }}>{fps}</span>
      </div>
      <div style={{ opacity: 0.8 }}>
        <div>Avg: <span style={{ color: getColor(avgFps) }}>{avgFps}</span></div>
        <div>Min: <span style={{ color: getColor(minFps) }}>{minFps}</span></div>
        <div>Max: {maxFps}</div>
      </div>
      {fps < criticalThreshold && (
        <div style={{ 
          marginTop: '5px', 
          padding: '3px', 
          backgroundColor: 'rgba(255, 0, 0, 0.3)',
          borderRadius: '3px',
          fontSize: '11px'
        }}>
          ⚠️ Low Performance
        </div>
      )}
    </div>
  );
});

export default FPSMonitor;
