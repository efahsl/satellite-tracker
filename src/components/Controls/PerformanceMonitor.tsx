import React from 'react';
import { usePerformance } from '../../state/PerformanceContext';
import './PerformanceMonitor.css';

export function PerformanceMonitor() {
  const { state } = usePerformance();
  const { tier, settings } = state;

  return (
    <div className="performance-monitor">
      <div className="performance-monitor__header">
        <h4>Performance Monitor</h4>
        <span className="performance-monitor__tier">{tier.toUpperCase()}</span>
      </div>
      
      <div className="performance-monitor__settings">
        <div className="performance-monitor__setting">
          <span>Earth Quality:</span>
          <span className="performance-monitor__value">{settings.earthQuality}</span>
        </div>
        <div className="performance-monitor__setting">
          <span>Trail Length:</span>
          <span className="performance-monitor__value">{settings.trailLength}</span>
        </div>
        <div className="performance-monitor__setting">
          <span>Trail Segments:</span>
          <span className="performance-monitor__value">{settings.trailSegments}</span>
        </div>
        <div className="performance-monitor__setting">
          <span>Shadows:</span>
          <span className="performance-monitor__value">{settings.shadowEnabled ? 'On' : 'Off'}</span>
        </div>
        <div className="performance-monitor__setting">
          <span>Texture Quality:</span>
          <span className="performance-monitor__value">{settings.textureQuality}</span>
        </div>
        <div className="performance-monitor__setting">
          <span>Animation FPS:</span>
          <span className="performance-monitor__value">{settings.animationFPS}</span>
        </div>
        <div className="performance-monitor__setting">
          <span>Update Interval:</span>
          <span className="performance-monitor__value">{settings.updateInterval}ms</span>
        </div>
        <div className="performance-monitor__setting">
          <span>City Effects:</span>
          <span className="performance-monitor__value">{settings.cityEffects ? 'On' : 'Off'}</span>
        </div>
        <div className="performance-monitor__setting">
          <span>Sun:</span>
          <span className="performance-monitor__value">{settings.sunEnabled ? 'On' : 'Off'}</span>
        </div>
      </div>
    </div>
  );
} 