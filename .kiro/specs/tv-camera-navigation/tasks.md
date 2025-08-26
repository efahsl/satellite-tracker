# Implementation Plan

- [x] 1. Extend UIContext with TV camera controls state management

  - Add tvCameraControlsVisible, isInZoomMode, and activeZoomDirection properties to UIState interface
  - Implement SET_TV_CAMERA_CONTROLS_VISIBLE, SET_ZOOM_MODE, and SET_ACTIVE_ZOOM_DIRECTION actions
  - Create action creators for camera controls state management
  - Write unit tests for new state management functionality
  - _Requirements: 1.1, 1.4, 3.1, 3.2_

- [x] 2. Create TV camera configuration constants

  - Define TV_CAMERA_CONFIG object with rotation speeds, zoom settings, and visual feedback parameters
  - Add directional input constants and camera rotation limits
  - Define positioning and styling constants for TV camera controls
  - Create animation duration and easing constants
  - _Requirements: 2.1, 2.5, 2.6, 3.2_

- [x] 3. Implement TVCameraControls component structure

  - Create TVCameraControls component with directional arrows layout
  - Implement DirectionalArrow sub-component for individual arrow buttons
  - Add dynamic zoom instruction text component
  - Create CSS module for TV camera controls styling and positioning
  - _Requirements: 1.1, 1.2, 1.3, 3.1_

- [x] 4. Add TV camera controls visibility logic

  - Integrate TVCameraControls with DeviceContext isTVProfile detection
  - Connect component visibility to UIContext hamburgerMenuVisible state
  - Add manual mode requirement using ISSContext state
  - Implement conditional rendering based on all three state conditions
  - _Requirements: 1.1, 1.4, 1.5, 5.1, 5.2_

- [x] 5. Create useTVCameraNavigation hook for input handling

  - Implement custom hook for managing directional input state and zoom mode
  - Add keyboard event listeners for arrow keys with mode-aware behavior
  - Create zoom mode toggle logic for Enter key press events
  - Implement input debouncing and acceleration for smooth camera movement
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 3.7_

- [x] 6. Implement directional camera rotation logic

  - Extend Controls component to accept directional rotation inputs
  - Add camera rotation functions for north, south, east, west directions
  - Integrate with existing OrbitControls for smooth camera movement
  - Implement rotation speed and acceleration based on key hold duration
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 7. Update existing implementation for zoom mode toggle architecture

  - Refactor UIContext state management to use isInZoomMode boolean instead of hold-to-zoom state
  - Update useTVCameraNavigation hook to handle zoom mode toggle with SELECT key instead of hold behavior
  - Modify TVCameraControls component to support mode-aware text display and disabled arrow states
  - Remove existing hold-to-zoom logic and replace with toggle-based zoom mode state management
  - Update keyboard event handling to distinguish between navigation mode and zoom mode inputs
  - _Requirements: 3.1, 3.2, 3.7, 3.8_

- [ ] 8. Implement dedicated zoom mode functionality

  - Create zoom mode toggle logic triggered by SELECT (Enter) key press
  - Implement zoom control using Up arrow (zoom in) and Down arrow (zoom out) in zoom mode
  - Add dynamic text updates: "Press SELECT for Zoom Mode" / "Zoom Mode: UP=In, DOWN=Out, SELECT=Exit"
  - Disable Left/Right arrow functionality when in zoom mode
  - Integrate zoom controls with existing camera distance constraints
  - Add smooth zoom animation with requestAnimationFrame for responsive zooming
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 10. Integrate camera controls with existing TV interface

  - Connect TVCameraControls component to main layout when in TV mode
  - Ensure controls hide when hamburger menu opens (back button pressed)
  - Add smooth show/hide animations coordinated with menu transitions
  - Integrate with existing TV focus management system
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9. Add mode-specific visual feedback for inputs

  - Implement active state styling for directional arrows based on current mode
  - Add disabled state styling for Left/Right arrows when in zoom mode
  - Add scale and opacity animations for visual feedback
  - Create smooth transitions between active, inactive, and disabled arrow states
  - Ensure visual feedback works with mode-aware keyboard input detection
  - _Requirements: 2.5, 2.6, 3.4_

- [ ] 11. Implement manual mode requirement enforcement

  - Add logic to disable camera controls when not in manual camera mode
  - Hide or disable controls when in ISS follow mode or Earth rotate mode
  - Show controls only when manual mode is active in TV mode
  - Add visual indicators or messaging when controls are disabled
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Add comprehensive testing and polish
  - Write end-to-end tests for complete TV camera navigation user flows including zoom mode
  - Add performance tests for smooth camera movement and animations in both modes
  - Implement accessibility tests for keyboard navigation and mode transitions
  - Create visual regression tests for control positioning and styling in both modes
  - Add error handling tests for edge cases and invalid states
  - Test zoom mode entry/exit behavior and disabled arrow states
  - Perform manual testing with actual TV remote control simulation
  - _Requirements: All requirements - comprehensive validation_
