# Implementation Plan

- [x] 1. Extend UIContext with TV camera controls state management

  - Add tvCameraControlsVisible and isInZoomMode properties to UIState interface
  - Implement SET_TV_CAMERA_CONTROLS_VISIBLE and SET_ZOOM_MODE actions
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

  - Implement custom hook for managing directional input state
  - Add keyboard event listeners for arrow keys (up, down, left, right)
  - Create zoom mode toggle logic for Enter key press events
  - Implement input debouncing and acceleration for smooth camera movement
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 3.7_

- [x] 6. Implement directional camera rotation logic

  - Extend Controls component to accept directional rotation inputs
  - Add camera rotation functions for north, south, east, west directions
  - Integrate with existing OrbitControls for smooth camera movement
  - Implement rotation speed and acceleration based on key hold duration
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7. Add zoom control functionality with dynamic text

  - Implement zoom mode toggle functionality with Enter key
  - Create zoom mode state management with mode-specific behavior
  - Add dynamic text updates: "Press SELECT for Zoom Mode" / "UP: Zoom In, DOWN: Zoom Out, SELECT: Exit"
  - Integrate zoom controls with existing camera distance constraints
  - Add zoom in/out functionality using Up/Down arrows in zoom mode
  - Disable Left/Right arrows when in zoom mode
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 8. Integrate camera controls with existing TV interface

  - Connect TVCameraControls component to main layout when in TV mode
  - Ensure controls hide when hamburger menu opens (back button pressed)
  - Add smooth show/hide animations coordinated with menu transitions
  - Integrate with existing TV focus management system
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Add visual feedback for active directional inputs

  - Implement active state styling for directional arrows when keys are pressed
  - Add scale and opacity animations for visual feedback
  - Create smooth transitions between active and inactive arrow states
  - Ensure visual feedback works with keyboard input detection
  - _Requirements: 2.5, 2.6_

- [ ] 10. Refactor zoom behavior from hold-to-zoom to zoom mode toggle

  - Update UIContext: replace zoomMode/isZooming with isInZoomMode boolean and SET_ZOOM_MODE action
  - Modify useTVCameraNavigation hook: replace hold-to-zoom with SELECT key toggle, add mode-aware input handling
  - Update TVCameraControls component: change instruction text and add disabled state for Left/Right arrows in zoom mode
  - Refactor zoom functionality to use Up/Down arrows for zoom in/out when in zoom mode
  - Update all related tests to reflect new zoom mode toggle behavior
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 11. Implement manual mode requirement enforcement

  - Add logic to disable camera controls when not in manual camera mode
  - Hide or disable controls when in ISS follow mode or Earth rotate mode
  - Show controls only when manual mode is active in TV mode
  - Add visual indicators or messaging when controls are disabled
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Add comprehensive testing and polish
  - Write end-to-end tests for complete TV camera navigation user flows with new zoom mode
  - Add performance tests for smooth camera movement and animations
  - Implement accessibility tests for keyboard navigation
  - Create visual regression tests for control positioning and styling
  - Add error handling tests for edge cases and invalid states
  - Perform manual testing with actual TV remote control simulation
  - _Requirements: All requirements - comprehensive validation_
