/**
 * TV Interface Constants
 * 
 * This file contains all TV-specific constants for the TV interface enhancement feature.
 * These constants are used for device detection, styling, animations, and layout adjustments
 * when the application is running in TV mode (1920px width).
 */

// Device Detection
export const TV_DETECTION_WIDTH = 1920;

// Safe Zone Configuration (5% padding from screen edges for TV safety)
export const TV_SAFE_ZONE = {
  PADDING: '5%',
  TOP: '5vh',
  BOTTOM: '5vh',
  LEFT: '5vw',
  RIGHT: '5vw',
} as const;

// Typography Configuration for 10-foot viewing
export const TV_TYPOGRAPHY = {
  MIN_FONT_SIZE: 32, // Minimum font size in pixels
  SCALE_FACTOR: 1.5, // Multiplier for scaling existing fonts
  LINE_HEIGHT_FACTOR: 1.2, // Multiplier for line height
  LETTER_SPACING: '0.025em', // Improved readability
} as const;

// Button and Interactive Element Sizing
export const TV_INTERACTIVE = {
  BUTTON_MIN_HEIGHT: 48, // Minimum button height in pixels
  BUTTON_MIN_WIDTH: 200, // Minimum button width in pixels
  TOUCH_TARGET_SIZE: 48, // Minimum touch target size
  SPACING_UNIT: 16, // Base spacing unit for consistent margins/padding
} as const;

// Focus State Styling
export const TV_FOCUS = {
  BORDER_WIDTH: 3, // Focus border width in pixels
  BORDER_COLOR: '#4A90E2', // Primary focus color
  BORDER_RADIUS: 8, // Border radius for focus indicators
  SHADOW: '0 0 0 3px rgba(74, 144, 226, 0.3)', // Focus shadow
  SCALE: 1.05, // Scale factor when focused
  TRANSITION: 'all 150ms ease-in-out', // Transition for focus changes
} as const;

// Animation Durations (in milliseconds)
export const TV_ANIMATIONS = {
  MENU_SLIDE: 300, // Menu slide in/out duration
  FADE: 200, // Fade in/out duration
  FOCUS_SCALE: 150, // Focus scaling animation duration
  TRANSITION_SMOOTH: 300, // General smooth transitions
} as const;

// Animation Easing Functions
export const TV_EASING = {
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing for general animations
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce effect for focus
  EASE_OUT: 'cubic-bezier(0.0, 0, 0.2, 1)', // Ease out for menu slides
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)', // Ease in for closing animations
} as const;

// Menu Configuration
export const TV_MENU = {
  WIDTH: 320, // Menu width in pixels
  POSITION: 'left', // Menu position (left side of screen)
  Z_INDEX: 1000, // Z-index for menu overlay
} as const;

// High Contrast Colors for TV Visibility
export const TV_COLORS = {
  HIGH_CONTRAST_TEXT: '#ffffff',
  HIGH_CONTRAST_BACKGROUND: '#000000',
  HIGH_CONTRAST_BORDER: '#ffffff',
  HIGH_CONTRAST_ACCENT: '#4A90E2',
  FOCUS_PRIMARY: '#4A90E2',
  FOCUS_SECONDARY: '#ffffff',
  ERROR: '#ef4444',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
} as const;

