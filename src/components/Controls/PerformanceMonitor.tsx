import React from 'react';
import { usePerformance } from '../../state/PerformanceContext';
import styles from './PerformanceMonitor.module.css';

export function PerformanceMonitor() {
  const { state } = usePerformance();
  const { tier, settings } = state;

  return (
    <div className={styles.performanceMonitor}>
      <div className={styles.header}>
        <h4>Performance Monitor</h4>
        <span className={styles.tier}>{tier.toUpperCase()}</span>
      </div>
      
      <div className={styles.settings}>
        <div className={styles.setting}>
          <span>Earth Quality:</span>
          <span className={styles.value}>{settings.earthQuality}</span>
        </div>
        <div className={styles.setting}>
          <span>Trail Length:</span>
          <span className={styles.value}>{settings.trailLength}</span>
        </div>
        <div className={styles.setting}>
          <span>Trail Segments:</span>
          <span className={styles.value}>{settings.trailSegments}</span>
        </div>
        <div className={styles.setting}>
          <span>Shadows:</span>
          <span className={styles.value}>{settings.shadowEnabled ? 'On' : 'Off'}</span>
        </div>
        <div className={styles.setting}>
          <span>Texture Quality:</span>
          <span className={styles.value}>{settings.textureQuality}</span>
        </div>
        <div className={styles.setting}>
          <span>Animation FPS:</span>
          <span className={styles.value}>{settings.animationFPS}</span>
        </div>
        <div className={styles.setting}>
          <span>Update Interval:</span>
          <span className={styles.value}>{settings.updateInterval}ms</span>
        </div>
        <div className={styles.setting}>
          <span>City Effects:</span>
          <span className={styles.value}>{settings.cityEffects ? 'On' : 'Off'}</span>
        </div>
        <div className={styles.setting}>
          <span>Sun:</span>
          <span className={styles.value}>{settings.sunEnabled ? 'On' : 'Off'}</span>
        </div>
      </div>
    </div>
  );
} 