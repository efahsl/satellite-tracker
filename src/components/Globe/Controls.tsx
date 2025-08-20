import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useISS } from '../../state/ISSContext';
import { latLongToVector3 } from '../../utils/coordinates';
import { EARTH_RADIUS, CAMERA_DISTANCE, ISS_ALTITUDE_SCALE, EARTH_ROTATE_DISTANCE, EARTH_ROTATE_SPEED, EARTH_ROTATE_TRANSITION_SPEED } from '../../utils/constants';
import { TV_CAMERA_CONFIG } from '../../utils/tvConstants';

interface ControlsProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  dampingFactor?: number;
  earthRotateMode?: boolean;
  tvCameraNavigation?: boolean;
  onCameraRotate?: (direction: string, delta: number) => void;
  onZoomChange?: (zoomIn: boolean, delta: number) => void;
}

export interface ControlsRef {
  rotateCameraNorth: (speed: number) => void;
  rotateCameraSouth: (speed: number) => void;
  rotateCameraEast: (speed: number) => void;
  rotateCameraWest: (speed: number) => void;
  handleDirectionalRotation: (direction: string, speed: number) => void;
  handleZoomChange: (zoomIn: boolean, speed: number) => void;
  getOrbitControls: () => any;
}

const Controls = forwardRef<ControlsRef, ControlsProps>(({
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enableZoom = true,
  enablePan = true,
  dampingFactor = 0.1,
  earthRotateMode = false,
  tvCameraNavigation = false,
  onCameraRotate,
  onZoomChange,
}, ref) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { state } = useISS();
  const cameraPositionRef = useRef<Vector3>(new Vector3(0, 0, CAMERA_DISTANCE));
  const lastFollowState = useRef<boolean>(false);
  const lastEarthRotateState = useRef<boolean>(false);
  const earthRotateAngle = useRef<number>(0);
  
  // TV Camera Navigation state
  const tvRotationVelocity = useRef<{ azimuth: number; polar: number }>({ azimuth: 0, polar: 0 });
  const tvZoomVelocity = useRef<number>(0);
  const lastTVRotationTime = useRef<number>(0);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Directional camera rotation functions
  const rotateCameraNorth = (speed: number) => {
    if (!controlsRef.current) return;
    // Rotate camera up (decrease polar angle)
    const currentPolar = controlsRef.current.getPolarAngle();
    const newPolar = Math.max(
      TV_CAMERA_CONFIG.MIN_POLAR_ANGLE,
      currentPolar - speed
    );
    controlsRef.current.setPolarAngle(newPolar);
  };

  const rotateCameraSouth = (speed: number) => {
    if (!controlsRef.current) return;
    // Rotate camera down (increase polar angle)
    const currentPolar = controlsRef.current.getPolarAngle();
    const newPolar = Math.min(
      TV_CAMERA_CONFIG.MAX_POLAR_ANGLE,
      currentPolar + speed
    );
    controlsRef.current.setPolarAngle(newPolar);
  };

  const rotateCameraEast = (speed: number) => {
    if (!controlsRef.current) return;
    // Rotate camera right (increase azimuth angle)
    const currentAzimuth = controlsRef.current.getAzimuthalAngle();
    const newAzimuth = currentAzimuth + speed;
    controlsRef.current.setAzimuthalAngle(newAzimuth);
  };

  const rotateCameraWest = (speed: number) => {
    if (!controlsRef.current) return;
    // Rotate camera left (decrease azimuth angle)
    const currentAzimuth = controlsRef.current.getAzimuthalAngle();
    const newAzimuth = currentAzimuth - speed;
    controlsRef.current.setAzimuthalAngle(newAzimuth);
  };

  // Handle directional camera rotation with smooth movement
  const handleDirectionalRotation = (direction: string, speed: number) => {
    if (!tvCameraNavigation || !controlsRef.current) return;

    // Apply rotation based on direction
    switch (direction) {
      case 'up':
        rotateCameraNorth(speed);
        break;
      case 'down':
        rotateCameraSouth(speed);
        break;
      case 'left':
        rotateCameraWest(speed);
        break;
      case 'right':
        rotateCameraEast(speed);
        break;
    }

    // Call callback if provided
    if (onCameraRotate) {
      onCameraRotate(direction, speed);
    }
  };

  // Handle zoom changes
  const handleZoomChange = (zoomIn: boolean, speed: number) => {
    if (!tvCameraNavigation || !controlsRef.current) return;

    const currentDistance = controlsRef.current.getDistance();
    let newDistance: number;

    if (zoomIn) {
      newDistance = Math.max(
        TV_CAMERA_CONFIG.MIN_ZOOM_DISTANCE,
        currentDistance - speed
      );
    } else {
      newDistance = Math.min(
        TV_CAMERA_CONFIG.MAX_ZOOM_DISTANCE,
        currentDistance + speed
      );
    }

    // Update camera distance
    const direction = camera.position.clone().normalize();
    camera.position.copy(direction.multiplyScalar(newDistance));

    // Call callback if provided
    if (onZoomChange) {
      onZoomChange(zoomIn, speed);
    }
  };

  // Expose rotation functions for external use via ref
  useImperativeHandle(ref, () => ({
    rotateCameraNorth,
    rotateCameraSouth,
    rotateCameraEast,
    rotateCameraWest,
    handleDirectionalRotation,
    handleZoomChange,
    getOrbitControls: () => controlsRef.current,
  }), [tvCameraNavigation]);

  // Cleanup animation references on unmount
  useEffect(() => {
    return () => {
      // Reset rotation angle on cleanup
      earthRotateAngle.current = 0;
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

      // Handle TV camera navigation in manual mode
      if (tvCameraNavigation && controlsRef.current) {
        // Apply damping to rotation velocity for smooth deceleration
        tvRotationVelocity.current.azimuth *= TV_CAMERA_CONFIG.ROTATION_DAMPING;
        tvRotationVelocity.current.polar *= TV_CAMERA_CONFIG.ROTATION_DAMPING;
        tvZoomVelocity.current *= TV_CAMERA_CONFIG.ROTATION_DAMPING;

        // Apply accumulated rotation velocity
        if (Math.abs(tvRotationVelocity.current.azimuth) > 0.001) {
          const currentAzimuth = controlsRef.current.getAzimuthalAngle();
          controlsRef.current.setAzimuthalAngle(currentAzimuth + tvRotationVelocity.current.azimuth);
        }

        if (Math.abs(tvRotationVelocity.current.polar) > 0.001) {
          const currentPolar = controlsRef.current.getPolarAngle();
          const newPolar = Math.max(
            TV_CAMERA_CONFIG.MIN_POLAR_ANGLE,
            Math.min(TV_CAMERA_CONFIG.MAX_POLAR_ANGLE, currentPolar + tvRotationVelocity.current.polar)
          );
          controlsRef.current.setPolarAngle(newPolar);
        }

        // Apply zoom velocity
        if (Math.abs(tvZoomVelocity.current) > 0.001) {
          const currentDistance = controlsRef.current.getDistance();
          const newDistance = Math.max(
            TV_CAMERA_CONFIG.MIN_ZOOM_DISTANCE,
            Math.min(TV_CAMERA_CONFIG.MAX_ZOOM_DISTANCE, currentDistance + tvZoomVelocity.current)
          );
          
          // Update camera distance
          const direction = camera.position.clone().normalize();
          camera.position.copy(direction.multiplyScalar(newDistance));
        }
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
});

Controls.displayName = 'Controls';

export default Controls;