// CSS Custom Property Names (for consistency)
export const TV_CSS_VARS = {
  SAFE_ZONE_PADDING: '--tv-safe-zone-padding',
  SAFE_ZONE_TOP: '--tv-safe-zone-top',
  SAFE_ZONE_BOTTOM: '--tv-safe-zone-bottom',
  SAFE_ZONE_LEFT: '--tv-safe-zone-left',
  SAFE_ZONE_RIGHT: '--tv-safe-zone-right',
  MENU_WIDTH: '--tv-menu-width',
  ANIMATION_DURATION: '--tv-animation-duration',
  MIN_FONT_SIZE: '--tv-min-font-size',
  FONT_SCALE_FACTOR: '--tv-font-scale-factor',
  LINE_HEIGHT_FACTOR: '--tv-line-height-factor',
  BUTTON_MIN_HEIGHT: '--tv-button-min-height',
  BUTTON_MIN_WIDTH: '--tv-button-min-width',
  FOCUS_BORDER_WIDTH: '--tv-focus-border-width',
  FOCUS_BORDER_COLOR: '--tv-focus-border-color',
  FOCUS_BORDER_RADIUS: '--tv-focus-border-radius',
  FOCUS_SHADOW: '--tv-focus-shadow',
  FOCUS_SCALE: '--tv-focus-scale',
  FOCUS_TRANSITION: '--tv-focus-transition',
  HIGH_CONTRAST_TEXT: '--tv-high-contrast-text',
  HIGH_CONTRAST_BACKGROUND: '--tv-high-contrast-background',
  HIGH_CONTRAST_BORDER: '--tv-high-contrast-border',
  HIGH_CONTRAST_ACCENT: '--tv-high-contrast-accent',
  SLIDE_IN_DURATION: '--tv-slide-in-duration',
  SLIDE_OUT_DURATION: '--tv-slide-out-duration',
  FADE_DURATION: '--tv-fade-duration',
  SCALE_DURATION: '--tv-scale-duration',
  EASING_SMOOTH: '--tv-easing-smooth',
  EASING_BOUNCE: '--tv-easing-bounce',
} as const;

// Utility function to get CSS custom property value
export const getTVCSSVar = (varName: keyof typeof TV_CSS_VARS): string => {
  return `var(${TV_CSS_VARS[varName]})`;
};

// Utility function to check if current screen width matches TV profile
export const isTVWidth = (): boolean => {
  return typeof window !== 'undefined' && window.innerWidth === TV_DETECTION_WIDTH;
};

// TV Camera Navigation Configuration
export const TV_CAMERA_CONFIG = {
  // Directional rotation settings
  ROTATION_SPEED: 0.04, // Radians per frame for smooth rotation
  ROTATION_ACCELERATION: 1.5, // Speed multiplier when holding key
  MAX_ROTATION_SPEED: 0.07, // Maximum rotation speed
  ROTATION_DAMPING: 0.95, // Damping factor for smooth deceleration
  
  // Camera rotation limits (in radians)
  MIN_POLAR_ANGLE: Math.PI * 0.1, // Minimum vertical angle (prevent going too far up)
  MAX_POLAR_ANGLE: Math.PI * 0.9, // Maximum vertical angle (prevent going too far down)
  AZIMUTH_STEP: Math.PI / 90, // Step size for horizontal rotation (2 degrees)
  POLAR_STEP: Math.PI / 90, // Step size for vertical rotation (2 degrees)
  
  // Zoom settings
  ZOOM_SPEED: 0.1, // Zoom speed per frame (increased for more noticeable effect)
  ZOOM_ACCELERATION: 1.3, // Speed multiplier for continuous zoom
  MIN_ZOOM_DISTANCE: 6, // Minimum camera distance (closer than default)
  MAX_ZOOM_DISTANCE: 20, // Maximum camera distance (further than default)
  ZOOM_STEP: 0.1, // Discrete zoom step size
  
  // Visual feedback parameters
  ARROW_ACTIVE_SCALE: 1.1, // Scale factor for active arrow
  ARROW_ACTIVE_OPACITY: 1.0, // Opacity for active arrow
  ARROW_INACTIVE_OPACITY: 0.7, // Opacity for inactive arrow
  ARROW_HOVER_SCALE: 1.05, // Scale factor for hover state
  
  // Animation durations (in milliseconds)
  TRANSITION_DURATION: 200, // Smooth transitions between states
  ZOOM_TEXT_FADE_DURATION: 150, // Text change animation
  ARROW_ANIMATION_DURATION: 100, // Arrow press animation
  CONTROLS_FADE_DURATION: 300, // Controls show/hide animation
  
  // Positioning and layout
  CONTROLS_LEFT_OFFSET: 80, // Distance from left edge in pixels
  CONTROLS_VERTICAL_CENTER: '50vh', // Vertical center position
  ARROW_SIZE: 60, // Size of directional arrows in pixels
  ARROW_SPACING: 20, // Space between arrows in pixels
  CONTROLS_CONTAINER_WIDTH: 140, // Total width of controls container
  CONTROLS_CONTAINER_HEIGHT: 140, // Total height of controls container
  
  // Zoom instruction text positioning
  ZOOM_TEXT_OFFSET_TOP: 160, // Distance below arrows for zoom text
  ZOOM_TEXT_MAX_WIDTH: 200, // Maximum width for zoom instruction text
  
  // Animation easing
  EASING_CAMERA_MOVEMENT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth camera movement
  EASING_UI_FEEDBACK: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // UI feedback animations
  EASING_FADE: 'cubic-bezier(0.4, 0, 0.2, 1)', // Fade animations
  
  // Input handling
  INPUT_DEBOUNCE_MS: 16, // Debounce time for input events (60fps)
  HOLD_THRESHOLD_MS: 100, // Time before considering a key "held"
  ACCELERATION_DELAY_MS: 500, // Time before acceleration kicks in
  
  // Visual styling
  ARROW_BORDER_RADIUS: 8, // Border radius for arrow buttons
  CONTROLS_BACKGROUND_OPACITY: 0.1, // Background opacity for controls container
  CONTROLS_BACKDROP_BLUR: 4, // Backdrop blur effect in pixels
} as const;

