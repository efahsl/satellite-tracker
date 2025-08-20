# TV D-Pad Camera Controls Implementation Plan

## Overview
Implement TV-friendly navigation controls for the ISS Live Tracker when in TV mode, featuring directional camera controls and zoom functionality using D-pad style interface.

## Features to Implement

### 1. D-Pad Navigation Controls
- **Location**: Left side of screen when in TV mode
- **Visual Design**: Up/Down/Left/Right arrow keys display
- **Functionality**:
  - **UP Arrow**: Rotate camera view north (decrease latitude view angle)
  - **DOWN Arrow**: Rotate camera view south (increase latitude view angle)
  - **LEFT Arrow**: Rotate camera view west (decrease longitude view angle)
  - **RIGHT Arrow**: Rotate camera view east (increase longitude view angle)

### 2. Zoom Controls
- **Initial State**: Display "Hold SELECT to Zoom IN"
- **Zoom In**: When Enter key is held down
  - Camera zooms closer to Earth
  - Text changes to "Hold SELECT to Zoom OUT"
- **Zoom Out**: When Enter key is held down (after zoom in state)
  - Camera zooms away from Earth
  - Text reverts to "Hold SELECT to Zoom IN" when released
- **Toggle Behavior**: Alternates between zoom in/out modes

### 3. Menu Integration
- **Back Button**: Escape key (already configured)
- **Behavior**: Hide D-pad controls and show left-side menu

## Technical Implementation

### Components to Create/Modify

#### 1. New Component: `TVDPadControls`
```typescript
// Location: src/components/TVDPadControls/TVDPadControls.tsx
interface TVDPadControlsProps {
  isVisible: boolean;
  onDirectionPress: (direction: 'north' | 'south' | 'east' | 'west') => void;
  onZoomToggle: (isZooming: boolean) => void;
  zoomMode: 'in' | 'out';
}
```

**Features**:
- Render D-pad arrow buttons on left side
- Display zoom instruction text
- Handle keyboard events for arrow keys and Enter
- Visual feedback for active buttons
- Responsive positioning for TV screens

#### 2. Camera Control Hook: `useTVCameraControls`
```typescript
// Location: src/hooks/useTVCameraControls.ts
interface CameraControls {
  rotateNorth: () => void;
  rotateSouth: () => void;
  rotateEast: () => void;
  rotateWest: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}
```

**Features**:
- Integrate with Three.js camera controls
- Smooth camera transitions
- Configurable rotation/zoom speeds
- Boundary limits for camera movement

#### 3. TV Mode State Management
```typescript
// Location: src/state/TVModeContext.tsx
interface TVModeState {
  isActive: boolean;
  showDPadControls: boolean;
  showMenu: boolean;
  zoomMode: 'in' | 'out';
}
```

### Keyboard Event Handling

#### Key Mappings
- **Arrow Keys**: Directional camera movement
- **Enter Key**: Zoom control (hold behavior)
- **Escape Key**: Hide D-pad, show menu (existing)

#### Implementation Strategy
```typescript
// Keyboard event listener in main TV component
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isTVMode) return;
    
    switch (event.key) {
      case 'ArrowUp':
        onDirectionPress('north');
        break;
      case 'ArrowDown':
        onDirectionPress('south');
        break;
      case 'ArrowLeft':
        onDirectionPress('west');
        break;
      case 'ArrowRight':
        onDirectionPress('east');
        break;
      case 'Enter':
        handleZoomStart();
        break;
      case 'Escape':
        hideDPadControls();
        showMenu();
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleZoomEnd();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [isTVMode]);
```

### Camera Integration with Three.js

#### Globe Component Modifications
```typescript
// Location: src/components/Globe/Globe.tsx
// Add camera control refs and methods
const cameraRef = useRef<THREE.PerspectiveCamera>();
const controlsRef = useRef<OrbitControls>();

// Camera movement functions
const rotateCameraToDirection = (direction: string, speed: number = 0.1) => {
  if (!cameraRef.current || !controlsRef.current) return;
  
  const controls = controlsRef.current;
  const currentAzimuth = controls.getAzimuthalAngle();
  const currentPolar = controls.getPolarAngle();
  
  switch (direction) {
    case 'north':
      controls.setPolarAngle(Math.max(currentPolar - speed, 0.1));
      break;
    case 'south':
      controls.setPolarAngle(Math.min(currentPolar + speed, Math.PI - 0.1));
      break;
    case 'east':
      controls.setAzimuthalAngle(currentAzimuth + speed);
      break;
    case 'west':
      controls.setAzimuthalAngle(currentAzimuth - speed);
      break;
  }
  
  controls.update();
};
```

