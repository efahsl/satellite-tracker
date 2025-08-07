# Design Document

## Overview

The "Earth Rotate" camera feature extends the existing ISSFollowControls component to include a new camera mode that positions the camera at Earth's equator and automatically rotates it around the planet. This creates a cinematic view of Earth spinning from a fixed orbital perspective, completing one full revolution every 30 seconds.

The feature integrates with the existing camera control system in the Globe component and follows the established patterns for UI controls and state management.

## Architecture

### Component Structure

The implementation follows the existing architecture patterns:

1. **ISSFollowControls Component**: Extended to include the new "Earth Rotate" button
2. **ISSContext**: Extended to manage the new camera mode state
3. **Controls Component**: Enhanced to handle the Earth rotation animation
4. **Globe Component**: Updated to pass the new camera mode to Controls

### State Management

The feature extends the existing ISSContext to include:
- `earthRotateMode: boolean` - Tracks whether Earth rotate mode is active
- `TOGGLE_EARTH_ROTATE` action - Toggles the Earth rotate mode

### Camera Animation System

The Earth rotation is implemented using Three.js animation within the Controls component:
- Camera positioned at equatorial distance (EARTH_RADIUS + 3 units)
- Automatic rotation around Y-axis (Earth's rotation axis)
- 30-second revolution period (12 degrees per second)
- Smooth transitions when entering/exiting the mode

## Components and Interfaces

### Extended ISSContext Interface

```typescript
interface ISSState {
  position: ISSPosition | null;
  crew: ISSCrew[];
  loading: boolean;
  error: string | null;
  followISS: boolean;
  earthRotateMode: boolean; // New field
}

type ISSAction =
  | { type: 'FETCH_POSITION_START' }
  | { type: 'FETCH_POSITION_SUCCESS'; payload: ISSPosition }
  | { type: 'FETCH_POSITION_ERROR'; payload: string }
  | { type: 'FETCH_CREW_SUCCESS'; payload: ISSCrew[] }
  | { type: 'FETCH_CREW_ERROR'; payload: string }
  | { type: 'TOGGLE_FOLLOW_ISS' }
  | { type: 'TOGGLE_EARTH_ROTATE' }; // New action
```

### Enhanced Controls Component Interface

```typescript
interface ControlsProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  dampingFactor?: number;
  earthRotateMode?: boolean; // New prop
}
```

### Camera Animation Logic

The Earth rotation animation uses the following approach:

1. **Camera Positioning**: Position camera at equatorial orbit (Y = 0, distance = EARTH_RADIUS + 3)
2. **Rotation Animation**: Use `useFrame` hook to continuously update camera position
3. **Angular Velocity**: 360 degrees / 30 seconds = 12 degrees per second = 0.2094 radians per second
4. **Smooth Transitions**: Use lerp interpolation for entering/exiting the mode

## Data Models

### Constants

New constants added to `src/utils/constants.ts`:

```typescript
// Earth rotate camera settings
export const EARTH_ROTATE_DISTANCE = EARTH_RADIUS + 3; // Camera distance for Earth rotate mode
export const EARTH_ROTATE_SPEED = 0.2094; // Radians per second (360° in 30 seconds)
export const EARTH_ROTATE_TRANSITION_SPEED = 0.05; // Lerp factor for smooth transitions
```

### Camera State

The camera animation maintains:
- Current rotation angle (in radians)
- Target position for smooth transitions
- Animation frame reference for cleanup

## Error Handling

### Camera Animation Errors

1. **Animation Frame Cleanup**: Ensure proper cleanup of animation frames when component unmounts
2. **State Synchronization**: Handle race conditions between different camera modes
3. **Performance Degradation**: Monitor frame rates and provide fallback for low-performance devices

### UI State Errors

1. **Button State Synchronization**: Ensure button visual state matches actual camera mode
2. **Mode Conflicts**: Prevent simultaneous activation of ISS Follow and Earth Rotate modes
3. **Transition Interruptions**: Handle smooth transitions when rapidly switching modes

## Testing Strategy

### Unit Tests

1. **State Management Tests**:
   - Test `TOGGLE_EARTH_ROTATE` action
   - Verify state transitions between camera modes
   - Test mutual exclusivity of ISS Follow and Earth Rotate modes

2. **Component Tests**:
   - Test button rendering and styling
   - Verify click handlers trigger correct actions
   - Test button state synchronization with context

### Integration Tests

1. **Camera Animation Tests**:
   - Test camera positioning at equatorial orbit
   - Verify rotation speed and direction
   - Test smooth transitions between modes

2. **Performance Tests**:
   - Monitor frame rates during Earth rotation
   - Test animation cleanup on component unmount
   - Verify no memory leaks during extended rotation

### Visual Tests

1. **UI Consistency Tests**:
   - Verify button styling matches PerformanceControls active state
   - Test responsive behavior on different screen sizes
   - Validate accessibility compliance

2. **Animation Quality Tests**:
   - Verify smooth rotation without jitter
   - Test transition smoothness when entering/exiting mode
   - Validate Earth remains centered during rotation

## Implementation Notes

### Performance Considerations

1. **Animation Optimization**: Use `useFrame` with minimal calculations per frame
2. **Memory Management**: Proper cleanup of animation references
3. **Conditional Rendering**: Only run animation when Earth Rotate mode is active

### User Experience

1. **Visual Feedback**: Clear button state indication using established blue color scheme
2. **Smooth Transitions**: Gradual camera movement to prevent jarring changes
3. **Mode Exclusivity**: Automatically disable ISS Follow when Earth Rotate is activated

### Browser Compatibility

1. **Three.js Compatibility**: Leverages existing Three.js setup for maximum compatibility
2. **Animation Performance**: Uses requestAnimationFrame through React Three Fiber
3. **CSS Styling**: Uses established CSS patterns for consistent browser support