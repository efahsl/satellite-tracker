# Design Document

## Overview

The TV Camera Navigation feature adds intuitive directional controls and zoom functionality specifically for TV mode users. This feature builds on the existing TV interface enhancement by providing visual directional arrow controls and dynamic zoom controls that appear when the hamburger menu is closed in TV mode and manual camera mode is active.

The design integrates with the existing Three.js camera system, OrbitControls, and TV interface architecture while providing a seamless user experience for navigating the Earth view using remote control inputs.

## Architecture

### Integration Points

**Existing Systems Integration:**
- Leverages existing `DeviceContext.isTVProfile` for TV mode detection
- Integrates with `UIContext.hamburgerMenuVisible` for menu state management
- Uses existing `ISSContext` manual mode state to determine when controls should be active
- Extends the existing `OrbitControls` system for camera manipulation
- Builds on the established TV focus management and keyboard event handling

**Component Architecture:**
- New `TVCameraControls` component for directional arrows and zoom instructions
- Enhanced camera control logic in the existing `Controls.tsx` component
- Integration with existing TV keyboard event handling system

### State Management

**New UI State Extensions:**
```typescript
interface UIState {
  // Existing properties...
  tvCameraControlsVisible: boolean;
  isInZoomMode: boolean;
  activeZoomDirection: 'in' | 'out' | null;
}

type UIAction = 
  // Existing actions...
  | { type: 'SET_TV_CAMERA_CONTROLS_VISIBLE'; payload: boolean }
  | { type: 'SET_ZOOM_MODE'; payload: boolean }
  | { type: 'SET_ACTIVE_ZOOM_DIRECTION'; payload: 'in' | 'out' | null };
```

**Camera Control State:**
- Camera rotation state managed through Three.js OrbitControls
- Zoom mode state tracking (normal navigation vs zoom mode)
- Directional input handling with mode-specific behavior
- Active zoom direction tracking for visual feedback

### Component Design

**TVCameraControls Component:**
- Positioned on the left side of the screen when visible
- Displays directional arrows in a cross/circular pattern
- Shows dynamic instruction text based on current mode (navigation vs zoom)
- Only visible in TV mode when menu is closed and manual mode is active
- Handles visual feedback for active inputs (directional in normal mode, up/down in zoom mode)
- Provides clear visual indication when in zoom mode

**Enhanced Controls Component:**
- Extended to handle directional camera rotation in normal mode
- Integrated zoom control with dedicated zoom mode functionality
- Mode-aware input handling (directional navigation vs zoom control)
- Smooth camera transitions and animations
- Respects existing camera constraints (min/max distance)

## Components and Interfaces

### TVCameraControls Component

```typescript
interface TVCameraControlsProps {
  visible: boolean;
  isInZoomMode: boolean;
  activeZoomDirection: 'in' | 'out' | null;
  onDirectionalInput?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoomModeToggle?: () => void;
  onZoomInput?: (direction: 'in' | 'out') => void;
}

interface DirectionalArrowProps {
  direction: 'up' | 'down' | 'left' | 'right';
  isActive?: boolean;
  isDisabled?: boolean; // For when in zoom mode and left/right are disabled
}
```

### Enhanced Controls Interface

```typescript
interface ControlsProps {
  // Existing props...
  tvCameraNavigation?: boolean;
  onCameraRotate?: (direction: string, delta: number) => void;
  onZoomChange?: (zoomIn: boolean, delta: number) => void;
}
```

### Camera Navigation Hook

```typescript
interface UseTVCameraNavigationProps {
  isEnabled: boolean;
  controlsRef: React.RefObject<OrbitControls>;
  onZoomModeChange: (isInZoomMode: boolean) => void;
  onActiveZoomDirectionChange: (direction: 'in' | 'out' | null) => void;
}

interface UseTVCameraNavigationReturn {
  handleDirectionalInput: (direction: string) => void;
  handleZoomModeToggle: () => void;
  handleZoomInput: (direction: 'in' | 'out') => void;
  isInZoomMode: boolean;
}
```

## Data Models

### TV Camera Configuration

```typescript
const TV_CAMERA_CONFIG = {
  // Directional rotation settings
  ROTATION_SPEED: 0.02, // Radians per frame for smooth rotation
  ROTATION_ACCELERATION: 1.5, // Speed multiplier when holding key
  MAX_ROTATION_SPEED: 0.05, // Maximum rotation speed
  
  // Zoom settings
  ZOOM_SPEED: 0.02, // Zoom speed per frame
  ZOOM_ACCELERATION: 1.3, // Speed multiplier for continuous zoom
  MIN_ZOOM_DISTANCE: 6, // Minimum camera distance (closer than default)
  MAX_ZOOM_DISTANCE: 20, // Maximum camera distance (further than default)
  
  // Visual feedback
  ARROW_ACTIVE_SCALE: 1.1, // Scale factor for active arrow
  ARROW_ACTIVE_OPACITY: 1.0, // Opacity for active arrow
  ARROW_INACTIVE_OPACITY: 0.7, // Opacity for inactive arrow
  
  // Animation durations
  TRANSITION_DURATION: 200, // Smooth transitions between states
  ZOOM_TEXT_FADE_DURATION: 150, // Text change animation
  
  // Positioning
  CONTROLS_LEFT_OFFSET: '80px', // Distance from left edge
  CONTROLS_VERTICAL_CENTER: '50vh', // Vertical center position
  ARROW_SIZE: '60px', // Size of directional arrows
  ARROW_SPACING: '20px', // Space between arrows
} as const;
```

