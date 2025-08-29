import React, { useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Group, TubeGeometry, CatmullRomCurve3, Color } from 'three';
import * as THREE from 'three';
import { useISS } from '../../state/ISSContext';
import { latLongToVector3 } from '../../utils/coordinates';
import { 
  EARTH_RADIUS, 
  ISS_SIZE, 
  ISS_ALTITUDE_SCALE,
  ISS_TRACK_COLOR,
  ISS_TRACK_COLOR_FADE,
  ISS_TRAIL_LENGTH,
  ISS_TRAIL_TUBE_RADIUS,
  ISS_TRAIL_SEGMENTS,
  ISS_TRAIL_GLOW_INTENSITY,
  ISS_TRAIL_OPACITY_MIN,
  ISS_TRAIL_OPACITY_MAX,
  ISS_TRAIL_PULSE_SPEED,
  ISS_TRAIL_FLOW_SPEED,
  ISS_TRAIL_GLOW_VARIATION
} from '../../utils/constants';

interface ISSProps {
  showTrajectory?: boolean;
  trajectoryLength?: number;
}

const ISS: React.FC<ISSProps> = memo(({
  showTrajectory = true,
  trajectoryLength = ISS_TRAIL_LENGTH,
}) => {
  const { state } = useISS();
  const issRef = useRef<Mesh>(null);
  const trajectoryRef = useRef<Vector3[]>([]);
  const trailGroupRef = useRef<Group>(null);
  const animationTimeRef = useRef(0);
  const lastTrailUpdate = useRef(0);

  // Memoize colors for performance
  const primaryColor = useMemo(() => new Color(ISS_TRACK_COLOR), []);
  const fadeColor = useMemo(() => new Color(ISS_TRACK_COLOR_FADE), []);

  // Calculate orientation function
  const calculateOrientation = useCallback((position: Vector3, prevPositions: Vector3[]): THREE.Quaternion => {
    if (prevPositions.length < 2) {
      return new THREE.Quaternion();
    }
    
    const prevPosition = prevPositions[prevPositions.length - 2];
    const direction = new Vector3().subVectors(position, prevPosition).normalize();
    
    const quaternion = new THREE.Quaternion();
    const up = new Vector3(0, 1, 0);
    const xAxis = new Vector3().crossVectors(up, direction).normalize();
    const yAxis = new Vector3().crossVectors(direction, xAxis).normalize();
    
    const rotMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, direction);
    quaternion.setFromRotationMatrix(rotMatrix);
    
    return quaternion;
  }, []);

  // Create optimized trail segments with single layer for performance
  const createOptimizedTrail = useCallback((positions: Vector3[]) => {
    if (!trailGroupRef.current || positions.length < 2) return;

    // Clear existing trail segments
    trailGroupRef.current.clear();

    // Create fewer, larger segments for better performance
    const segmentLength = Math.max(4, Math.floor(positions.length / 10)); // Fewer segments
    
    for (let i = 0; i < positions.length - segmentLength; i += Math.max(2, segmentLength - 2)) {
      const segmentEnd = Math.min(i + segmentLength, positions.length);
      const segmentPositions = positions.slice(i, segmentEnd);
      
      if (segmentPositions.length < 2) continue;

      try {
        // Create curve for this segment
        const curve = new CatmullRomCurve3(segmentPositions);
        
        // Reduced tube segments for performance (was ISS_TRAIL_SEGMENTS, now 6)
        const geometry = new TubeGeometry(curve, segmentPositions.length, ISS_TRAIL_TUBE_RADIUS, 6, false);

        // Calculate opacity and color based on position in trail
        const progress = i / (positions.length - 1);
        const opacity = ISS_TRAIL_OPACITY_MIN + (ISS_TRAIL_OPACITY_MAX - ISS_TRAIL_OPACITY_MIN) * (1 - progress);
        const color = new Color().lerpColors(fadeColor, primaryColor, 1 - progress);

        // Single optimized material (no multiple layers)
        const material = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color.clone().multiplyScalar(ISS_TRAIL_GLOW_INTENSITY * 0.6), // Reduced emissive
          transparent: true,
          opacity: opacity,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { segmentIndex: i, progress };
        trailGroupRef.current!.add(mesh);
      } catch (error) {
        console.warn('Error creating trail segment:', error);
      }
    }
  }, [primaryColor, fadeColor]);

  // Update ISS position and trail
  useEffect(() => {
    if (state.position && issRef.current) {
      const { latitude, longitude, altitude } = state.position;
      
      const scaledAltitude = EARTH_RADIUS + altitude * ISS_ALTITUDE_SCALE;
      const [x, y, z] = latLongToVector3(latitude, longitude, scaledAltitude);
      const newPosition = new Vector3(x, y, z);
      
      // Update ISS position
      issRef.current.position.set(x, y, z);
      
      // Update trajectory
      if (showTrajectory) {
        trajectoryRef.current.push(newPosition.clone());
        
        // Limit trajectory length
        if (trajectoryRef.current.length > trajectoryLength) {
          trajectoryRef.current.shift();
        }
        
        // Update orientation with top-down optimized rotation for better visibility
        if (trajectoryRef.current.length > 1) {
          const orientation = calculateOrientation(newPosition, trajectoryRef.current);
          
          // Apply minimal rotations optimized for solar panel visibility
          const xTiltAngle = Math.PI / 2; 
          const yRotationAngle = Math.PI / 4;
          const zRotationAngle = Math.PI / 90; // 2 degrees - very minimal perspective
          
          const xTiltQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new Vector3(1, 0, 0), // Gentle tilt around X axis
            xTiltAngle
          );
          
          const yRotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new Vector3(0, 1, 0), // Slight rotation around Y axis to show T-shape
            yRotationAngle
          );
          
          const zRotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new Vector3(0, 0, 1), // Minimal rotation around Z axis
            zRotationAngle
          );
          
          // Combine trajectory orientation with subtle rotations
          orientation.multiply(xTiltQuaternion);
          orientation.multiply(yRotationQuaternion);
          orientation.multiply(zRotationQuaternion);
          
          issRef.current.quaternion.copy(orientation);
        }

        // Update trail less frequently for performance (every 3rd position update)
        if (trajectoryRef.current.length % 3 === 0 || trajectoryRef.current.length < 10) {
          createOptimizedTrail(trajectoryRef.current);
        }
      }
    }
  }, [state.position, showTrajectory, trajectoryLength, calculateOrientation, createOptimizedTrail]);

  // References for solar panel groups - reduced to 2
  const solarArrayRefs = useRef<(Group | null)[]>([null, null]);

  // Compact solar array configuration - closer to center
  const solarArrayConfigs = useMemo(() => [
    { id: 'port', position: [-3, 0, 0] as [number, number, number], side: 'port' as const, frameworkType: 'basic' as const },
    { id: 'starboard', position: [3, 0, 0] as [number, number, number], side: 'starboard' as const, frameworkType: 'basic' as const },
  ], []);

  // Reusable Solar Panel Component
  const SolarPanel = useCallback(({ 
    position, 
    side, 
    frameworkType, 
    panelId 
  }: {
    position: [number, number, number];
    side: 'port' | 'starboard';
    frameworkType: 'enhanced' | 'basic';
    panelId: string;
  }) => {
    const cellXOffset = side === 'port' ? 0.07 : -0.07;
    const frameworkXOffset = side === 'port' ? 0.08 : -0.08;
    
    return (
      <group position={position}>
        {/* Compact panel base */}
        <mesh>
          <boxGeometry args={[0.1, 4, 2]} />
          <meshBasicMaterial color="#1a1a3a" />
        </mesh>
        
        {/* Compact photovoltaic cell grid */}
        {Array.from({ length: 4 }, (_, row) => 
          Array.from({ length: 2 }, (_, col) => (
            <mesh 
              key={`cell-${panelId}-${row}-${col}`}
              position={[
                cellXOffset,
                -1.5 + (row * 0.75),
                -0.5 + (col * 0.5)
              ]}
            >
              <boxGeometry args={[0.015, 0.6, 0.4]} />
              <meshBasicMaterial color="#0f0f2f" />
            </mesh>
          ))
        )}
        
        {/* Compact panel framework */}
        <mesh position={[frameworkXOffset, 0, 0]}>
          <boxGeometry args={[0.03, 4, 0.04]} />
          <meshBasicMaterial color="#666666" />
        </mesh>
      </group>
    );
  }, []);

  // Reusable Solar Array Group Component
  const SolarArrayGroup = useCallback(({ 
    position, 
    side, 
    frameworkType, 
    groupIndex 
  }: {
    position: [number, number, number];
    side: 'port' | 'starboard';
    frameworkType: 'enhanced' | 'basic';
    groupIndex: number;
  }) => {
    return (
      <group ref={(el) => (solarArrayRefs.current[groupIndex] = el)} position={position}>
        {/* Single panel instead of upper/lower pair */}
        <SolarPanel 
          position={[0, 0, 0]}
          side={side}
          frameworkType={frameworkType}
          panelId={`${side}-${groupIndex}`}
        />
        
        {/* Simplified connection hardware */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 6]} />
          <meshBasicMaterial color="#555555" />
        </mesh>
      </group>
    );
  }, [SolarPanel]);

  // Rebuilt ISS model to match reference image - emphasizing key visual features
  const SatelliteModel = useMemo(() => {
    const scale = ISS_SIZE * 0.4; // Slightly larger for better visibility
    
    return (
      <group scale={[scale, scale, scale]}>
        {/* Compact truss structure */}
        <group name="truss">
          {/* Shorter main horizontal truss beam */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[8, 0.25, 0.25]} />
            <meshBasicMaterial color="#666666" />
          </mesh>
          
          {/* Simplified truss supports */}
          {[-2, 0, 2].map((x, i) => (
            <mesh key={`truss-${i}`} position={[x, 0, 0]}>
              <boxGeometry args={[0.08, 0.3, 0.08]} />
              <meshBasicMaterial color="#555555" />
            </mesh>
          ))}
        </group>

        {/* SOLAR ARRAY WINGS - 8 large panels in 4 pairs (DOMINANT FEATURE) */}
        <group name="solar-arrays">
          {solarArrayConfigs.map((config, index) => (
            <SolarArrayGroup
              key={config.id}
              position={config.position}
              side={config.side}
              frameworkType={config.frameworkType}
              groupIndex={index}
            />
          ))}
        </group>

        {/* Compact central modules with dark gray colors */}
        <group name="modules" position={[0, 0, 0]}>
          {/* Main central hub */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
            <meshBasicMaterial color="#555555" />
          </mesh>
          
          {/* Main module - shorter */}
          <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 1.8, 8]} />
            <meshBasicMaterial color="#606060" />
          </mesh>
          
          {/* Secondary module - shorter */}
          <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 1.8, 8]} />
            <meshBasicMaterial color="#666666" />
          </mesh>
        </group>

        {/* Compact radiators with dark gray color */}
        <group name="radiators">
          <mesh position={[-2.5, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1.5, 0.05, 0.8]} />
            <meshBasicMaterial color="#777777" />
          </mesh>
          <mesh position={[2.5, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1.5, 0.05, 0.8]} />
            <meshBasicMaterial color="#777777" />
          </mesh>
        </group>

        {/* Compact antenna */}
        <mesh position={[0, 0, 1]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshBasicMaterial color="#888888" />
        </mesh>

        {/* Single status light */}
        <mesh position={[0, 0, -1]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshBasicMaterial color="#00aa00" />
        </mesh>
      </group>
    );
  }, []);

  // No animations for performance optimization

  if (!state.position) {
    return null;
  }

  return (
    <group>
      {/* ISS model */}
      <group ref={issRef} castShadow={true}>
        {SatelliteModel}
      </group>
      
      {/* Optimized trajectory trail */}
      {showTrajectory && (
        <group ref={trailGroupRef} />
      )}
    </group>
  );
});

export default ISS;