// Directional input constants
export const TV_CAMERA_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
} as const;

// Zoom mode constants
export const TV_CAMERA_ZOOM_MODES = {
  IN: 'in',
  OUT: 'out',
} as const;

// Keyboard key mappings for TV camera navigation
export const TV_CAMERA_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  SELECT: 'Enter', // SELECT button on TV remote
  BACK: 'Escape', // BACK button on TV remote
} as const;

// CSS class names for TV camera controls
export const TV_CAMERA_CSS_CLASSES = {
  CONTROLS_CONTAINER: 'tv-camera-controls',
  DIRECTIONAL_ARROWS: 'tv-camera-arrows',
  ARROW_BUTTON: 'tv-camera-arrow',
  ARROW_ACTIVE: 'tv-camera-arrow--active',
  ARROW_UP: 'tv-camera-arrow--up',
  ARROW_DOWN: 'tv-camera-arrow--down',
  ARROW_LEFT: 'tv-camera-arrow--left',
  ARROW_RIGHT: 'tv-camera-arrow--right',
  ZOOM_INSTRUCTIONS: 'tv-camera-zoom-text',
  ZOOM_INSTRUCTIONS_ACTIVE: 'tv-camera-zoom-text--active',
} as const;

// Combined TV configuration object (for backward compatibility)
export const TV_CONFIG = {
  DETECTION_WIDTH: TV_DETECTION_WIDTH,
  SAFE_ZONE_PADDING: TV_SAFE_ZONE.PADDING,
  MENU_WIDTH: `${TV_MENU.WIDTH}px`,
  ANIMATION_DURATION: TV_ANIMATIONS.MENU_SLIDE,
  FOCUS_BORDER_WIDTH: `${TV_FOCUS.BORDER_WIDTH}px`,
  FOCUS_BORDER_COLOR: TV_FOCUS.BORDER_COLOR,
  MIN_FONT_SIZE: `${TV_TYPOGRAPHY.MIN_FONT_SIZE}px`,
  BUTTON_MIN_HEIGHT: `${TV_INTERACTIVE.BUTTON_MIN_HEIGHT}px`,
  BUTTON_MIN_WIDTH: `${TV_INTERACTIVE.BUTTON_MIN_WIDTH}px`,
  FONT_SCALE_FACTOR: TV_TYPOGRAPHY.SCALE_FACTOR,
  LINE_HEIGHT_FACTOR: TV_TYPOGRAPHY.LINE_HEIGHT_FACTOR,
  HIGH_CONTRAST_TEXT: TV_COLORS.HIGH_CONTRAST_TEXT,
  HIGH_CONTRAST_BACKGROUND: TV_COLORS.HIGH_CONTRAST_BACKGROUND,
  HIGH_CONTRAST_BORDER: TV_COLORS.HIGH_CONTRAST_BORDER,
  SAFE_ZONE_TOP: TV_SAFE_ZONE.TOP,
  SAFE_ZONE_BOTTOM: TV_SAFE_ZONE.BOTTOM,
  SAFE_ZONE_LEFT: TV_SAFE_ZONE.LEFT,
  SAFE_ZONE_RIGHT: TV_SAFE_ZONE.RIGHT,
} as const;