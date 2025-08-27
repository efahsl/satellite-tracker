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
}

type UIAction = 
  // Existing actions...
  | { type: 'SET_TV_CAMERA_CONTROLS_VISIBLE'; payload: boolean }
  | { type: 'SET_ZOOM_MODE'; payload: boolean };
```

**Camera Control State:**
- Camera rotation state managed through Three.js OrbitControls
- Zoom mode state for toggling between navigation and zoom modes
- Directional input handling with mode-specific behavior

### Component Design

**TVCameraControls Component:**
- Positioned on the left side of the screen when visible
- Displays directional arrows in a cross/circular pattern
- Shows dynamic instruction text based on current mode (navigation vs zoom)
- Only visible in TV mode when menu is closed and manual mode is active
- Handles visual feedback for active directional inputs and disabled states

**Enhanced Controls Component:**
- Extended to handle directional camera rotation in navigation mode
- Integrated zoom control with Up/Down arrows in zoom mode
- Mode-aware input handling (navigation vs zoom mode)
- Smooth camera transitions and animations
- Respects existing camera constraints (min/max distance)

## Components and Interfaces

### TVCameraControls Component

```typescript
interface TVCameraControlsProps {
  visible: boolean;
  isInZoomMode: boolean;
  onDirectionalInput?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onToggleZoomMode?: () => void;
}

interface DirectionalArrowProps {
  direction: 'up' | 'down' | 'left' | 'right';
  isActive?: boolean;
  isDisabled?: boolean;
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
  isInZoomMode: boolean;
  onToggleZoomMode: () => void;
}

interface UseTVCameraNavigationReturn {
  handleDirectionalInput: (direction: string) => void;
  handleSelectPress: () => void;
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
  ZOOM_SPEED: 0.02, // Zoom speed per frame when in zoom mode
  ZOOM_ACCELERATION: 1.3, // Speed multiplier for continuous zoom
  MIN_ZOOM_DISTANCE: 6, // Minimum camera distance (closer than default)
  MAX_ZOOM_DISTANCE: 20, // Maximum camera distance (further than default)
  
  // Visual feedback
  ARROW_ACTIVE_SCALE: 1.1, // Scale factor for active arrow
  ARROW_ACTIVE_OPACITY: 1.0, // Opacity for active arrow
  ARROW_INACTIVE_OPACITY: 0.7, // Opacity for inactive arrow
  ARROW_DISABLED_OPACITY: 0.3, // Opacity for disabled arrows in zoom mode
  
  // Animation durations
  TRANSITION_DURATION: 200, // Smooth transitions between states
  MODE_CHANGE_DURATION: 150, // Mode transition animation
  
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
  select: boolean; // For toggling zoom mode
}

interface CameraNavigationState {
  isInZoomMode: boolean;
  azimuth: number; // Horizontal rotation
  polar: number; // Vertical rotation
  distance: number; // Zoom level
}
```

## Error Handling

### Camera Control Errors
- **OrbitControls Not Available:** Graceful fallback to no camera control
- **Invalid Rotation Values:** Clamp rotation values to valid ranges
- **Zoom Limits:** Respect min/max distance constraints from existing system

### Input Handling Errors
- **Rapid Key Events:** Debounce directional inputs to prevent jitter
- **Mode Conflicts:** Handle mode transitions gracefully when inputs occur during mode changes
- **Disabled Input Handling:** Properly ignore Left/Right inputs when in zoom mode
- **Focus Loss:** Maintain camera control even if focus is lost

### State Synchronization Errors
- **Mode Conflicts:** Ensure camera controls are disabled when not in manual mode
- **Zoom Mode Persistence:** Reset zoom mode when controls are hidden or disabled
- **Menu State Desync:** Properly hide/show controls based on menu visibility
- **Device Profile Changes:** Handle transitions between TV and non-TV modes

## Testing Strategy

### Unit Tests

**TVCameraControls Component:**
- Visibility based on TV mode, menu state, and manual mode
- Directional arrow rendering with active and disabled states
- Mode-specific instruction text updates
- Keyboard event handling for both navigation and zoom modes

**Camera Navigation Hook:**
- Mode-aware directional input processing
- Zoom mode toggle functionality
- Camera rotation calculations for navigation mode
- Zoom in/out calculations for zoom mode
- Input debouncing and acceleration

### Integration Tests

**Camera Control Integration:**
- OrbitControls integration with mode-aware directional inputs
- Smooth camera transitions during rotation and zoom
- Zoom mode functionality with Up/Down arrow controls
- State synchronization between UI and camera across mode changes

**TV Mode Integration:**
- Controls visibility based on device profile
- Menu state integration
- Manual mode requirement enforcement
- Back button behavior (hide controls, show menu)

### User Experience Tests

**Navigation Responsiveness:**
- Smooth directional rotation in navigation mode
- Appropriate rotation speed and acceleration
- Zoom in/out functionality using Up/Down arrows in zoom mode
- Visual feedback for active inputs and disabled states

**State Transitions:**
- Menu open/close behavior
- Mode switching (ISS follow to manual)
- Zoom mode entry and exit transitions
- Device profile changes
- Focus management during transitions

## Implementation Phases

### Phase 1: UI State Extensions
- Extend UIContext with TV camera controls state
- Add actions for controls visibility and zoom mode toggle
- Implement state management for navigation and zoom modes

### Phase 2: TVCameraControls Component
- Create component with directional arrows layout
- Implement mode-specific instruction text (navigation vs zoom)
- Add disabled state styling for arrows in zoom mode
- Add positioning and styling for TV mode
- Integrate with device and UI contexts

### Phase 3: Camera Navigation Hook
- Implement useTVCameraNavigation hook
- Add mode-aware directional input processing
- Create zoom mode toggle logic with SELECT key
- Handle input acceleration and debouncing for both modes

### Phase 4: Controls Integration
- Extend existing Controls component
- Integrate mode-aware directional input with OrbitControls
- Add zoom functionality using Up/Down arrows in zoom mode
- Ensure smooth camera transitions between modes

### Phase 5: Keyboard Event Handling
- Add global keyboard listeners for directional inputs
- Implement zoom mode toggle with Enter key
- Handle mode-specific key press/release events
- Integrate with existing TV focus management

### Phase 6: Visual Polish and Testing
- Add visual feedback for active directional inputs and disabled states
- Implement smooth animations and mode transitions
- Add comprehensive test coverage for both navigation and zoom modes
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
- Navigation mode: "Press SELECT for Zoom Mode"
- Zoom mode: "UP: Zoom In, DOWN: Zoom Out, SELECT: Exit"
- Smooth fade transition when mode changes
- TV-appropriate font size and contrast

### Integration with Existing UI
- Appears only when hamburger menu is closed
- Disappears when menu opens (back button pressed)
- Respects TV safe zones and existing layout
- Consistent with TV interface styling and typography