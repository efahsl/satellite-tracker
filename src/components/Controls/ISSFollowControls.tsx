import React from 'react';
import { useISS } from '../../state/ISSContext';
import './ISSFollowControls.css';

interface ISSFollowControlsProps {
  className?: string;
}

export function ISSFollowControls({ className = '' }: ISSFollowControlsProps) {
  const { state, dispatch } = useISS();

  const handleToggleFollow = () => {
    dispatch({ type: 'TOGGLE_FOLLOW_ISS' });
  };

  return (
    <div className={`iss-follow-controls ${className}`}>
      <div className="iss-follow-controls__header">
        <h3>Camera Tracking</h3>
        <p className="iss-follow-controls__description">
          {state.followISS
            ? 'Camera is automatically tracking the ISS'
            : 'Enable automatic camera tracking of the ISS'}
        </p>
      </div>
      
      <div className="iss-follow-controls__button-container">
        <button
          onClick={handleToggleFollow}
          className={`iss-follow-controls__button ${
            state.followISS ? 'iss-follow-controls__button--active' : ''
          }`}
        >
          <span className="iss-follow-controls__button-label">
            {state.followISS ? 'Following ISS' : 'Follow ISS'}
          </span>
          {state.followISS && (
            <span className="iss-follow-controls__button-indicator">✓</span>
          )}
        </button>
      </div>
      
      <div className="iss-follow-controls__status">
        <span className="iss-follow-controls__status-label">Status:</span>
        <span className={`iss-follow-controls__status-value ${
          state.followISS ? 'iss-follow-controls__status-value--active' : ''
        }`}>
          {state.followISS ? 'Tracking' : 'Manual'}
        </span>
      </div>
    </div>
  );
}