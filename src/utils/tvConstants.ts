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
  PADDING: "5%",
  TOP: "5vh",
  BOTTOM: "5vh",
  LEFT: "5vw",
  RIGHT: "5vw",
} as const;

// Typography Configuration for 10-foot viewing
export const TV_TYPOGRAPHY = {
  MIN_FONT_SIZE: 32, // Minimum font size in pixels
  SCALE_FACTOR: 1.5, // Multiplier for scaling existing fonts
  LINE_HEIGHT_FACTOR: 1.2, // Multiplier for line height
  LETTER_SPACING: "0.025em", // Improved readability
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
  BORDER_COLOR: "#4A90E2", // Primary focus color
  BORDER_RADIUS: 8, // Border radius for focus indicators
  SHADOW: "0 0 0 3px rgba(74, 144, 226, 0.3)", // Focus shadow
  SCALE: 1.05, // Scale factor when focused
  TRANSITION: "all 150ms ease-in-out", // Transition for focus changes
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
  SMOOTH: "cubic-bezier(0.4, 0, 0.2, 1)", // Smooth easing for general animations
  BOUNCE: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Bounce effect for focus
  EASE_OUT: "cubic-bezier(0.0, 0, 0.2, 1)", // Ease out for menu slides
  EASE_IN: "cubic-bezier(0.4, 0, 1, 1)", // Ease in for closing animations
} as const;

// Menu Configuration
export const TV_MENU = {
  WIDTH: 320, // Menu width in pixels
  POSITION: "left", // Menu position (left side of screen)
  Z_INDEX: 1000, // Z-index for menu overlay
} as const;

// High Contrast Colors for TV Visibility
export const TV_COLORS = {
  HIGH_CONTRAST_TEXT: "#ffffff",
  HIGH_CONTRAST_BACKGROUND: "#000000",
  HIGH_CONTRAST_BORDER: "#ffffff",
  HIGH_CONTRAST_ACCENT: "#4A90E2",
  FOCUS_PRIMARY: "#4A90E2",
  FOCUS_SECONDARY: "#ffffff",
  ERROR: "#ef4444",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
} as const;

// CSS Custom Property Names (for consistency)
export const TV_CSS_VARS = {
  SAFE_ZONE_PADDING: "--tv-safe-zone-padding",
  SAFE_ZONE_TOP: "--tv-safe-zone-top",
  SAFE_ZONE_BOTTOM: "--tv-safe-zone-bottom",
  SAFE_ZONE_LEFT: "--tv-safe-zone-left",
  SAFE_ZONE_RIGHT: "--tv-safe-zone-right",
  MENU_WIDTH: "--tv-menu-width",
  ANIMATION_DURATION: "--tv-animation-duration",
  MIN_FONT_SIZE: "--tv-min-font-size",
  FONT_SCALE_FACTOR: "--tv-font-scale-factor",
  LINE_HEIGHT_FACTOR: "--tv-line-height-factor",
  BUTTON_MIN_HEIGHT: "--tv-button-min-height",
  BUTTON_MIN_WIDTH: "--tv-button-min-width",
  FOCUS_BORDER_WIDTH: "--tv-focus-border-width",
  FOCUS_BORDER_COLOR: "--tv-focus-border-color",
  FOCUS_BORDER_RADIUS: "--tv-focus-border-radius",
  FOCUS_SHADOW: "--tv-focus-shadow",
  FOCUS_SCALE: "--tv-focus-scale",
  FOCUS_TRANSITION: "--tv-focus-transition",
  HIGH_CONTRAST_TEXT: "--tv-high-contrast-text",
  HIGH_CONTRAST_BACKGROUND: "--tv-high-contrast-background",
  HIGH_CONTRAST_BORDER: "--tv-high-contrast-border",
  HIGH_CONTRAST_ACCENT: "--tv-high-contrast-accent",
  SLIDE_IN_DURATION: "--tv-slide-in-duration",
  SLIDE_OUT_DURATION: "--tv-slide-out-duration",
  FADE_DURATION: "--tv-fade-duration",
  SCALE_DURATION: "--tv-scale-duration",
  EASING_SMOOTH: "--tv-easing-smooth",
  EASING_BOUNCE: "--tv-easing-bounce",
} as const;

// Utility function to get CSS custom property value
export const getTVCSSVar = (varName: keyof typeof TV_CSS_VARS): string => {
  return `var(${TV_CSS_VARS[varName]})`;
};

// Utility function to check if current screen width matches TV profile
export const isTVWidth = (): boolean => {
  return (
    typeof window !== "undefined" && window.innerWidth === TV_DETECTION_WIDTH
  );
};

// Camera Controls Configuration
export const TV_CAMERA_CONTROLS = {
  ROTATION_SPEED: 0.3, // Speed of camera rotation for directional controls (increased for visibility)
  ZOOM_SPEED: 0.2, // Speed of zoom in/out (reduced for smoother control)
  SMOOTH_TRANSITION: 0.1, // Lerp factor for smooth camera transitions
  MIN_ZOOM_DISTANCE: 2, // Minimum zoom distance from Earth
  MAX_ZOOM_DISTANCE: 10, // Maximum zoom distance from Earth
} as const;

// Camera Direction Mappings
export const CAMERA_DIRECTIONS = {
  NORTH: { x: 0, y: 1, z: 0 },
  EAST: { x: 1, y: 0, z: 0 },
  SOUTH: { x: 0, y: -1, z: 0 },
  WEST: { x: -1, y: 0, z: 0 },
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
  CAMERA_ROTATION_SPEED: TV_CAMERA_CONTROLS.ROTATION_SPEED,
  CAMERA_ZOOM_SPEED: TV_CAMERA_CONTROLS.ZOOM_SPEED,
  CAMERA_SMOOTH_TRANSITION: TV_CAMERA_CONTROLS.SMOOTH_TRANSITION,
} as const;
