import React, { useState } from 'react';
import { usePerformance, PerformanceTier } from '../../state/PerformanceContext';
import './PerformanceControls.css';

interface PerformanceControlsProps {
  className?: string;
}

export function PerformanceControls({ className = '' }: PerformanceControlsProps) {
  const { state, setTier } = usePerformance();
  const { tier } = state;
  const [showDetails, setShowDetails] = useState(false);

  const handleTierChange = (newTier: PerformanceTier) => {
    if (newTier !== tier) {
      setTier(newTier);
    }
  };

  const getTierLabel = (tier: PerformanceTier) => {
    switch (tier) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return tier;
    }
  };

  const getTierDescription = (tier: PerformanceTier) => {
    switch (tier) {
      case 'high': return 'Best quality, high performance impact';
      case 'medium': return 'Balanced quality and performance';
      case 'low': return 'Basic quality, minimal performance impact';
      default: return '';
    }
  };

  const getTierDetails = (tier: PerformanceTier) => {
    const settings = state.settings;
    return [
      { label: 'Earth Quality', value: settings.earthQuality },
      { label: 'Trail Length', value: `${settings.trailLength} points` },
      { label: 'Trail Segments', value: settings.trailSegments },
      { label: 'Shadows', value: settings.shadowEnabled ? 'On' : 'Off' },
      { label: 'Texture Quality', value: settings.textureQuality },
      { label: 'Animation FPS', value: settings.animationFPS },
      { label: 'Update Interval', value: `${settings.updateInterval}ms` },
      { label: 'City Effects', value: settings.cityEffects ? 'On' : 'Off' },
      { label: 'Sun', value: settings.sunEnabled ? 'On' : 'Off' },
    ];
  };

  return (
    <div className={`performance-controls ${className}`}>
      <div className="performance-controls__header">
        <h3>Performance Tier</h3>
        <p className="performance-controls__description">
          {getTierDescription(tier)}
        </p>
      </div>
      
      <div className="performance-controls__buttons">
        {(['high', 'medium', 'low'] as PerformanceTier[]).map((tierOption) => (
          <button
            key={tierOption}
            className={`performance-controls__button ${
              tier === tierOption ? 'performance-controls__button--active' : ''
            }`}
            onClick={() => handleTierChange(tierOption)}
            title={getTierDescription(tierOption)}
          >
            <span className="performance-controls__button-label">
              {getTierLabel(tierOption)}
            </span>
            {tier === tierOption && (
              <span className="performance-controls__button-indicator">✓</span>
            )}
          </button>
        ))}
      </div>
      
      <div className="performance-controls__current">
        <span className="performance-controls__current-label">Current:</span>
        <span className="performance-controls__current-tier">
          {getTierLabel(tier)}
        </span>
      </div>

      {/* Details Toggle */}
      <div className="performance-controls__details-toggle">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="performance-controls__details-button"
        >
          <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          <span className={`performance-controls__details-arrow ${showDetails ? 'performance-controls__details-arrow--expanded' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="performance-controls__details">
          <h4 className="performance-controls__details-title">
            Current Tier Settings
          </h4>
          <div className="performance-controls__details-grid">
            {getTierDetails(tier).map((detail, index) => (
              <div key={index} className="performance-controls__detail-item">
                <span className="performance-controls__detail-label">{detail.label}:</span>
                <span className="performance-controls__detail-value">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 