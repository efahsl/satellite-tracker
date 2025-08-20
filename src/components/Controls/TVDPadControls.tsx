import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDevice } from '../../state/DeviceContext';
import { useUI } from '../../state/UIContext';

export type Direction = 'north' | 'south' | 'east' | 'west';
export type ZoomMode = 'in' | 'out';

interface TVDPadControlsProps {
  isVisible: boolean;
  onDirectionPress: (direction: Direction) => void;
  onZoomStart: (mode: ZoomMode) => void;
  onZoomEnd: () => void;
  zoomMode: ZoomMode;
}

const TVDPadControls: React.FC<TVDPadControlsProps> = ({
  isVisible,
  onDirectionPress,
  onZoomStart,
  onZoomEnd,
  zoomMode,
}) => {
  const { isTVProfile } = useDevice();
  const { setHamburgerMenuVisible } = useUI();
  
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showControls, setShowControls] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle fade-in animation
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowControls(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowControls(false);
    }
  }, [isVisible]);

  // Start continuous panning for a direction
  const startPanning = useCallback((direction: Direction) => {
    if (isPanning && activeDirection === direction) return; // Already panning this direction
    
    // Stop any existing panning
    if (panIntervalRef.current) {
      clearInterval(panIntervalRef.current);
    }
    
    setIsPanning(true);
    setActiveDirection(direction);
    
    // Initial movement
    onDirectionPress(direction);
    
    // Start continuous movement
    panIntervalRef.current = setInterval(() => {
      onDirectionPress(direction);
    }, 50); // 20fps for smooth continuous movement
  }, [isPanning, activeDirection, onDirectionPress]);

  // Stop continuous panning
  const stopPanning = useCallback(() => {
    if (panIntervalRef.current) {
      clearInterval(panIntervalRef.current);
      panIntervalRef.current = null;
    }
    setIsPanning(false);
    setActiveDirection(null);
  }, []);

  // Cleanup panning interval on unmount
  useEffect(() => {
    return () => {
      if (panIntervalRef.current) {
        clearInterval(panIntervalRef.current);
      }
    };
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isTVProfile || !isVisible) return;
    
    // Prevent default behavior for our handled keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(event.key)) {
      event.preventDefault();
    }

    // Track pressed keys to avoid repeat events
    if (pressedKeys.has(event.key)) return;
    
    const newPressedKeys = new Set(pressedKeys);
    newPressedKeys.add(event.key);
    setPressedKeys(newPressedKeys);

    switch (event.key) {
      case 'ArrowUp':
        startPanning('north');
        break;
      case 'ArrowDown':
        startPanning('south');
        break;
      case 'ArrowLeft':
        startPanning('west');
        break;
      case 'ArrowRight':
        startPanning('east');
        break;
      case 'Enter':
        if (!isZooming) {
          setIsZooming(true);
          onZoomStart(zoomMode);
        }
        break;
      case 'Escape':
        // Hide D-pad controls and show menu
        setHamburgerMenuVisible(true);
        break;
    }
  }, [isTVProfile, isVisible, pressedKeys, startPanning, onZoomStart, zoomMode, isZooming, setHamburgerMenuVisible]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isTVProfile || !isVisible) return;

    const newPressedKeys = new Set(pressedKeys);
    newPressedKeys.delete(event.key);
    setPressedKeys(newPressedKeys);

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        stopPanning();
        break;
      case 'Enter':
        if (isZooming) {
          setIsZooming(false);
          onZoomEnd();
        }
        break;
    }
  }, [isTVProfile, isVisible, pressedKeys, stopPanning, onZoomEnd, isZooming]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!isTVProfile || !isVisible) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, isTVProfile, isVisible]);

  // Reset state when component becomes invisible
  useEffect(() => {
    if (!isVisible) {
      stopPanning();
      setIsZooming(false);
      setPressedKeys(new Set());
    }
  }, [isVisible, stopPanning]);

  // Don't render if not in TV mode or not visible
  if (!isTVProfile || !isVisible) {
    return null;
  }

  return (
    <div className={`tv-dpad-controls ${showControls ? 'visible' : ''}`}>
      {/* D-Pad Container */}
      <div 
        className="dpad-container"
        role="group"
        aria-label="Camera direction controls"
      >
        {/* Up Arrow */}
        <button
          className={`dpad-button dpad-up ${activeDirection === 'north' ? 'active' : ''} ${isPanning && activeDirection === 'north' ? 'panning' : ''}`}
          aria-label="Move camera north"
          aria-pressed={activeDirection === 'north'}
          tabIndex={-1}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 4l-8 8h5v8h6v-8h5z"/>
          </svg>
        </button>

        {/* Middle Row: Left and Right */}
        <div className="dpad-middle-row">
          <button
            className={`dpad-button dpad-left ${activeDirection === 'west' ? 'active' : ''} ${isPanning && activeDirection === 'west' ? 'panning' : ''}`}
            aria-label="Move camera west"
            aria-pressed={activeDirection === 'west'}
            tabIndex={-1}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 12l8-8v5h8v6h-8v5z"/>
            </svg>
          </button>

          <div className="dpad-center" aria-hidden="true">
            <div className="center-dot"></div>
          </div>

          <button
            className={`dpad-button dpad-right ${activeDirection === 'east' ? 'active' : ''} ${isPanning && activeDirection === 'east' ? 'panning' : ''}`}
            aria-label="Move camera east"
            aria-pressed={activeDirection === 'east'}
            tabIndex={-1}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 12l-8 8v-5H4V9h8V4z"/>
            </svg>
          </button>
        </div>

        {/* Down Arrow */}
        <button
          className={`dpad-button dpad-down ${activeDirection === 'south' ? 'active' : ''} ${isPanning && activeDirection === 'south' ? 'panning' : ''}`}
          aria-label="Move camera south"
          aria-pressed={activeDirection === 'south'}
          tabIndex={-1}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 20l8-8h-5V4H9v8H4z"/>
          </svg>
        </button>
      </div>

      {/* Zoom Instructions */}
      <div 
        className="zoom-instructions"
        role="status"
        aria-live="polite"
        aria-label="Zoom controls"
      >
        {/* Zoom Instructions */}
        <div className={`zoom-text ${isZooming ? 'zooming' : ''}`}>
          {zoomMode === 'in' ? 'Hold SELECT to Zoom IN' : 'Hold SELECT to Zoom OUT'}
        </div>
        
        {isZooming && (
          <div className="zoom-indicator" aria-label={`Currently ${zoomMode === 'in' ? 'zooming in' : 'zooming out'}`}>
            <div className="zoom-progress-bar" role="progressbar" aria-label="Zoom progress">
              <div className="zoom-progress-fill"></div>
            </div>
            <span className="zoom-status">
              {zoomMode === 'in' ? 'Zooming In...' : 'Zooming Out...'}
            </span>
          </div>
        )}
      </div>

      {/* Back Button Hint */}
      <div className="back-hint" role="note" aria-label="Navigation hint">
        <span>Press BACK to open menu</span>
      </div>

      <style jsx>{`
        .tv-dpad-controls {
          position: fixed;
          left: 40px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
          user-select: none;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease-in-out;
        }

        .tv-dpad-controls.visible {
          opacity: 1;
        }

        .dpad-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
        }

        .dpad-middle-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dpad-button {
          width: 70px;
          height: 70px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          color: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(12px);
          cursor: pointer;
          pointer-events: auto;
          position: relative;
          overflow: hidden;
        }

        .dpad-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .dpad-button:hover::before {
          transform: translateX(100%);
        }

        .dpad-button:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
          border-color: rgba(255, 255, 255, 0.5);
          color: white;
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2);
        }

        .dpad-button.active {
          background: linear-gradient(145deg, rgba(0, 123, 255, 0.8), rgba(0, 123, 255, 0.6));
          border-color: rgba(0, 123, 255, 1);
          color: white;
          transform: scale(0.95);
          box-shadow: 
            0 0 30px rgba(0, 123, 255, 0.6),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
        }

        .dpad-button.panning {
          background: linear-gradient(145deg, rgba(0, 123, 255, 0.9), rgba(0, 123, 255, 0.7));
          border-color: rgba(0, 123, 255, 1);
          color: white;
          transform: scale(0.95);
          box-shadow: 
            0 0 40px rgba(0, 123, 255, 0.8),
            inset 0 2px 4px rgba(255, 255, 255, 0.3);
          animation: panning-pulse 0.8s infinite;
        }

        @keyframes panning-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 40px rgba(0, 123, 255, 0.8),
              inset 0 2px 4px rgba(255, 255, 255, 0.3);
          }
          50% { 
            box-shadow: 
              0 0 60px rgba(0, 123, 255, 1),
              inset 0 2px 4px rgba(255, 255, 255, 0.4);
          }
        }

        .dpad-center {
          width: 70px;
          height: 70px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }

        .center-dot {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        .zoom-instructions {
          text-align: center;
          color: rgba(255, 255, 255, 0.95);
          font-size: 20px;
          font-weight: 600;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
          margin-bottom: 20px;
        }

        .zoom-text {
          transition: all 0.3s ease;
          margin-bottom: 12px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          backdrop-filter: blur(8px);
        }

        .zoom-text.zooming {
          color: rgba(0, 123, 255, 1);
          text-shadow: 0 0 15px rgba(0, 123, 255, 0.7);
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.3);
        }

        .zoom-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .zoom-progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .zoom-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(0, 123, 255, 0.8), rgba(0, 123, 255, 1));
          border-radius: 2px;
          animation: zoom-progress 1s infinite;
        }

        @keyframes zoom-progress {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 20%; }
        }

        .zoom-status {
          font-size: 16px;
          color: rgba(0, 123, 255, 0.9);
          animation: pulse-text 1s infinite;
        }

        @keyframes pulse-text {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .back-hint {
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          backdrop-filter: blur(4px);
        }

        /* Responsive adjustments for different TV sizes */
        @media (min-width: 2560px) {
          .tv-dpad-controls {
            left: 60px;
          }
          
          .dpad-button, .dpad-center {
            width: 90px;
            height: 90px;
          }
          
          .dpad-button svg {
            width: 36px;
            height: 36px;
          }
          
          .zoom-instructions {
            font-size: 28px;
          }
          
          .back-hint {
            font-size: 18px;
          }
        }

        @media (max-width: 1600px) {
          .tv-dpad-controls {
            left: 30px;
          }
          
          .dpad-button, .dpad-center {
            width: 60px;
            height: 60px;
          }
          
          .dpad-button svg {
            width: 24px;
            height: 24px;
          }
          
          .zoom-instructions {
            font-size: 18px;
          }
          
          .back-hint {
            font-size: 12px;
          }
        }

        /* Animation for initial appearance */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dpad-container {
          animation: fadeInUp 0.6s ease-out;
        }

        .zoom-instructions {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .back-hint {
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
};

export default TVDPadControls;
