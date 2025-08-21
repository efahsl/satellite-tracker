# TV D-pad Camera Controls Implementation Plan

## Overview

This plan outlines the implementation of TV D-pad camera controls that will be displayed on the left side of the screen when the app is in TV mode. The feature includes directional arrow controls for camera rotation and a zoom control with dynamic text feedback.

## Feature Requirements

### 1. D-pad Arrow Controls
- **Display**: Show Up/Down/Left/Right arrow keys on the left side of the screen in TV mode
- **Positioning**: Left side, vertically centered
- **Functionality**: 
  - Up Arrow: Rotate camera view to North (0° longitude)
  - Right Arrow: Rotate camera view to East (90° longitude)
  - Down Arrow: Rotate camera view to South (180° longitude)
  - Left Arrow: Rotate camera view to West (270° longitude)

### 2. Zoom Control
- **Text Display**: "Hold SELECT to Zoom IN" / "Hold SELECT to Zoom OUT"
- **Control**: Enter key (SELECT button on TV remote)
- **Behavior**: 
  - Hold Enter: Zoom in to Earth
  - Release Enter: Text changes to "Hold SELECT to Zoom OUT"
  - Hold Enter again: Zoom out from Earth
  - Release Enter: Text returns to "Hold SELECT to Zoom IN"

### 3. Menu Integration
- **Back Button**: Escape key (Back button on TV remote)
- **Behavior**: Hide D-pad controls and reopen hamburger menu from left side

## Technical Implementation

### 1. New Component: TV D-pad Camera Controls

#### File: `src/components/Controls/TVDpadCameraControls.tsx`

```typescript
interface TVDpadCameraControlsProps {
  isVisible: boolean;
  onHide: () => void;
}

interface CameraDirection {
  longitude: number;
  latitude: number;
  distance: number;
}
```

#### Features:
- D-pad arrow buttons with proper TV styling
- Dynamic zoom text display
- Keyboard event handling for TV remote controls
- Smooth camera transitions
- Integration with existing camera system

### 2. Camera Control System Enhancement

#### Extend `src/components/Globe/Controls.tsx`

Add new props and functionality:
```typescript
interface ControlsProps {
  // ... existing props
  tvDpadMode?: boolean;
  targetDirection?: CameraDirection;
  zoomLevel?: number;
}
```

#### New Camera Functions:
- `rotateToDirection(direction: CameraDirection)`: Smooth rotation to cardinal directions
- `zoomToDistance(targetDistance: number)`: Smooth zoom in/out
- `resetToDefaultView()`: Return to default camera position

### 3. State Management

#### Extend `src/state/ISSContext.tsx`

Add new state properties:
```typescript
interface ISSState {
  // ... existing properties
  tvDpadMode: boolean;
  currentZoomLevel: number;
  targetDirection: CameraDirection | null;
}
```

Add new actions:
```typescript
type ISSAction =
  // ... existing actions
  | { type: 'SET_TV_DPAD_MODE'; payload: boolean }
  | { type: 'SET_TARGET_DIRECTION'; payload: CameraDirection | null }
  | { type: 'SET_ZOOM_LEVEL'; payload: number }
  | { type: 'RESET_CAMERA_VIEW' };
```

### 4. Keyboard Event Handling

#### Extend `src/hooks/useTVFocusManager.ts`

Add D-pad specific key handling:
```typescript
interface UseTVFocusManagerProps {
  // ... existing props
  onDpadDirection?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelectHold?: (isHolding: boolean) => void;
  onBackPress?: () => void;
}
```

#### Key Mappings:
- Arrow keys: Camera rotation
- Enter key: Zoom control (with hold detection)
- Escape key: Hide controls and show menu

### 5. Constants and Configuration

#### Add to `src/utils/constants.ts`

```typescript
// TV D-pad Camera Controls
export const TV_DPAD_CONFIG = {
  // Camera rotation settings
  ROTATION_SPEED: 0.05, // Radians per frame for smooth rotation
  ROTATION_TRANSITION_DURATION: 1000, // ms for smooth transitions
  
  // Zoom settings
  ZOOM_IN_DISTANCE: EARTH_RADIUS + 2, // Closest zoom level
  ZOOM_OUT_DISTANCE: CAMERA_DISTANCE * 2, // Farthest zoom level
  ZOOM_SPEED: 0.1, // Zoom speed multiplier
  
  // UI positioning
  LEFT_MARGIN: '20px',
  VERTICAL_CENTER: '50%',
  BUTTON_SIZE: '60px',
  BUTTON_SPACING: '20px'
};

// Cardinal direction coordinates
export const CARDINAL_DIRECTIONS = {
  NORTH: { longitude: 0, latitude: 0, distance: CAMERA_DISTANCE },
  EAST: { longitude: 90, latitude: 0, distance: CAMERA_DISTANCE },
  SOUTH: { longitude: 180, latitude: 0, distance: CAMERA_DISTANCE },
  WEST: { longitude: 270, latitude: 0, distance: CAMERA_DISTANCE }
};
```

