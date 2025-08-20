import React, { useEffect } from 'react';
import { TVCameraControls } from './TVCameraControls';
import { useDevice } from '../../../state/DeviceContext';
import { useUI } from '../../../state/UIContext';
import { useISS } from '../../../state/ISSContext';
import { useTVCameraNavigation } from '../../../hooks/useTVCameraNavigation';
import { type DirectionalInput } from '../../../utils/tvCameraConfig';

export interface TVCameraControlsContainerProps {
  // Optional external callbacks for camera control integration
  onDirectionalInput?: (direction: DirectionalInput, isActive: boolean) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  onZoomModeChange?: (mode: 'in' | 'out') => void;
}

/**
 * Container component that manages TV camera controls visibility and input handling.
 * 
 * Features:
 * - Automatic visibility management based on device profile, menu state, and camera mode
 * - Integrated keyboard input handling for directional navigation and zoom
 * - Forwards external callbacks for camera control integration
 * - Manages UI state synchronization
 */
export const TVCameraControlsContainer: React.FC<TVCameraControlsContainerProps> = ({
  onDirectionalInput,
  onZoomStart,
  onZoomEnd,
  onZoomModeChange
}) => {
  const { isTVProfile } = useDevice();
  const { state: uiState, setTVCameraControlsVisible } = useUI();
  const { state: issState } = useISS();

  // Use the TV camera navigation hook for input handling
  const { state: navigationState, callbacks } = useTVCameraNavigation({
    onDirectionalInput,
    onZoomStart,
    onZoomEnd,
    onZoomModeChange
  });

  // The navigation hook already handles the visibility logic, so we use its state
  const shouldShowControls = navigationState.isEnabled;

  // Update UI context when visibility changes
  useEffect(() => {
    setTVCameraControlsVisible(shouldShowControls);
  }, [shouldShowControls, setTVCameraControlsVisible]);

  // Log visibility state changes for debugging
  useEffect(() => {
    console.log('📺 TVCameraControls visibility check:', {
      isTVProfile,
      hamburgerMenuVisible: uiState.hamburgerMenuVisible,
      followISS: issState.followISS,
      earthRotateMode: issState.earthRotateMode,
      shouldShowControls,
      finalVisible: uiState.tvCameraControlsVisible,
      navigationEnabled: navigationState.isEnabled
    });
  }, [
    isTVProfile,
    uiState.hamburgerMenuVisible,
    uiState.tvCameraControlsVisible,
    issState.followISS,
    issState.earthRotateMode,
    shouldShowControls,
    navigationState.isEnabled
  ]);

  // Don't render anything if not in TV profile
  if (!isTVProfile) {
    return null;
  }

  return (
    <TVCameraControls
      visible={uiState.tvCameraControlsVisible}
      zoomMode={navigationState.zoomMode}
      isZooming={navigationState.isZooming}
      activeDirections={navigationState.activeDirections}
      onDirectionalInput={callbacks.onDirectionalInput}
      onZoomStart={callbacks.onZoomStart}
      onZoomEnd={callbacks.onZoomEnd}
    />
  );
};

export default TVCameraControlsContainer;