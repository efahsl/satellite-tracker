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

  // References for solar panel groups
  const solarArrayRefs = useRef<(Group | null)[]>([null, null, null, null]);

  // Rebuilt ISS model to match reference image - emphasizing key visual features
  const SatelliteModel = useMemo(() => {
    const scale = ISS_SIZE * 0.4; // Slightly larger for better visibility
    
    return (
      <group scale={[scale, scale, scale]}>
        {/* INTEGRATED TRUSS STRUCTURE - Main silver backbone */}
        <group name="truss">
          {/* Main horizontal truss beam - longer and more prominent */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[16, 0.4, 0.4]} />
            <meshStandardMaterial 
              color="#c8c8c8" 
              metalness={0.95} 
              roughness={0.15}
            />
          </mesh>
          
          {/* Truss framework details with cross-bracing */}
          {[-6, -4, -2, 0, 2, 4, 6].map((x, i) => (
            <group key={`truss-section-${i}`} position={[x, 0, 0]}>
              {/* Vertical supports */}
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[0.15, 0.6, 0.15]} />
                <meshStandardMaterial 
                  color="#b0b0b0" 
                  metalness={0.9} 
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.15, 0.6, 0.15]} />
                <meshStandardMaterial 
                  color="#b0b0b0" 
                  metalness={0.9} 
                  roughness={0.2}
                />
              </mesh>
              {/* Cross bracing */}
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.8, 0.08, 0.08]} />
                <meshStandardMaterial 
                  color="#a8a8a8" 
                  metalness={0.85} 
                  roughness={0.25}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* SOLAR ARRAY WINGS - 8 large panels in 4 pairs (DOMINANT FEATURE) */}
        <group name="solar-arrays">
          {/* Port side arrays - Far left */}
          <group ref={(el) => (solarArrayRefs.current[0] = el)} position={[-7, 0, 0]}>
            {/* Upper panel with realistic solar cells */}
            <group position={[0, 5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-port-far-upper-${row}-${col}`}
                    position={[
                      0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Enhanced Panel framework */}
              {/* Main frame borders - thicker and more prominent */}
              <mesh position={[0.08, 0, 1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 0, -1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, -4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
            </group>
            
            {/* Lower panel with realistic solar cells */}
            <group position={[0, -5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-port-far-lower-${row}-${col}`}
                    position={[
                      0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Enhanced Panel framework */}
              {/* Main frame borders - thicker and more prominent */}
              <mesh position={[0.08, 0, 1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 0, -1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, -4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
            </group>
            
            {/* Connection hardware */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
          
          {/* Port side arrays - Near left */}
          <group ref={(el) => (solarArrayRefs.current[1] = el)} position={[-3.5, 0, 0]}>
            {/* Upper panel with realistic solar cells */}
            <group position={[0, 5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-port-near-upper-${row}-${col}`}
                    position={[
                      0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Enhanced Panel framework */}
              {/* Main frame borders - thicker and more prominent */}
              <mesh position={[0.08, 0, 1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 0, -1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, -4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              
            </group>
            
            {/* Lower panel with realistic solar cells */}
            <group position={[0, -5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-port-near-lower-${row}-${col}`}
                    position={[
                      0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Enhanced Panel framework */}
              {/* Main frame borders - thicker and more prominent */}
              <mesh position={[0.08, 0, 1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 0, -1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, 4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0.08, -4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              
            </group>
            
            {/* Connection hardware */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Starboard side arrays - Near right */}
          <group ref={(el) => (solarArrayRefs.current[2] = el)} position={[3.5, 0, 0]}>
            {/* Upper panel with realistic solar cells */}
            <group position={[0, 5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-star-near-upper-${row}-${col}`}
                    position={[
                      -0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Enhanced Panel framework */}
              {/* Main frame borders - thicker and more prominent */}
              <mesh position={[-0.08, 0, 1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[-0.08, 0, -1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[-0.08, 4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[-0.08, -4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              
            </group>
            
            {/* Lower panel with realistic solar cells */}
            <group position={[0, -5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-star-near-lower-${row}-${col}`}
                    position={[
                      -0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Enhanced Panel framework */}
              {/* Main frame borders - thicker and more prominent */}
              <mesh position={[-0.08, 0, 1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[-0.08, 0, -1.75]}>
                <boxGeometry args={[0.06, 8.4, 0.08]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[-0.08, 4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[-0.08, -4, 0]}>
                <boxGeometry args={[0.06, 0.08, 3.7]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
              </mesh>
              
            </group>
            
            {/* Connection hardware */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
          
          {/* Starboard side arrays - Far right */}
          <group ref={(el) => (solarArrayRefs.current[3] = el)} position={[7, 0, 0]}>
            {/* Upper panel with realistic solar cells */}
            <group position={[0, 5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-star-far-upper-${row}-${col}`}
                    position={[
                      -0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Panel framework */}
              <mesh position={[-0.08, 0, 0]}>
                <boxGeometry args={[0.04, 8.2, 0.05]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[-0.08, 0, 0]}>
                <boxGeometry args={[0.04, 0.05, 3.7]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
            
            {/* Lower panel with realistic solar cells */}
            <group position={[0, -5, 0]}>
              {/* Main panel base */}
              <mesh>
                <boxGeometry args={[0.12, 8, 3.5]} />
                <meshStandardMaterial 
                  color="#1a1a3a" 
                  metalness={0.7} 
                  roughness={0.3}
                  emissive="#000066"
                  emissiveIntensity={0.1}
                />
              </mesh>
              
              {/* Photovoltaic cell grid */}
              {Array.from({ length: 12 }, (_, row) => 
                Array.from({ length: 6 }, (_, col) => (
                  <mesh 
                    key={`cell-star-far-lower-${row}-${col}`}
                    position={[
                      -0.07,
                      -3.5 + (row * 0.6),
                      -1.5 + (col * 0.5)
                    ]}
                  >
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color="#0f0f2f" 
                      metalness={0.8} 
                      roughness={0.2}
                      emissive="#000088"
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                ))
              )}
              
              {/* Panel framework */}
              <mesh position={[-0.08, 0, 0]}>
                <boxGeometry args={[0.04, 8.2, 0.05]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[-0.08, 0, 0]}>
                <boxGeometry args={[0.04, 0.05, 3.7]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
            
            {/* Connection hardware */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* CENTRAL MODULE CLUSTER - White/off-white cylindrical modules */}
        <group name="modules" position={[0, 0, 0]}>
          {/* Main central hub - Unity Node */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
            <meshStandardMaterial 
              color="#f8f8f8" 
              metalness={0.7} 
              roughness={0.2}
            />
          </mesh>
          
          {/* Russian Segment - Zvezda/Zarya */}
          <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 3, 16]} />
            <meshStandardMaterial 
              color="#f0f0f0" 
              metalness={0.65} 
              roughness={0.25}
            />
          </mesh>
          
          {/* US Lab - Destiny */}
          <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 3, 16]} />
            <meshStandardMaterial 
              color="#f5f5f5" 
              metalness={0.65} 
              roughness={0.25}
            />
          </mesh>
          
          {/* Columbus Laboratory - European module */}
          <mesh position={[0, 0, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 2.2, 16]} />
            <meshStandardMaterial 
              color="#f8f8f8" 
              metalness={0.65} 
              roughness={0.25}
            />
          </mesh>
          
          {/* Japanese Kibo Module */}
          <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 2, 16]} />
            <meshStandardMaterial 
              color="#f0f0f0" 
              metalness={0.65} 
              roughness={0.25}
            />
          </mesh>
          
          {/* Cupola observation module */}
          <mesh position={[0, -0.8, 0]}>
            <sphereGeometry args={[0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color="#e8e8e8" 
              metalness={0.8} 
              roughness={0.15}
              emissive="#004488"
              emissiveIntensity={0.05}
            />
          </mesh>
        </group>

        {/* RADIATOR PANELS - Large white rectangular panels */}
        <group name="radiators">
          {/* Port side radiators */}
          <mesh position={[-5.5, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[3, 0.05, 1.5]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.6} 
              roughness={0.1}
            />
          </mesh>
          <mesh position={[-5.5, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[3, 0.05, 1.5]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.6} 
              roughness={0.1}
            />
          </mesh>
          
          {/* Starboard side radiators */}
          <mesh position={[5.5, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[3, 0.05, 1.5]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.6} 
              roughness={0.1}
            />
          </mesh>
          <mesh position={[5.5, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[3, 0.05, 1.5]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.6} 
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* ROBOTIC ARM - Canadarm2 */}
        <group name="robotic-arm" position={[1, 0.6, 0]}>
          <mesh rotation={[0, 0, Math.PI / 3]}>
            <cylinderGeometry args={[0.06, 0.06, 1.5, 12]} />
            <meshStandardMaterial 
              color="#d8d8d8" 
              metalness={0.85} 
              roughness={0.15}
            />
          </mesh>
          <mesh position={[0.6, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
            <meshStandardMaterial 
              color="#d8d8d8" 
              metalness={0.85} 
              roughness={0.15}
            />
          </mesh>
        </group>

        {/* DOCKING PORTS */}
        <group name="docking-ports">
          <mesh position={[4, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshStandardMaterial 
              color="#888888" 
              metalness={0.9} 
              roughness={0.1}
            />
          </mesh>
          <mesh position={[-4, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshStandardMaterial 
              color="#888888" 
              metalness={0.9} 
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* COMMUNICATION ANTENNAS */}
        <group name="antennas">
          <mesh position={[0, 0, 2.5]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.9} 
              roughness={0.05}
            />
          </mesh>
          <mesh position={[0, 0, 2.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.8, 12]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              metalness={0.9} 
              roughness={0.1}
              emissive="#ff6600"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* STATUS LIGHTS */}
        <mesh position={[0, 0, -2]}>
          <sphereGeometry args={[0.04, 12, 8]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00"
            emissiveIntensity={0.8 + Math.sin(animationTimeRef.current * 3) * 0.2}
          />
        </mesh>
        <mesh position={[0.15, 0, -2]}>
          <sphereGeometry args={[0.03, 12, 8]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.6 + Math.sin(animationTimeRef.current * 2 + Math.PI) * 0.2}
          />
        </mesh>
        <mesh position={[-0.15, 0, -2]}>
          <sphereGeometry args={[0.03, 12, 8]} />
          <meshStandardMaterial 
            color="#0088ff" 
            emissive="#0088ff"
            emissiveIntensity={0.7 + Math.sin(animationTimeRef.current * 4) * 0.3}
          />
        </mesh>
      </group>
    );
  }, []);

  // Animation loop for solar panels and trail effects
  useFrame((state, delta) => {
    animationTimeRef.current += delta;

    // Animate solar panels rotation
    solarArrayRefs.current.forEach((arrayRef, index) => {
      if (arrayRef) {
        // Base rotation speed with variation per array
        const rotationSpeed = 0.1 + index * 0.02;
        
        // Add oscillation for realistic sun tracking
        const oscillation = Math.sin(animationTimeRef.current * 0.5 + index * Math.PI / 4) * 0.1;
        
        // Rotate arrays to track sun
        arrayRef.rotation.y = animationTimeRef.current * rotationSpeed + oscillation;
        
        // Update material properties based on angle for dynamic reflection
        arrayRef.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.material && 'emissiveIntensity' in mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            
            // Calculate angle-based reflection intensity
            const angleIntensity = Math.abs(Math.sin(arrayRef.rotation.y)) * 0.3 + 0.2;
            material.emissiveIntensity = angleIntensity;
          }
        });
      }
    });

    // Animate trail with subtle pulsing effect (less intensive than before)
    if (trailGroupRef.current && showTrajectory) {
      trailGroupRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        const userData = mesh.userData;

        if (userData && material) {
          // Subtle pulsing effect (reduced intensity)
          const pulsePhase = animationTimeRef.current * ISS_TRAIL_PULSE_SPEED * 0.5 + userData.segmentIndex * 0.1;
          const pulseIntensity = 1 + Math.sin(pulsePhase) * (ISS_TRAIL_GLOW_VARIATION * 0.5);

          // Apply subtle pulse to emissive
          const baseEmissive = material.color.clone().multiplyScalar(
            ISS_TRAIL_GLOW_INTENSITY * 0.6 * pulseIntensity
          );
          
          material.emissive.copy(baseEmissive);
        }
      });
    }
  });

  if (!state.position) {
    return null;
  }

  return (
    <group>
      {/* ISS model */}
      <group ref={issRef}>
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
