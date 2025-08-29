import { useEffect } from 'react';
import { useDevice } from '../state/DeviceContext';
import { useUI } from '../state/UIContext';
import { useISS } from '../state/ISSContext';

/**
 * Props for the TV controls state hook
 */
interface UseTVControlsStateProps {
  /** Whether controls should be enabled */
  isEnabled?: boolean;
}

/**
 * Return type for the TV controls state hook
 */
interface UseTVControlsStateReturn {
  /** Whether controls are currently enabled */
  isControlsEnabled: boolean;
}

/**
 * Custom hook for managing TV controls state
 * Determines when TV camera controls should be enabled based on device and app state
 */
export const useTVControlsState = ({
  isEnabled = true
}: UseTVControlsStateProps = {}): UseTVControlsStateReturn => {
  
  // Context hooks
  const { isTVProfile } = useDevice();
  const { state: uiState } = useUI();
  const { state: issState } = useISS();

  // Calculate if controls should be enabled
  const manualMode = !issState.followISS && !issState.earthRotateMode;
  const isControlsEnabled = isEnabled && 
    isTVProfile && 
    !uiState.hamburgerMenuVisible && 
    manualMode;
    
  // Debug: Log current window width and TV profile status
  useEffect(() => {
    console.log('📊 TV Navigation State:', {
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined',
      isTVProfile,
      hamburgerMenuVisible: uiState.hamburgerMenuVisible,
      manualMode,
      followISS: issState.followISS,
      earthRotateMode: issState.earthRotateMode,
      isControlsEnabled,
      isInZoomMode: uiState.isInZoomMode,
      activeZoomDirection: uiState.activeZoomDirection
    });
  }, [isTVProfile, uiState.hamburgerMenuVisible, manualMode, isControlsEnabled, issState.followISS, issState.earthRotateMode, uiState.isInZoomMode, uiState.activeZoomDirection]);

  return {
    isControlsEnabled
  };
};

export default useTVControlsState;