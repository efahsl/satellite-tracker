# Implementation Plan

- [ ] 1. Add Earth rotate constants to constants file
  - Add EARTH_ROTATE_DISTANCE, EARTH_ROTATE_SPEED, and EARTH_ROTATE_TRANSITION_SPEED constants to src/utils/constants.ts
  - Define camera positioning and animation speed values for the Earth rotation feature
  - _Requirements: 1.3, 4.4_

- [ ] 2. Extend ISSContext state management for Earth rotate mode
  - Add earthRotateMode boolean field to ISSState interface in src/state/ISSContext.tsx
  - Add TOGGLE_EARTH_ROTATE action type to ISSAction union type
  - Implement TOGGLE_EARTH_ROTATE case in issReducer function
  - Ensure mutual exclusivity between followISS and earthRotateMode states
  - _Requirements: 1.4, 1.5_

- [ ] 3. Add Earth Rotate button to ISSFollowControls component
  - Add new button element to src/components/Controls/ISSFollowControls.tsx alongside existing Follow ISS button
  - Implement click handler that dispatches TOGGLE_EARTH_ROTATE action
  - Add conditional styling to show active state using blue color from PerformanceControls
  - Update component layout to accommodate the new button
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Update ISSFollowControls CSS for Earth Rotate button styling
  - Add CSS classes for Earth Rotate button in src/components/Controls/ISSFollowControls.css
  - Implement active state styling using the same blue gradient as PerformanceControls (linear-gradient(135deg, #4a90e2, #357abd))
  - Add hover effects and transitions consistent with existing button styles
  - Ensure responsive design for mobile devices
  - _Requirements: 2.2, 2.4_

- [ ] 5. Enhance Controls component to handle Earth rotate camera animation
  - Add earthRotateMode prop to Controls component interface in src/components/Globe/Controls.tsx
  - Implement camera positioning logic for equatorial orbit view
  - Add rotation animation using useFrame hook with proper angular velocity calculation
  - Implement smooth transitions when entering and exiting Earth rotate mode using lerp interpolation
  - Add proper cleanup for animation references
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Update Globe component to pass Earth rotate mode to Controls
  - Modify src/components/Globe/Globe.tsx to consume earthRotateMode from ISSContext
  - Pass earthRotateMode prop to Controls component
  - Ensure proper context consumption and prop passing
  - _Requirements: 1.1, 1.4_

- [ ] 7. Implement mutual exclusivity between camera modes
  - Update TOGGLE_EARTH_ROTATE reducer case to disable followISS when earthRotateMode is activated
  - Update TOGGLE_FOLLOW_ISS reducer case to disable earthRotateMode when followISS is activated
  - Ensure only one camera mode can be active at a time
  - _Requirements: 1.4, 1.5_

- [ ] 8. Add unit tests for Earth rotate state management
  - Create tests for TOGGLE_EARTH_ROTATE action in ISSContext reducer
  - Test mutual exclusivity between followISS and earthRotateMode states
  - Verify initial state and state transitions
  - Test edge cases and error conditions
  - _Requirements: 1.4, 1.5_

- [ ] 9. Add component tests for Earth Rotate button functionality
  - Test button rendering and styling in ISSFollowControls component
  - Verify click handlers trigger correct actions
  - Test button state synchronization with context state
  - Test active state styling matches PerformanceControls blue color
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Add integration tests for camera animation
  - Test camera positioning at equatorial orbit during Earth rotate mode
  - Verify rotation speed matches 30-second revolution requirement
  - Test smooth transitions between camera modes
  - Verify Earth remains centered during rotation
  - Test animation cleanup on component unmount
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_