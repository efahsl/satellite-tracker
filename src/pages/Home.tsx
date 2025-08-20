import React, { useState, useCallback } from 'react';
import Globe from '../components/Globe/Globe';
import FloatingInfoPanel from '../components/UI/FloatingInfoPanel/FloatingInfoPanel';
import FPSMonitor from '../components/Globe/FPSMonitor';
import TVDPadControls from '../components/Controls/TVDPadControls';
import { useDevice } from '../state/DeviceContext';
import { useUI } from '../state/UIContext';
import type { TVCameraControlsInterface } from '../components/Globe/Controls';

const Home: React.FC = () => {
  const { isMobile, isDesktop, isTVProfile } = useDevice();
  const { state: uiState } = useUI();
  const [tvCameraControls, setTVCameraControls] = useState<TVCameraControlsInterface | null>(null);

  // Handle TV camera controls ready callback
  const handleTVCameraReady = useCallback((controls: TVCameraControlsInterface) => {
    setTVCameraControls(controls);
  }, []);

  return (
    <div 
      className="relative w-full h-screen bg-space-black overflow-hidden"
      style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        position: 'relative',
        // Optimize touch interactions for mobile
        touchAction: isMobile ? 'pan-x pan-y' : 'auto',
        userSelect: 'none'
      }}
    >
      {/* Globe container - takes full screen */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minHeight: '100vh'
        }}
      >
        <Globe 
          width="100%" 
          height="100%" 
          onTVCameraReady={handleTVCameraReady}
        />
      </div>
      
      {/* TV D-Pad Controls - only visible in TV mode when menu is hidden */}
      {isTVProfile && tvCameraControls && (
        <TVDPadControls
          isVisible={uiState.tvDPadControlsVisible || !uiState.hamburgerMenuVisible}
          onDirectionPress={tvCameraControls.handleDirectionPress}
          onZoomStart={tvCameraControls.startZoom}
          onZoomEnd={tvCameraControls.stopZoom}
          zoomMode={tvCameraControls.zoomMode}
        />
      )}
      
      {/* FPS Monitor - positioned in top-right corner with responsive positioning */}
      {uiState.fpsMonitorVisible && (
        <div 
          className="absolute z-10"
          style={{
            top: isMobile ? '10px' : '20px',
            right: isMobile ? '10px' : '20px'
          }}
        >
          <FPSMonitor position="top-right" />
        </div>
      )}

      {/* Floating Info Panel - responsive positioning */}
      {uiState.infoPanelVisible && (
        <div 
          className="absolute z-10"
          style={{
            bottom: isMobile ? '15px' : '20px',
            right: isDesktop ? '20px' : '15px',
            left: isMobile ? '15px' : 'auto'
          }}
        >
          <FloatingInfoPanel />
        </div>
      )}
    </div>
  );
};

export default Home;
