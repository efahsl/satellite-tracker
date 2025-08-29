import React, { memo, useMemo } from 'react';
import { useISS } from '../../../state/ISSContext';
import Coordinates from '../../InfoPanel/Coordinates';
import Altitude from '../../InfoPanel/Altitude';
import styles from './FloatingInfoPanel.module.css';

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
      className={`${styles.floatingInfoPanel} ${className}`}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>ISS Position</h3>
          <div className={styles.timestamp}>
            Last updated: {formattedTimestamp}
          </div>
        </div>
        
        <div className={styles.data}>
          <Coordinates />
          <Altitude />
        </div>
      </div>
    </div>
  );
});

FloatingInfoPanel.displayName = 'FloatingInfoPanel';

export default FloatingInfoPanel;