### Directional Input State

```typescript
interface DirectionalInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  select: boolean; // For zoom mode toggle
}

interface CameraNavigationState {
  isInZoomMode: boolean;
  azimuth: number; // Horizontal rotation
  polar: number; // Vertical rotation
  distance: number; // Zoom level
  activeZoomDirection: 'in' | 'out' | null;
}
```

## Error Handling

### Camera Control Errors
- **OrbitControls Not Available:** Graceful fallback to no camera control
- **Invalid Rotation Values:** Clamp rotation values to valid ranges
- **Zoom Limits:** Respect min/max distance constraints from existing system

### Input Handling Errors
- **Rapid Key Events:** Debounce directional inputs to prevent jitter
- **Mode Conflicts:** Handle inputs appropriately based on current mode (navigation vs zoom)
- **Invalid Zoom Mode Inputs:** Ignore left/right inputs when in zoom mode
- **Focus Loss:** Maintain camera control even if focus is lost

### State Synchronization Errors
- **Mode Conflicts:** Ensure camera controls are disabled when not in manual mode
- **Menu State Desync:** Properly hide/show controls based on menu visibility
- **Device Profile Changes:** Handle transitions between TV and non-TV modes

## Testing Strategy

### Unit Tests

**TVCameraControls Component:**
- Visibility based on TV mode, menu state, and manual mode
- Directional arrow rendering and active states
- Zoom instruction text updates
- Keyboard event handling

**Camera Navigation Hook:**
- Mode-aware directional input processing
- Zoom mode state management and toggling
- Camera rotation calculations for navigation mode
- Zoom control calculations for zoom mode
- Input debouncing and acceleration

### Integration Tests

**Camera Control Integration:**
- OrbitControls integration with directional inputs
- Smooth camera transitions during rotation
- Zoom functionality with hold-to-zoom behavior
- State synchronization between UI and camera

**TV Mode Integration:**
- Controls visibility based on device profile
- Menu state integration
- Manual mode requirement enforcement
- Back button behavior (hide controls, show menu)

## Implementation Phases

### Phase 1: UI State Extensions
- Extend UIContext with TV camera controls state
- Add actions for controls visibility and zoom mode state
- Implement state management for navigation and zoom modes

### Phase 2: TVCameraControls Component
- Create component with directional arrows layout
- Implement dynamic instruction text for navigation and zoom modes
- Add visual indicators for disabled arrows in zoom mode
- Add positioning and styling for TV mode
- Integrate with device and UI contexts

### Phase 3: Camera Navigation Hook
- Implement useTVCameraNavigation hook
- Add mode-aware directional input processing
- Create zoom mode toggle logic with SELECT key
- Implement zoom control with Up/Down arrows in zoom mode
- Handle input acceleration and debouncing

### Phase 4: Controls Integration
- Extend existing Controls component
- Integrate directional rotation with OrbitControls
- Add zoom functionality respecting existing constraints
- Ensure smooth camera transitions

### Phase 5: Keyboard Event Handling
- Add global keyboard listeners for directional inputs
- Implement zoom mode toggle with Enter key
- Handle mode-specific key press/release events
- Integrate with existing TV focus management

### Phase 6: Visual Polish and Testing
- Add mode-specific visual feedback for active inputs
- Implement smooth mode transition animations
- Add visual indicators for disabled arrows in zoom mode
- Add comprehensive test coverage for both modes
- Performance optimization for smooth camera movement

## Visual Design

### Directional Controls Layout
```
    ↑
  ← ⊕ →
    ↓
```

**Positioning:**
- Left side of screen, vertically centered
- 80px from left edge (within TV safe zone)
- Arrows arranged in cross pattern
- Center circle or space for visual balance

**Visual States:**
- Inactive: 70% opacity, normal size
- Active (key pressed): 100% opacity, 110% scale
- Smooth transitions between states

### Mode Instructions
- Positioned below directional arrows
- Dynamic text based on current mode:
  - Navigation mode: "Press SELECT for Zoom Mode"
  - Zoom mode: "Zoom Mode: UP=In, DOWN=Out, SELECT=Exit"
- Smooth fade transition when text changes
- TV-appropriate font size and contrast
- Clear visual distinction between modes

### Integration with Existing UI
- Appears only when hamburger menu is closed
- Disappears when menu opens (back button pressed)
- Respects TV safe zones and existing layout
- Consistent with TV interface styling and typography