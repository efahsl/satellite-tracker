import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useISS } from '../../state/ISSContext';
import { useDevice } from '../../state/DeviceContext';
import { latLongToVector3 } from '../../utils/coordinates';
import { EARTH_RADIUS, CAMERA_DISTANCE, ISS_ALTITUDE_SCALE, EARTH_ROTATE_DISTANCE, EARTH_ROTATE_SPEED, EARTH_ROTATE_TRANSITION_SPEED } from '../../utils/constants';
import type { Direction, ZoomMode } from '../Controls/TVDPadControls';

interface ControlsProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  dampingFactor?: number;
  earthRotateMode?: boolean;
  // TV Camera Control Props
  onTVCameraReady?: (controls: TVCameraControlsInterface) => void;
}

// TV Camera control settings
const TV_CAMERA_SETTINGS = {
  rotationSpeed: 0.12, // Slightly reduced for smoother movement
  zoomSpeed: 0.015,    // Slightly reduced for more controlled zoom
  boundaries: {
    minPolarAngle: 0.05,  // Allow slightly closer to poles
    maxPolarAngle: Math.PI - 0.05,  // Allow slightly closer to poles
    minDistance: 1.8,     // Allow closer zoom
    maxDistance: 20       // Allow further zoom out
  }
};

export interface TVCameraControlsInterface {
  handleDirectionPress: (direction: Direction) => void;
  startZoom: (mode: ZoomMode) => void;
  stopZoom: () => void;
  zoomMode: ZoomMode;
  isZooming: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enableZoom = true,
  enablePan = true,
  dampingFactor = 0.1,
  earthRotateMode = false,
  onTVCameraReady,
}) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { state } = useISS();
  const { isTVProfile } = useDevice();
  const cameraPositionRef = useRef<Vector3>(new Vector3(0, 0, CAMERA_DISTANCE));
  const lastFollowState = useRef<boolean>(false);
  const lastEarthRotateState = useRef<boolean>(false);
  const earthRotateAngle = useRef<number>(0);
  
  // TV Camera Controls State
  const [zoomMode, setZoomMode] = useState<ZoomMode>('in');
  const [isZooming, setIsZooming] = useState(false);
  const zoomIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to get spherical coordinates from camera position
  const getSphericalCoordinates = useCallback(() => {
    const position = camera.position.clone();
    const distance = position.length();
    const phi = Math.acos(Math.max(-1, Math.min(1, position.y / distance))); // Polar angle (0 to π)
    const theta = Math.atan2(position.z, position.x); // Azimuthal angle (-π to π)
    
    return { distance, phi, theta };
  }, [camera]);

  // Helper function to set camera position from spherical coordinates
  const setCameraFromSpherical = useCallback((distance: number, phi: number, theta: number) => {
    // Clamp values to boundaries
    const clampedDistance = Math.max(
      TV_CAMERA_SETTINGS.boundaries.minDistance,
      Math.min(TV_CAMERA_SETTINGS.boundaries.maxDistance, distance)
    );
    const clampedPhi = Math.max(
      TV_CAMERA_SETTINGS.boundaries.minPolarAngle,
      Math.min(TV_CAMERA_SETTINGS.boundaries.maxPolarAngle, phi)
    );

    // Convert spherical to cartesian coordinates
    const x = clampedDistance * Math.sin(clampedPhi) * Math.cos(theta);
    const y = clampedDistance * Math.cos(clampedPhi);
    const z = clampedDistance * Math.sin(clampedPhi) * Math.sin(theta);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0); // Always look at Earth center
    
    // Update camera position ref for smooth transitions
    cameraPositionRef.current.copy(camera.position);
  }, [camera]);

  // TV Camera Direction Controls with throttling for performance
  const handleDirectionPress = useCallback((direction: Direction) => {
    if (!isTVProfile) return;
    
    const { distance, phi, theta } = getSphericalCoordinates();
    let newPhi = phi;
    let newTheta = theta;

    switch (direction) {
      case 'north':
        newPhi = Math.max(
          TV_CAMERA_SETTINGS.boundaries.minPolarAngle,
          phi - TV_CAMERA_SETTINGS.rotationSpeed
        );
        break;
      case 'south':
        newPhi = Math.min(
          TV_CAMERA_SETTINGS.boundaries.maxPolarAngle,
          phi + TV_CAMERA_SETTINGS.rotationSpeed
        );
        break;
      case 'east':
        newTheta = theta + TV_CAMERA_SETTINGS.rotationSpeed;
        break;
      case 'west':
        newTheta = theta - TV_CAMERA_SETTINGS.rotationSpeed;
        break;
    }

    setCameraFromSpherical(distance, newPhi, newTheta);
  }, [isTVProfile, getSphericalCoordinates, setCameraFromSpherical]);

  // Optimized zoom function with boundary checking
  const performZoom = useCallback(() => {
    const { distance, phi, theta } = getSphericalCoordinates();
    let newDistance: number;

    if (zoomMode === 'in') {
      newDistance = Math.max(
        TV_CAMERA_SETTINGS.boundaries.minDistance,
        distance - (distance * TV_CAMERA_SETTINGS.zoomSpeed)
      );
    } else {
      newDistance = Math.min(
        TV_CAMERA_SETTINGS.boundaries.maxDistance,
        distance + (distance * TV_CAMERA_SETTINGS.zoomSpeed)
      );
    }

    // Only update if there's a meaningful change
    if (Math.abs(newDistance - distance) > 0.01) {
      setCameraFromSpherical(newDistance, phi, theta);
    }
  }, [zoomMode, getSphericalCoordinates, setCameraFromSpherical]);

  const startZoom = useCallback((mode: ZoomMode) => {
    if (!isTVProfile) return;
    
    setZoomMode(mode);
    setIsZooming(true);

    // Start continuous zooming
    zoomIntervalRef.current = setInterval(() => {
      performZoom();
    }, 16); // ~60fps
  }, [isTVProfile, performZoom]);

  const stopZoom = useCallback(() => {
    if (!isTVProfile) return;
    
    setIsZooming(false);
    
    // Stop continuous zooming
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
      zoomIntervalRef.current = null;
    }

    // Toggle zoom mode for next time
    setZoomMode(prevMode => prevMode === 'in' ? 'out' : 'in');
  }, [isTVProfile]);

  // Expose TV camera controls to parent component
  useEffect(() => {
    if (isTVProfile && onTVCameraReady) {
      const tvControls: TVCameraControlsInterface = {
        handleDirectionPress,
        startZoom,
        stopZoom,
        zoomMode,
        isZooming,
      };
      onTVCameraReady(tvControls);
    }
  }, [isTVProfile, onTVCameraReady, handleDirectionPress, startZoom, stopZoom, zoomMode, isZooming]);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Cleanup animation references on unmount
  useEffect(() => {
    return () => {
      // Reset rotation angle on cleanup
      earthRotateAngle.current = 0;
      // Clear zoom interval
      if (zoomIntervalRef.current) {
        clearInterval(zoomIntervalRef.current);
        zoomIntervalRef.current = null;
      }
    };
  }, []);

  // Camera control logic
  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    
    // Get ISS position if available
    let issPosition: Vector3 | null = null;
    if (state.position) {
      const { latitude, longitude, altitude } = state.position;
      const scaledAltitude = EARTH_RADIUS + altitude * ISS_ALTITUDE_SCALE;
      const [x, y, z] = latLongToVector3(latitude, longitude, scaledAltitude);
      issPosition = new Vector3(x, y, z);
    }
    
    // Handle Earth rotate mode
    if (earthRotateMode) {
      // Always keep the target at Earth center (0,0,0)
      controlsRef.current.target.set(0, 0, 0);
      
      // Update rotation angle
      earthRotateAngle.current += EARTH_ROTATE_SPEED * delta;
      
      // Calculate camera position in equatorial orbit
      const x = Math.cos(earthRotateAngle.current) * EARTH_ROTATE_DISTANCE;
      const z = Math.sin(earthRotateAngle.current) * EARTH_ROTATE_DISTANCE;
      const y = 0; // Keep at equatorial level
      
      const targetPos = new Vector3(x, y, z);
      
      // Smooth transition to Earth rotate position
      cameraPositionRef.current.lerp(targetPos, EARTH_ROTATE_TRANSITION_SPEED);
      camera.position.copy(cameraPositionRef.current);
      
      // Ensure camera is looking at Earth center
      camera.lookAt(0, 0, 0);
      
    } else if (state.followISS && issPosition) {
      // Follow ISS mode
      // Always keep the target at Earth center (0,0,0)
      controlsRef.current.target.set(0, 0, 0);
      
      // Calculate direction from Earth center to ISS
      const earthToIss = issPosition.clone().normalize();
      
      // Calculate distance from Earth center to ISS
      const issDistance = issPosition.length();
      
      // Position camera beyond the ISS along the same Earth-to-ISS line
      // This ensures the ISS is between the camera and Earth center
      const cameraDistance = issDistance * 1.8; // Adjust this multiplier to change the camera distance
      const cameraPos = earthToIss.clone().multiplyScalar(cameraDistance);
      
      // Smoothly move camera to new position
      cameraPositionRef.current.lerp(cameraPos, 0.05);
      camera.position.copy(cameraPositionRef.current);
      
      // If we just switched to follow mode, ensure camera is looking at Earth center
      if (!lastFollowState.current) {
        camera.lookAt(0, 0, 0);
      }
      
    } else {
      // Manual/default mode - maintain default position when transitioning from other modes
      if (lastFollowState.current || lastEarthRotateState.current) {
        // Smoothly transition back to a default position
        const defaultPos = new Vector3(0, 0, CAMERA_DISTANCE);
        cameraPositionRef.current.lerp(defaultPos, 0.05);
        camera.position.copy(cameraPositionRef.current);
      }
    }
    
    // Update state tracking
    lastFollowState.current = state.followISS;
    lastEarthRotateState.current = earthRotateMode;
    
    // Update controls
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enableZoom={enableZoom}
      enablePan={enablePan}
      enableDamping
      dampingFactor={dampingFactor}
      minDistance={EARTH_RADIUS + 0.5}
      maxDistance={CAMERA_DISTANCE * 2}
    />
  );
};

export default Controls;
