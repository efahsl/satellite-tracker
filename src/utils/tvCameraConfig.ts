/**
 * TV Camera Navigation Configuration Constants
 * 
 * This file contains all configuration constants for TV camera navigation,
 * including rotation speeds, zoom settings, visual feedback parameters,
 * positioning, and animation constants.
 */

// Directional input constants
export const DIRECTIONAL_INPUTS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  SELECT: 'select'
} as const;

export type DirectionalInput = typeof DIRECTIONAL_INPUTS[keyof typeof DIRECTIONAL_INPUTS];

// Camera rotation direction mappings
export const CAMERA_DIRECTIONS = {
  NORTH: 'north',
  SOUTH: 'south',
  EAST: 'east',
  WEST: 'west'
} as const;

export type CameraDirection = typeof CAMERA_DIRECTIONS[keyof typeof CAMERA_DIRECTIONS];

// Zoom modes
export const ZOOM_MODES = {
  IN: 'in',
  OUT: 'out'
} as const;

export type ZoomMode = typeof ZOOM_MODES[keyof typeof ZOOM_MODES];

// Main TV camera configuration object
export const TV_CAMERA_CONFIG = {
  // Directional rotation settings
  ROTATION: {
    BASE_SPEED: 0.02, // Radians per frame for smooth rotation
    ACCELERATION: 1.5, // Speed multiplier when holding key
    MAX_SPEED: 0.05, // Maximum rotation speed
    MIN_SPEED: 0.01, // Minimum rotation speed
    DECELERATION: 0.95, // Deceleration factor when key is released
    
    // Camera rotation limits (in radians)
    LIMITS: {
      MIN_POLAR_ANGLE: Math.PI * 0.1, // Prevent camera from going too high
      MAX_POLAR_ANGLE: Math.PI * 0.9, // Prevent camera from going too low
      MIN_AZIMUTH_ANGLE: -Infinity, // Allow full horizontal rotation
      MAX_AZIMUTH_ANGLE: Infinity
    }
  },
  
  // Zoom settings
  ZOOM: {
    BASE_SPEED: 0.02, // Zoom speed per frame
    ACCELERATION: 1.3, // Speed multiplier for continuous zoom
    MIN_DISTANCE: 6, // Minimum camera distance (closer view)
    MAX_DISTANCE: 20, // Maximum camera distance (further view)
    DEFAULT_DISTANCE: 12, // Default camera distance
    
    // Zoom behavior
    HOLD_THRESHOLD: 100, // Milliseconds to hold before continuous zoom
    STEP_SIZE: 0.5, // Discrete zoom step size for single press
    SMOOTH_FACTOR: 0.1 // Smoothing factor for zoom transitions
  },
  
  // Visual feedback parameters
  VISUAL_FEEDBACK: {
    ARROW: {
      ACTIVE_SCALE: 1.1, // Scale factor for active arrow
      INACTIVE_SCALE: 1.0, // Scale factor for inactive arrow
      ACTIVE_OPACITY: 1.0, // Opacity for active arrow
      INACTIVE_OPACITY: 0.7, // Opacity for inactive arrow
      HOVER_OPACITY: 0.85, // Opacity for hover state
      
      // Arrow colors
      ACTIVE_COLOR: '#ffffff', // White for active state
      INACTIVE_COLOR: '#cccccc', // Light gray for inactive state
      BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.3)' // Semi-transparent background
    },
    
    ZOOM_TEXT: {
      ACTIVE_OPACITY: 1.0, // Opacity when zooming is active
      INACTIVE_OPACITY: 0.8, // Opacity when not zooming
      FADE_DURATION: 150 // Text change animation duration (ms)
    }
  },
  
  // Positioning and layout constants
  POSITIONING: {
    CONTROLS_LEFT_OFFSET: '80px', // Distance from left edge (TV safe zone)
    CONTROLS_VERTICAL_CENTER: '50vh', // Vertical center position
    CONTROLS_BOTTOM_OFFSET: '120px', // Distance from bottom for zoom text
    
    // Arrow dimensions and spacing
    ARROW_SIZE: '60px', // Size of directional arrows
    ARROW_SPACING: '20px', // Space between arrows
    ARROW_BORDER_RADIUS: '8px', // Rounded corners for arrows
    
    // Container dimensions
    CONTAINER_WIDTH: '140px', // Total width of controls container
    CONTAINER_HEIGHT: '140px', // Total height of controls container
    
    // Z-index for layering
    Z_INDEX: 1000 // Ensure controls appear above other elements
  },
  
  // Animation duration and easing constants
  ANIMATIONS: {
    // Transition durations (in milliseconds)
    SHOW_HIDE_DURATION: 200, // Controls show/hide animation
    ARROW_FEEDBACK_DURATION: 100, // Arrow press feedback
    ZOOM_TEXT_TRANSITION: 150, // Zoom text change animation
    CAMERA_ROTATION_SMOOTH: 16, // Camera rotation smoothing (60fps)
    
    // Easing functions (CSS timing functions)
    EASING: {
      EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth ease out
      EASE_IN_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)', // Smooth ease in-out
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Slight bounce effect
      LINEAR: 'linear' // Linear transition
    },
    
    // Animation delays
    DELAYS: {
      STAGGER_ARROWS: 50, // Delay between arrow animations
      ZOOM_TEXT_DELAY: 100 // Delay before showing zoom text changes
    }
  },
  
  // Input handling constants
  INPUT: {
    // Debouncing and throttling
    DEBOUNCE_DELAY: 16, // Debounce input events (60fps)
    THROTTLE_DELAY: 33, // Throttle continuous inputs (30fps)
    
    // Key repeat handling
    KEY_REPEAT_DELAY: 500, // Initial delay before key repeat (ms)
    KEY_REPEAT_RATE: 50, // Key repeat rate (ms between repeats)
    
    // Input acceleration
    ACCELERATION_THRESHOLD: 1000, // Time to reach max acceleration (ms)
    ACCELERATION_CURVE: 2.0 // Exponential acceleration curve
  },
  
  // Accessibility constants
  ACCESSIBILITY: {
    // Focus indicators
    FOCUS_OUTLINE_WIDTH: '3px',
    FOCUS_OUTLINE_COLOR: '#007acc',
    FOCUS_OUTLINE_OFFSET: '2px',
    
    // High contrast mode adjustments
    HIGH_CONTRAST: {
      ARROW_BORDER_WIDTH: '2px',
      ARROW_BORDER_COLOR: '#ffffff',
      TEXT_SHADOW: '1px 1px 2px rgba(0, 0, 0, 0.8)'
    }
  }
} as const;