### UI/UX Design Specifications

#### D-Pad Visual Design
- **Position**: Fixed left side, vertically centered
- **Size**: Large enough for TV viewing (min 60px buttons)
- **Style**: Semi-transparent background with clear arrow icons
- **Active State**: Highlight/glow effect when pressed
- **Animation**: Smooth transitions and hover effects

#### Zoom Control Text
- **Position**: Below D-pad controls
- **Font**: Large, TV-friendly typography
- **Color**: High contrast for TV screens
- **Animation**: Smooth text transitions between states

#### Responsive Behavior
- **TV Mode Only**: Controls only visible in TV mode
- **Auto-hide**: Hide after period of inactivity (optional)
- **Focus Management**: Clear visual focus indicators

## Implementation Steps

### Phase 1: Core Components
1. Create `TVDPadControls` component with basic layout
2. Implement keyboard event handling
3. Create `useTVCameraControls` hook
4. Add TV mode state management

### Phase 2: Camera Integration
1. Modify Globe component to accept camera control props
2. Implement smooth camera rotation functions
3. Add zoom in/out functionality
4. Test camera movement boundaries

### Phase 3: UI Polish
1. Style D-pad controls for TV viewing
2. Add visual feedback and animations
3. Implement zoom text state management
4. Add accessibility features

### Phase 4: Integration & Testing
1. Integrate with existing TV mode detection
2. Test keyboard navigation flow
3. Ensure menu integration works correctly
4. Performance testing on TV devices

## Configuration Options

### Camera Movement Settings
```typescript
const CAMERA_SETTINGS = {
  rotationSpeed: 0.1, // Radians per key press
  zoomSpeed: 0.5,     // Zoom factor per frame
  smoothing: true,    // Enable smooth transitions
  boundaries: {
    minPolarAngle: 0.1,
    maxPolarAngle: Math.PI - 0.1,
    minDistance: 2,
    maxDistance: 10
  }
};
```

### UI Settings
```typescript
const UI_SETTINGS = {
  dpadSize: 60,           // Button size in pixels
  dpadSpacing: 10,        // Space between buttons
  fadeInDuration: 300,    // Animation duration
  autoHideDelay: 5000,    // Auto-hide after inactivity
  textSize: '18px',       // Zoom instruction text size
};
```

## Testing Strategy

### Unit Tests
- Camera control functions
- Keyboard event handling
- State management logic
- Component rendering

### Integration Tests
- TV mode activation/deactivation
- Menu show/hide behavior
- Camera movement smoothness
- Zoom functionality

## Future Enhancements

### Potential Additions
1. **Haptic Feedback**: Vibration on supported devices
2. **Voice Commands**: "Zoom in", "Rotate north", etc.
3. **Gesture Support**: Swipe gestures for touch-enabled TVs
4. **Custom Key Mapping**: Allow users to remap controls
5. **Speed Controls**: Variable movement/zoom speeds
6. **Preset Views**: Quick access to common viewing angles

### Performance Optimizations
1. **Throttled Updates**: Limit camera update frequency
2. **Lazy Loading**: Load TV controls only when needed
3. **Memory Management**: Efficient cleanup of event listeners
4. **Smooth Animations**: Use requestAnimationFrame for updates

## Dependencies

### New Dependencies (if needed)
- No additional dependencies required
- Utilizes existing Three.js and React Three Fiber setup

### Modified Files
- `src/components/Globe/Globe.tsx`
- `src/state/TVModeContext.tsx` (if exists)
- `src/pages/HomePage.tsx` (or main page component)
- `src/types/index.ts` (for new interfaces)

## Accessibility Considerations

### TV Accessibility
- High contrast colors for visibility
- Large, clear button indicators
- Screen reader compatible text
- Keyboard navigation support
- Focus management for remote controls

### Implementation Notes
- Ensure all interactive elements are focusable
- Provide audio feedback for actions (optional)
- Support for reduced motion preferences
- Clear visual hierarchy for TV viewing distances

---

This plan provides a comprehensive roadmap for implementing TV D-pad camera controls that will enhance the user experience when viewing the ISS Live Tracker on television devices.