## Implementation Tasks

### Phase 1: Core D-pad Component
- [ ] Create `TVDpadCameraControls.tsx` component
- [ ] Implement D-pad arrow button layout
- [ ] Add TV-specific styling and positioning
- [ ] Create zoom text display component

### Phase 2: Camera Control Integration
- [ ] Extend `Controls.tsx` with new camera functions
- [ ] Implement smooth rotation to cardinal directions
- [ ] Add zoom in/out functionality
- [ ] Integrate with existing camera modes

### Phase 3: State Management
- [ ] Extend `ISSContext.tsx` with new state properties
- [ ] Implement new action types and reducer cases
- [ ] Add camera direction and zoom level management
- [ ] Ensure proper state synchronization

### Phase 4: Keyboard Event Handling
- [ ] Extend `useTVFocusManager.ts` for D-pad controls
- [ ] Implement arrow key direction handling
- [ ] Add Enter key hold detection for zoom
- [ ] Integrate Escape key for menu control

### Phase 5: Menu Integration
- [ ] Connect D-pad controls to hamburger menu
- [ ] Implement show/hide logic for D-pad controls
- [ ] Add smooth transitions between menu and D-pad
- [ ] Ensure proper focus management

### Phase 6: Testing and Polish
- [ ] Add unit tests for new components
- [ ] Test keyboard event handling
- [ ] Verify camera transitions and zoom behavior
- [ ] Test TV mode integration
- [ ] Performance testing for smooth animations

## Component Structure

```
TVDpadCameraControls/
├── TVDpadCameraControls.tsx          # Main component
├── TVDpadCameraControls.module.css   # Styling
├── DpadButton.tsx                    # Individual arrow button
├── ZoomControl.tsx                   # Zoom text and control
└── index.ts                          # Exports
```

## CSS Styling

### TV-specific Design
- Large, high-contrast buttons for 10-foot viewing
- Consistent with existing TV typography system
- Smooth animations and transitions
- Focus indicators for accessibility
- Responsive positioning on left side

### Button States
- Default: Semi-transparent background
- Hover: Increased opacity and scale
- Focus: Blue border with glow effect
- Active: Solid background during interaction

## Integration Points

### 1. HamburgerMenu Component
- D-pad controls appear when menu is closed in TV mode
- Menu reopens when Escape/Back is pressed
- Smooth transition between menu and D-pad states

### 2. Globe Component
- Camera controls receive new props for D-pad mode
- Smooth transitions between different camera positions
- Zoom functionality integrated with existing camera system

### 3. DeviceContext
- TV mode detection triggers D-pad controls display
- Responsive behavior based on screen dimensions
- Device-specific key handling

## Performance Considerations

### 1. Camera Animations
- Use `useFrame` hook for smooth 60fps animations
- Implement lerp interpolation for smooth transitions
- Add frame rate monitoring for performance optimization

### 2. State Updates
- Debounce rapid key presses to prevent excessive state updates
- Optimize camera calculations for smooth performance
- Use `useCallback` and `useMemo` for expensive operations

### 3. Memory Management
- Proper cleanup of animation frames
- Dispose of Three.js objects when component unmounts
- Monitor memory usage during camera transitions

## Accessibility Features

### 1. Keyboard Navigation
- Full keyboard support for TV remote controls
- Clear focus indicators for all interactive elements
- Logical tab order for screen readers

### 2. Visual Feedback
- High contrast colors for TV viewing
- Clear button states and transitions
- Consistent with existing TV accessibility patterns

### 3. Screen Reader Support
- Proper ARIA labels for all controls
- Descriptive text for zoom functionality
- Status announcements for camera changes

## Testing Strategy

### 1. Unit Tests
- Component rendering and state management
- Camera control function calculations
- Keyboard event handling
- State synchronization

### 2. Integration Tests
- D-pad controls with camera system
- Menu integration and transitions
- TV mode detection and behavior
- Keyboard event flow

### 3. Performance Tests
- Camera transition smoothness
- Frame rate during animations
- Memory usage patterns
- Responsiveness to user input

### 4. TV Mode Tests
- Actual TV device testing
- Remote control button mapping
- Screen resolution handling
- Focus management validation

## Future Enhancements

### 1. Additional Camera Modes
- Smooth orbital camera paths
- Predefined viewing angles
- Camera position presets

### 2. Enhanced Controls
- Analog stick simulation for fine control
- Gesture-based camera manipulation
- Voice control integration

### 3. Customization
- User-defined camera positions
- Saved camera configurations
- Personalized control schemes

## Conclusion

This implementation plan provides a comprehensive approach to adding TV D-pad camera controls to the satellite tracker application. The feature will enhance the TV user experience by providing intuitive camera control while maintaining the existing functionality and performance standards.

The modular approach ensures that the new features integrate seamlessly with the existing codebase, and the comprehensive testing strategy ensures reliability across different devices and use cases.
