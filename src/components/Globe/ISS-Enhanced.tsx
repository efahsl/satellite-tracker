import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, TubeGeometry, CatmullRomCurve3, Color } from 'three';
import * as THREE from 'three';
import { useISS } from '../../state/ISSContext';
import { usePerformance } from '../../state/PerformanceContext';
import { latLongToVector3 } from '../../utils/coordinates';
import { 
  EARTH_RADIUS, 
  ISS_SIZE, 
  ISS_ALTITUDE_SCALE,
  ISS_TRACK_COLOR,
  ISS_TRACK_COLOR_FADE,
  ISS_TRAIL_LENGTH,
  ISS_TRAIL_TUBE_RADIUS,
  ISS_TRAIL_GLOW_INTENSITY,
  ISS_TRAIL_OPACITY_MIN,
  ISS_TRAIL_OPACITY_MAX,
  ISS_TRAIL_PULSE_SPEED,
  ISS_TRAIL_GLOW_VARIATION
} from '../../utils/constants';

interface ISSProps {
  showTrajectory?: boolean;
  trajectoryLength?: number;
}

// Enhanced ISS Component with realistic proportions and detailed geometry
const EnhancedISS: React.FC<ISSProps> = ({
  showTrajectory = true,
  trajectoryLength = ISS_TRAIL_LENGTH,
}) => {
  const { state } = useISS();
  const { state: performanceState } = usePerformance();
  const { trailLength, trailSegments } = performanceState.settings;
  const issRef = useRef<THREE.Group>(null);
  const trajectoryRef = useRef<Vector3[]>([]);
  const trailGroupRef = useRef<Group>(null);
  const solarArrayRefs = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const animationTimeRef = useRef(0);

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

  // Create optimized trail segments
  const createOptimizedTrail = useCallback((positions: Vector3[]) => {
    if (!trailGroupRef.current || positions.length < 2) return;

    // Clear existing trail segments
    trailGroupRef.current.clear();

    // Use performance tier settings for trail optimization
    const segmentLength = Math.max(4, Math.floor(positions.length / (trailSegments * 2)));
    
    for (let i = 0; i < positions.length - segmentLength; i += Math.max(2, segmentLength - 2)) {
      const segmentEnd = Math.min(i + segmentLength, positions.length);
      const segmentPositions = positions.slice(i, segmentEnd);
      
      if (segmentPositions.length < 2) continue;

      try {
        // Create curve for this segment
        const curve = new CatmullRomCurve3(segmentPositions);
        
        // Use tier-specific tube segments
        const geometry = new TubeGeometry(curve, segmentPositions.length, ISS_TRAIL_TUBE_RADIUS, trailSegments, false);

        // Calculate opacity and color based on position in trail
        const progress = i / (positions.length - 1);
        const opacity = ISS_TRAIL_OPACITY_MIN + (ISS_TRAIL_OPACITY_MAX - ISS_TRAIL_OPACITY_MIN) * (1 - progress);
        const color = new Color().lerpColors(fadeColor, primaryColor, 1 - progress);

        // Single optimized material
        const material = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color.clone().multiplyScalar(ISS_TRAIL_GLOW_INTENSITY * 0.6),
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
        
        // Limit trajectory length using performance tier setting
        if (trajectoryRef.current.length > trailLength) {
          trajectoryRef.current.shift();
        }
        
        // Update orientation
        if (trajectoryRef.current.length > 1) {
          const orientation = calculateOrientation(newPosition, trajectoryRef.current);
          
          // Apply minimal rotations optimized for solar panel visibility
          const xTiltAngle = Math.PI / 4; //originally Math.PI/2 to be straight overhead
          const yRotationAngle = Math.PI / 4;
          const zRotationAngle = 0;
          
          const xTiltQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new Vector3(1, 0, 0),
            xTiltAngle
          );
          
          const yRotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new Vector3(0, 1, 0),
            yRotationAngle
          );
          
          const zRotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new Vector3(0, 0, 1),
            zRotationAngle
          );
          
          // Combine trajectory orientation with subtle rotations
          orientation.multiply(xTiltQuaternion);
          orientation.multiply(yRotationQuaternion);
          orientation.multiply(zRotationQuaternion);
          
          issRef.current.quaternion.copy(orientation);
        }

        // Update trail less frequently for performance
        if (trajectoryRef.current.length % 3 === 0 || trajectoryRef.current.length < 10) {
          createOptimizedTrail(trajectoryRef.current);
        }
      }
    }
  }, [state.position, showTrajectory, trajectoryLength, calculateOrientation, createOptimizedTrail]);

  // Animation loop for solar panels and trail effects
  useFrame((_, delta) => {
    animationTimeRef.current += delta;

    // Only use auto-rotation if no real position data is available
    if (!state.position && issRef.current) {
      issRef.current.rotation.y += 0.002;
      issRef.current.rotation.x += 0.002;
      issRef.current.rotation.z += 0.0005;
    }

    // Enhanced solar panel animation with sun tracking
    solarArrayRefs.current.forEach((arrayRef, index) => {
      if (arrayRef) {
        // Realistic sun tracking with seasonal variation
        const baseRotation = animationTimeRef.current * 0.05 + index * Math.PI / 2;
        const seasonalVariation = Math.sin(animationTimeRef.current * 0.01) * 0.3;
        const oscillation = Math.sin(animationTimeRef.current * 0.2 + index * Math.PI / 4) * 0.1;
        
        arrayRef.rotation.y = baseRotation + seasonalVariation + oscillation;
        
        // Dynamic material updates for realistic solar panel reflection
        arrayRef.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.material && 'emissiveIntensity' in mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            const angleIntensity = Math.abs(Math.sin(arrayRef.rotation.y)) * 0.4 + 0.1;
            material.emissiveIntensity = angleIntensity;
          }
        });
      }
    });

    // Animate trail with subtle pulsing effect
    if (trailGroupRef.current && showTrajectory) {
      trailGroupRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        const userData = mesh.userData;

        if (userData && material) {
          // Subtle pulsing effect
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

  // Enhanced materials with realistic properties - cached and optimized
  const materials = useMemo(() => ({
    module: new THREE.MeshStandardMaterial({
      color: '#f8f8f8',
      metalness: 0.3,
      roughness: 0.7,
      envMapIntensity: 0.8
    }),
    solarPanel: new THREE.MeshStandardMaterial({
      color: '#1e3a8a',
      metalness: 0.4,
      roughness: 0.6,
      emissive: '#1e40af',
      emissiveIntensity: 0.2
    }),
    solarCell: new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.5,
      roughness: 0.3
    }),
    truss: new THREE.MeshStandardMaterial({
      color: '#6b7280',
      metalness: 0.8,
      roughness: 0.3,
      envMapIntensity: 1.0
    }),
    radiator: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.2,
      roughness: 0.8
    }),
    canadarm: new THREE.MeshStandardMaterial({
      color: '#d1d5db',
      metalness: 0.6,
      roughness: 0.4
    }),
    dockingPort: new THREE.MeshStandardMaterial({
      color: '#9ca3af',
      metalness: 0.9,
      roughness: 0.2
    }),
    window: new THREE.MeshStandardMaterial({
      color: '#87ceeb',
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    }),
    antenna: new THREE.MeshStandardMaterial({
      color: '#ffaa00',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#ff6600',
      emissiveIntensity: 0.3
    }),
    statusLight: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#ffffff',
      emissiveIntensity: 0.5
    })
  }), []);

  // Early return if no position data and trajectory is expected  
  if (showTrajectory && !state.position) {
    return null;
  }

  // Cached geometries to prevent recreation
  const geometries = useMemo(() => ({
    // Main structural geometries
    mainTruss: new THREE.BoxGeometry(16, 0.4, 0.4),
    crossTrussVertical: new THREE.BoxGeometry(0.3, 8, 0.3),
    crossTrussHorizontal: new THREE.BoxGeometry(0.3, 0.3, 8),
    trussSegment: new THREE.BoxGeometry(0.2, 0.5, 0.5),
    
    // Solar panel geometries
    solarPanelMain: new THREE.BoxGeometry(0.02, 8, 3),
    solarCell: new THREE.BoxGeometry(0.01, 0.8, 2.8),
    solarSupport: new THREE.CylinderGeometry(0.1, 0.1, 8, 8),
    
    // Module geometries
    mainModule: new THREE.CylinderGeometry(0.5, 0.5, 3, 16),
    moduleEndCap: new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
    moduleWindow: new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16),
    zarya: new THREE.CylinderGeometry(0.45, 0.45, 2.5, 16),
    unityNode: new THREE.SphereGeometry(0.6, 16, 12),
    columbus: new THREE.CylinderGeometry(0.45, 0.45, 2.5, 16),
    kibo: new THREE.CylinderGeometry(0.45, 0.45, 2, 16),
    cupola: new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    cupolaBase: new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16),
    
    // Radiator geometries
    radiatorPanel: new THREE.BoxGeometry(3, 0.05, 1.5),
    radiatorFin: new THREE.BoxGeometry(0.02, 0.02, 1.4),
    
    // Canadarm geometries
    armJoint: new THREE.SphereGeometry(0.15, 12, 8),
    armSegment1: new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
    armSegment2: new THREE.CylinderGeometry(0.06, 0.06, 1, 8),
    armEffector: new THREE.SphereGeometry(0.1, 8, 6),
    armGripper: new THREE.BoxGeometry(0.05, 0.05, 0.3),
    
    // Docking and antenna geometries
    dockingPort: new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12),
    soyuzBody: new THREE.CylinderGeometry(0.3, 0.3, 1.5, 12),
    soyuzNose: new THREE.SphereGeometry(0.3, 12, 8),
    antennaMain: new THREE.SphereGeometry(0.2, 12, 8),
    antennaRod: new THREE.CylinderGeometry(0.02, 0.02, 1, 8),
    antennaSecondary: new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
    
    // Lights and equipment
    statusLight: new THREE.SphereGeometry(0.04, 8, 8),
    statusLightSmall: new THREE.SphereGeometry(0.03, 8, 8),
    statusLightTiny: new THREE.SphereGeometry(0.02, 6, 6),
    handrail: new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8),
    experimentPlatform: new THREE.BoxGeometry(1, 0.1, 0.8),
    kiboExperiment: new THREE.BoxGeometry(1.5, 0.1, 0.8),
    
    // Zarya solar panels
    zaryaSolar: new THREE.BoxGeometry(2, 0.02, 1)
  }), []);

  // Cleanup function for geometries and materials
  useEffect(() => {
    return () => {
      // Dispose of all geometries
      Object.values(geometries).forEach(geometry => geometry.dispose());
      // Dispose of all materials
      Object.values(materials).forEach(material => material.dispose());
    };
  }, [geometries, materials]);

  return (
    <group>
      {/* Enhanced ISS model */}
      <group ref={issRef} scale={[ISS_SIZE * 0.4, ISS_SIZE * 0.4, ISS_SIZE * 0.4]}>
        {/* MAIN TRUSS STRUCTURE - Enhanced with proper cross-beams */}
      <group name="truss-structure">
        {/* Central truss beam */}
        <mesh position={[0, 0, 0]} material={materials.truss} geometry={geometries.mainTruss} />
        
        {/* Cross trusses for solar array mounting */}
        {[-6, -2, 2, 6].map((x, i) => (
          <group key={`cross-truss-${i}`} position={[x, 0, 0]}>
            <mesh position={[0, 0, 0]} material={materials.truss} geometry={geometries.crossTrussHorizontal} />
            <mesh position={[0, 0, 0]} material={materials.truss} geometry={geometries.crossTrussVertical} />
          </group>
        ))}
        
        {/* Truss segments with detail */}
        {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((x, i) => (
          <mesh key={`truss-segment-${i}`} position={[x, 0, 0]} material={materials.truss} geometry={geometries.trussSegment} />
        ))}
      </group>

      {/* ENHANCED SOLAR ARRAYS - More realistic with individual panels */}
      <group name="solar-arrays">
        {/* Port side arrays */}
        <group ref={(el) => (solarArrayRefs.current[0] = el)} position={[-6, 0, 0]}>
          {/* Upper port array */}
          <group position={[0, 4, 0]}>
            {/* Solar panel structure */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 24]} material={materials.solarPanel} geometry={geometries.solarPanelMain} />
            {/* Individual solar cells */}
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={`port-upper-cell-${i}`} position={[0, -3.5 + i * 1, 0]} rotation={[0, 0, Math.PI / 24]} material={materials.solarCell} geometry={geometries.solarCell} />
            ))}
            {/* Mounting structure */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 24]} material={materials.truss} geometry={geometries.solarSupport} />
          </group>
          
          {/* Lower port array */}
          <group position={[0, -4, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 24]} material={materials.solarPanel} geometry={geometries.solarPanelMain} />
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={`port-lower-cell-${i}`} position={[0, -3.5 + i * 1, 0]} rotation={[0, 0, -Math.PI / 24]} material={materials.solarCell} geometry={geometries.solarCell} />
            ))}
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 24]} material={materials.truss} geometry={geometries.solarSupport} />
          </group>
        </group>

        {/* Starboard side arrays */}
        <group ref={(el) => (solarArrayRefs.current[1] = el)} position={[6, 0, 0]}>
          {/* Upper starboard array */}
          <group position={[0, 4, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 24]} material={materials.solarPanel} geometry={geometries.solarPanelMain} />
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={`starboard-upper-cell-${i}`} position={[0, -3.5 + i * 1, 0]} rotation={[0, 0, -Math.PI / 24]} material={materials.solarCell} geometry={geometries.solarCell} />
            ))}
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 24]} material={materials.truss} geometry={geometries.solarSupport} />
          </group>
          
          {/* Lower starboard array */}
          <group position={[0, -4, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 24]} material={materials.solarPanel} geometry={geometries.solarPanelMain} />
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={`starboard-lower-cell-${i}`} position={[0, -3.5 + i * 1, 0]} rotation={[0, 0, Math.PI / 24]} material={materials.solarCell} geometry={geometries.solarCell} />
            ))}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 24]} material={materials.truss} geometry={geometries.solarSupport} />
          </group>
        </group>
      </group>

      {/* ENHANCED PRESSURIZED MODULES - More detailed with proper connections */}
      <group name="modules" position={[0, 0, 0]}>
        {/* Russian Segment - Zvezda Service Module */}
        <group position={[-2.5, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.mainModule} />
          {/* End caps */}
          <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.moduleEndCap} />
          <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.moduleEndCap} />
          {/* Windows */}
          <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.window} geometry={geometries.moduleWindow} />
        </group>

        {/* Zarya Functional Cargo Block */}
        <group position={[-4.5, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.zarya} />
          {/* Solar panels for Zarya */}
          <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.solarPanel} geometry={geometries.zaryaSolar} />
          <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.solarPanel} geometry={geometries.zaryaSolar} />
        </group>

        {/* Unity Node (Node 1) */}
        <group position={[0, 0, 0]}>
          <mesh material={materials.module} geometry={geometries.unityNode} />
          {/* Docking ports */}
          {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rotation, i) => (
            <mesh key={`unity-port-${i}`} position={[0, 0, 0]} rotation={[0, 0, rotation]} material={materials.dockingPort} geometry={geometries.dockingPort} />
          ))}
        </group>

        {/* Destiny Laboratory (US Lab) */}
        <group position={[2.5, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.mainModule} />
          {/* End caps */}
          <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.moduleEndCap} />
          <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.moduleEndCap} />
          {/* Windows */}
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.window} geometry={geometries.moduleWindow} />
        </group>

        {/* Columbus Laboratory (European) */}
        <group position={[0, 0, 2.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.module} geometry={geometries.columbus} />
          {/* End caps */}
          <mesh position={[0, -1.25, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.module} geometry={geometries.moduleEndCap} />
          <mesh position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.module} geometry={geometries.moduleEndCap} />
        </group>

        {/* Kibo Japanese Experiment Module */}
        <group position={[0, 2.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.kibo} />
          {/* Experiment platform */}
          <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.module} geometry={geometries.kiboExperiment} />
        </group>

        {/* Cupola Observation Module */}
        <group position={[0, -2.5, 0]}>
          <mesh material={materials.module} geometry={geometries.cupola} />
          {/* Base structure */}
          <mesh position={[0, 0, -0.2]} material={materials.module} geometry={geometries.cupolaBase} />
        </group>
      </group>

      {/* ENHANCED RADIATOR PANELS - More detailed thermal radiators */}
      <group name="radiators">
        {/* Port side radiators */}
        <group position={[-4, 0, 0]}>
          <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.radiator} geometry={geometries.radiatorPanel} />
          <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.radiator} geometry={geometries.radiatorPanel} />
          {/* Radiator fins */}
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={`port-radiator-fin-${i}`} position={[-1.25 + i * 0.5, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.radiator} geometry={geometries.radiatorFin} />
          ))}
        </group>
        {/* Starboard side radiators */}
        <group position={[4, 0, 0]}>
          <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.radiator} geometry={geometries.radiatorPanel} />
          <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.radiator} geometry={geometries.radiatorPanel} />
          {/* Radiator fins */}
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={`starboard-radiator-fin-${i}`} position={[-1.25 + i * 0.5, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.radiator} geometry={geometries.radiatorFin} />
          ))}
        </group>
      </group>

      {/* ENHANCED CANADARM2 - More detailed robotic arm */}
      <group name="canadarm2" position={[1, 0.5, 0]}>
        {/* Base joint */}
        <mesh position={[0, 0, 0]} material={materials.canadarm} geometry={geometries.armJoint} />
        
        {/* First arm segment */}
        <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, Math.PI / 4]} material={materials.canadarm} geometry={geometries.armSegment1} />
        
        {/* Second arm segment */}
        <mesh position={[0.8, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]} material={materials.canadarm} geometry={geometries.armSegment2} />
        
        {/* End effector */}
        <mesh position={[1.1, 1.1, 0]} material={materials.canadarm} geometry={geometries.armEffector} />
        
        {/* Gripper */}
        <mesh position={[1.1, 1.1, 0]} material={materials.canadarm} geometry={geometries.armGripper} />
      </group>

      {/* ENHANCED DOCKING PORTS - More detailed connections */}
      <group name="docking-ports">
        {/* Russian segment docking */}
        <mesh position={[-6, 0, 0]} material={materials.dockingPort} geometry={geometries.dockingPort} />
        
        {/* US segment docking */}
        <mesh position={[5, 0, 0]} material={materials.dockingPort} geometry={geometries.dockingPort} />
        
        {/* Soyuz/Progress mockup */}
        <group position={[-6.5, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.soyuzBody} />
          <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.module} geometry={geometries.soyuzNose} />
        </group>
      </group>

      {/* ENHANCED COMMUNICATION ANTENNAS */}
      <group name="antennas">
        {/* Main communication antenna */}
        <mesh position={[0, 0, 3]} material={materials.antenna} geometry={geometries.antennaMain} />
        <mesh position={[0, 0, 3]} rotation={[Math.PI / 2, 0, 0]} material={materials.antenna} geometry={geometries.antennaRod} />
        
        {/* Secondary antennas */}
        <mesh position={[2, 0, 2]} material={materials.antenna} geometry={geometries.antennaSecondary} />
        <mesh position={[-2, 0, 2]} material={materials.antenna} geometry={geometries.antennaSecondary} />
      </group>

      {/* ENHANCED STATUS LIGHTS - More realistic navigation beacons */}
      <group name="status-lights">
        {/* Navigation lights */}
        <mesh position={[0, 0, -3]} geometry={geometries.statusLight}>
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00"
            emissiveIntensity={0.8 + Math.sin(animationTimeRef.current * 2) * 0.2}
          />
        </mesh>
        <mesh position={[0.15, 0, -3]} geometry={geometries.statusLightSmall}>
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.6 + Math.sin(animationTimeRef.current * 1.5 + Math.PI) * 0.2}
          />
        </mesh>
        <mesh position={[-0.15, 0, -3]} geometry={geometries.statusLightSmall}>
          <meshStandardMaterial 
            color="#0088ff" 
            emissive="#0088ff"
            emissiveIntensity={0.7 + Math.sin(animationTimeRef.current * 3) * 0.3}
          />
        </mesh>
        
        {/* Module status indicators */}
        <mesh position={[2.5, 0, 0.6]} geometry={geometries.statusLightTiny}>
          <meshStandardMaterial 
            color="#ffff00" 
            emissive="#ffff00"
            emissiveIntensity={0.5 + Math.sin(animationTimeRef.current * 4) * 0.2}
          />
        </mesh>
        <mesh position={[-2.5, 0, 0.6]} geometry={geometries.statusLightTiny}>
          <meshStandardMaterial 
            color="#ffff00" 
            emissive="#ffff00"
            emissiveIntensity={0.5 + Math.sin(animationTimeRef.current * 4 + Math.PI) * 0.2}
          />
        </mesh>
      </group>

      {/* EXTERNAL EQUIPMENT - Handrails and structural details */}
      <group name="external-equipment">
        {/* Handrails around modules */}
        {[-2.5, 0, 2.5].map((x, i) => (
          <group key={`handrail-${i}`} position={[x, 0, 0]}>
            <mesh position={[0, 0, 0.6]} material={materials.truss} geometry={geometries.handrail} />
            <mesh position={[0, 0, -0.6]} material={materials.truss} geometry={geometries.handrail} />
          </group>
        ))}
        {/* External experiment platforms */}
        <mesh position={[0, 3.5, 0]} material={materials.module} geometry={geometries.experimentPlatform} />
        <mesh position={[0, -3.5, 0]} material={materials.module} geometry={geometries.experimentPlatform} />
      </group>
      </group>
      
      {/* Optimized trajectory trail */}
      {showTrajectory && (
        <group ref={trailGroupRef} />
      )}
    </group>
  );
};

// Export only the scene content - no Canvas wrapper
export default EnhancedISS; 