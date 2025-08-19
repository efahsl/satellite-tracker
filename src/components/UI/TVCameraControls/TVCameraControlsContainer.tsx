import React, { useEffect, useMemo } from 'react';
import { TVCameraControls } from './TVCameraControls';
import { useDevice } from '../../../state/DeviceContext';
import { useUI } from '../../../state/UIContext';
import { useISS } from '../../../state/ISSContext';
import { DIRECTIONAL_INPUTS, ZOOM_MODES, type DirectionalInput } from '../../../utils/tvCameraConfig';

export interface TVCameraControlsContainerProps {
  activeDirections?: Set<DirectionalInput>;
  onDirectionalInput?: (direction: DirectionalInput) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

/**
 * Container component that manages TV camera controls visibility based on:
 * 1. Device profile (must be TV profile - exactly 1920px width)
 * 2. Hamburger menu state (controls hidden when menu is visible)
 * 3. Manual mode requirement (controls only shown in manual camera mode)
 */
export const TVCameraControlsContainer: React.FC<TVCameraControlsContainerProps> = ({
  activeDirections = new Set(),
  onDirectionalInput,
  onZoomStart,
  onZoomEnd
}) => {
  const { isTVProfile } = useDevice();
  const { state: uiState, setTVCameraControlsVisible } = useUI();
  const { state: issState } = useISS();

  // Determine if controls should be visible based on all conditions
  const shouldShowControls = useMemo(() => {
    // Must be TV profile (exactly 1920px width)
    if (!isTVProfile) {
      return false;
    }

    // Must not have hamburger menu visible (back button hides controls)
    if (uiState.hamburgerMenuVisible) {
      return false;
    }

    // Must be in manual mode (not following ISS or rotating Earth)
    const isManualMode = !issState.followISS && !issState.earthRotateMode;
    if (!isManualMode) {
      return false;
    }

    return true;
  }, [isTVProfile, uiState.hamburgerMenuVisible, issState.followISS, issState.earthRotateMode]);

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
      finalVisible: uiState.tvCameraControlsVisible
    });
  }, [
    isTVProfile,
    uiState.hamburgerMenuVisible,
    uiState.tvCameraControlsVisible,
    issState.followISS,
    issState.earthRotateMode,
    shouldShowControls
  ]);

  // Don't render anything if not in TV profile
  if (!isTVProfile) {
    return null;
  }

  return (
    <TVCameraControls
      visible={uiState.tvCameraControlsVisible}
      zoomMode={uiState.zoomMode}
      isZooming={uiState.isZooming}
      activeDirections={activeDirections}
      onDirectionalInput={onDirectionalInput}
      onZoomStart={onZoomStart}
      onZoomEnd={onZoomEnd}
    />
  );
};

export default TVCameraControlsContainer;