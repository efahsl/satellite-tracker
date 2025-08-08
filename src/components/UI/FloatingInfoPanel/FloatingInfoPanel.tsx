import React, { memo, useMemo } from 'react';
import { useISS } from '../../../state/ISSContext';
import Coordinates from '../../InfoPanel/Coordinates';
import Altitude from '../../InfoPanel/Altitude';
import './FloatingInfoPanel.css';

interface FloatingInfoPanelProps {
  className?: string;
}

const FloatingInfoPanel: React.FC<FloatingInfoPanelProps> = memo(({ className = '' }) => {
  const { state } = useISS();

  const formattedTimestamp = useMemo(() => {
    return state.position
      ? new Date(state.position.timestamp * 1000).toLocaleTimeString()
      : "Loading...";
  }, [state.position?.timestamp]);

  return (
    <div 
      className={`floating-info-panel ${className}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
        maxWidth: '300px',
        minWidth: '250px'
      }}
    >
      <div 
        className="floating-info-panel__content"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="floating-info-panel__header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h3 className="floating-info-panel__title">ISS Position</h3>
          <div className="floating-info-panel__timestamp">
            Last updated: {formattedTimestamp}
          </div>
        </div>
        
        <div className="floating-info-panel__data">
          <Coordinates />
          <Altitude />
        </div>
      </div>
    </div>
  );
});

FloatingInfoPanel.displayName = 'FloatingInfoPanel';

export default FloatingInfoPanel;
