import React from 'react';
import styles from './CameraControls.module.css';

interface DirectionalArrowsProps {
  onDirectionalMove: (direction: 'north' | 'east' | 'south' | 'west') => void;
}

const DirectionalArrows: React.FC<DirectionalArrowsProps> = ({ onDirectionalMove }) => {
  return (
    <div className={styles.directionalArrows}>
      {/* Up Arrow - North */}
      <div className={styles.arrowContainer}>
        <div 
          className={`${styles.arrow} ${styles.arrowUp}`}
          onClick={() => onDirectionalMove('north')}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l8 8h-6v12h-4V10H4l8-8z"/>
          </svg>
        </div>
        <span className={styles.arrowLabel}>NORTH</span>
      </div>

      {/* Left and Right Arrows */}
      <div className={styles.horizontalArrows}>
        {/* Left Arrow - West */}
        <div className={styles.arrowContainer}>
          <div 
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => onDirectionalMove('west')}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 12l8-8v6h12v4H10v6l-8-8z"/>
            </svg>
          </div>
          <span className={styles.arrowLabel}>WEST</span>
        </div>

        {/* Right Arrow - East */}
        <div className={styles.arrowContainer}>
          <div 
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => onDirectionalMove('east')}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12l-8 8v-6H2v-4h12V4l8 8z"/>
            </svg>
          </div>
          <span className={styles.arrowLabel}>EAST</span>
        </div>
      </div>

      {/* Down Arrow - South */}
      <div className={styles.arrowContainer}>
        <div 
          className={`${styles.arrow} ${styles.arrowDown}`}
          onClick={() => onDirectionalMove('south')}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22l-8-8h6V2h4v12h6l-8 8z"/>
          </svg>
        </div>
        <span className={styles.arrowLabel}>SOUTH</span>
      </div>
    </div>
  );
};

export default DirectionalArrows;