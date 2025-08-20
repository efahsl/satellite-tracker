# TV Focus Camera Controls Implementation Plan

## Overview
Implement directional camera controls and zoom functionality for TV mode, providing intuitive navigation of the Earth view using arrow keys and SELECT button interactions.

## Feature Requirements

### Directional Camera Controls
- Display Up/Down/Left/Right arrow key indicators on the left side of the screen
- Arrow key functionality:
  - **UP**: Rotate camera view to North
  - **RIGHT**: Rotate camera view to East  
  - **DOWN**: Rotate camera view to South
  - **LEFT**: Rotate camera view to West

### Zoom Controls
- Display dynamic text instruction for zoom functionality
- **SELECT (Enter Key) Hold**: 
  - Initial state: "Hold SELECT to Zoom IN" → Camera zooms in
  - After zoom in: "Hold SELECT to Zoom OUT" → Camera zooms out
  - Release: Return to "Hold SELECT to Zoom IN"

### Menu Integration
- **BACK (Escape Key)**: Hide camera controls and show hamburger menu from left side
- Controls only visible in TV mode
- Seamless transition between camera controls and menu system

## Technical Implementation

### 1. Component Structure
```
src/components/TV/
├── CameraControls/
│   ├── CameraControls.tsx          # Main container component
│   ├── DirectionalArrows.tsx       # Arrow key indicators
│   ├── ZoomInstructions.tsx        # Dynamic zoom text
│   └── CameraControls.module.css   # Styling
```

### 2. State Management
- Extend existing TV focus manager to handle camera control states
- Add camera control visibility state to UIContext
- Implement zoom state tracking (zoom in/out mode)

### 3. Camera Integration
- Integrate with existing Globe/Controls.tsx for camera manipulation
- Implement smooth camera rotation for directional controls
- Add zoom in/out functionality with smooth transitions

### 4. Key Event Handling
- Extend useTVFocusManager hook for camera control key events
- Handle directional arrow key presses
- Implement SELECT key hold/release detection for zoom
- Maintain existing BACK key functionality for menu toggle

## Implementation Tasks

### Phase 1: Component Setup
1. Create CameraControls component structure
2. Design and implement DirectionalArrows UI component
3. Create ZoomInstructions component with dynamic text
4. Add CSS modules for TV-specific styling

### Phase 2: State Integration  
1. Extend UIContext to include camera control visibility
2. Update useTVFocusManager to handle camera control states
3. Implement zoom state management (in/out toggle)

### Phase 3: Camera Functionality
1. Integrate with Globe camera controls
2. Implement directional rotation methods (North/East/South/West)
3. Add smooth zoom in/out functionality
4. Implement SELECT key hold detection and zoom control

### Phase 4: Menu Integration
1. Update HamburgerMenu to work with camera controls
2. Implement seamless transition between menu and camera controls
3. Ensure BACK key properly toggles between states

### Phase 5: Testing & Polish
1. Create comprehensive test suite for camera controls
2. Test TV remote compatibility
3. Performance optimization for smooth camera movements
4. Accessibility considerations for TV interface

## File Modifications Required

### New Files
- `src/components/TV/CameraControls/CameraControls.tsx`
- `src/components/TV/CameraControls/DirectionalArrows.tsx`
- `src/components/TV/CameraControls/ZoomInstructions.tsx`
- `src/components/TV/CameraControls/CameraControls.module.css`

### Modified Files
- `src/hooks/useTVFocusManager.ts` - Add camera control key handling
- `src/state/UIContext.tsx` - Add camera control state
- `src/components/Globe/Controls.tsx` - Integrate camera methods
- `src/layouts/MainLayout.tsx` - Include camera controls in TV mode
- `src/utils/tvConstants.ts` - Add camera control constants

## Design Considerations

### Visual Design
- Arrow indicators positioned on left side of screen
- Clear, TV-friendly typography for zoom instructions
- Consistent with existing TV UI design language
- High contrast for TV viewing conditions

### User Experience
- Intuitive directional navigation matching arrow key positions
- Clear feedback for zoom state changes
- Smooth camera transitions to prevent motion sickness
- Responsive controls that work with TV remotes

### Performance
- Optimize camera rotation calculations
- Smooth 60fps animations for camera movements
- Efficient key event handling to prevent lag
- Memory management for continuous zoom operations

## Success Criteria
- [ ] Arrow keys successfully rotate camera in correct directions
- [ ] Zoom functionality works with SELECT key hold/release
- [ ] Dynamic zoom text updates correctly
- [ ] BACK key properly toggles between camera controls and menu
- [ ] Smooth camera transitions without performance issues
- [ ] TV remote compatibility verified
- [ ] All functionality works exclusively in TV mode