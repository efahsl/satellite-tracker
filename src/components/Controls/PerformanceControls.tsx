import React from 'react';
import { usePerformance, PerformanceTier } from '../../state/PerformanceContext';
import './PerformanceControls.css';

interface PerformanceControlsProps {
  className?: string;
}

export function PerformanceControls({ className = '' }: PerformanceControlsProps) {
  const { state, setTier } = usePerformance();
  const { tier } = state;

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
    </div>
  );
} 