// Directional input to camera direction mapping
export const INPUT_TO_DIRECTION_MAP = {
  [DIRECTIONAL_INPUTS.UP]: CAMERA_DIRECTIONS.NORTH,
  [DIRECTIONAL_INPUTS.DOWN]: CAMERA_DIRECTIONS.SOUTH,
  [DIRECTIONAL_INPUTS.LEFT]: CAMERA_DIRECTIONS.WEST,
  [DIRECTIONAL_INPUTS.RIGHT]: CAMERA_DIRECTIONS.EAST
} as const;

// Keyboard key codes for TV remote control
export const TV_REMOTE_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  SELECT: 'Enter',
  BACK: 'Escape'
} as const;

// Camera rotation vectors for each direction
export const ROTATION_VECTORS = {
  [CAMERA_DIRECTIONS.NORTH]: { azimuth: 0, polar: -1 }, // Rotate up
  [CAMERA_DIRECTIONS.SOUTH]: { azimuth: 0, polar: 1 }, // Rotate down
  [CAMERA_DIRECTIONS.EAST]: { azimuth: 1, polar: 0 }, // Rotate right
  [CAMERA_DIRECTIONS.WEST]: { azimuth: -1, polar: 0 } // Rotate left
} as const;

// Export type definitions for TypeScript
export type TVCameraConfig = typeof TV_CAMERA_CONFIG;
export type RotationVector = typeof ROTATION_VECTORS[keyof typeof ROTATION_VECTORS];