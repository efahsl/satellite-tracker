// Earth and ISS constants
export const EARTH_RADIUS = 5; // Radius of Earth in our 3D scene
export const ISS_ALTITUDE_SCALE = 0.005; // Scale factor for ISS altitude visualization
export const ISS_SIZE = 0.25; // Size of the ISS model/marker in the scene

// API endpoints
export const ISS_POSITION_API = 'https://api.wheretheiss.at/v1/satellites/25544';
export const ISS_CREW_API = 'https://api.open-notify.org/astros.json';

// Update intervals (in milliseconds)
export const POSITION_UPDATE_INTERVAL = 5000; // 5 seconds
export const CREW_UPDATE_INTERVAL = 60000; // 1 minute

// Camera settings
export const CAMERA_DISTANCE = 12;
export const CAMERA_FOV = 45;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;

// Animation settings
export const ROTATION_SPEED = 0.001;
export const TRANSITION_DURATION = 1000; // 1 second for smooth transitions

// UI settings
export const INFO_PANEL_WIDTH = 350; // Width of the information panel in pixels

// Earth texture paths (using local files)
export const EARTH_DAY_MAP = '/assets/textures/earth_daymap.jpg';
export const EARTH_NIGHT_MAP = '/assets/textures/earth_nightmap.jpg';
export const EARTH_CLOUDS_MAP = '/assets/textures/earth_clouds.png';
export const EARTH_NORMAL_MAP = ''; // Not using normal map for development
export const EARTH_SPECULAR_MAP = ''; // Not using specular map for development

// Enhanced ISS Trail Settings
export const ISS_TRACK_COLOR = '#ff6600'; // Primary color of the ISS trajectory (cyan)
export const ISS_TRACK_COLOR_FADE = '#0066ff'; // Fade color for older trail segments
export const ISS_MARKER_COLOR = '#ef4444'; // Color of the ISS marker

// Trail visual configuration
export const ISS_TRAIL_LENGTH = 300; // Number of position points to track (2-3 orbits)
export const ISS_TRAIL_TUBE_RADIUS = 0.008; // Radius of the trail tube geometry
export const ISS_TRAIL_SEGMENTS = 8; // Radial segments for tube geometry
export const ISS_TRAIL_GLOW_INTENSITY = 0.6; // Emissive glow intensity
export const ISS_TRAIL_OPACITY_MIN = 0.1; // Minimum opacity for oldest trail segments
export const ISS_TRAIL_OPACITY_MAX = 1.0; // Maximum opacity for newest trail segments

// Trail animation settings
export const ISS_TRAIL_PULSE_SPEED = 2.0; // Speed of pulsing animation
export const ISS_TRAIL_FLOW_SPEED = 0.5; // Speed of flowing effect along trail
export const ISS_TRAIL_GLOW_VARIATION = 0.3; // Amount of glow intensity variation

// Night lighting enhancement settings
export const CITY_BRIGHTNESS_THRESHOLD = 0.15; // What counts as a "city" area
export const CITY_ENHANCEMENT_FACTOR = 1.8; // Brightness boost for cities
export const MAJOR_CITY_THRESHOLD = 0.4; // Major city threshold
export const MAJOR_CITY_ENHANCEMENT = 2.5; // Extra boost for major cities
export const CITY_GLOW_INTENSITY = 0.4; // Glow effect strength around cities

// Sun settings
export const SUN_SIZE = 8; // Size of the sun sphere
export const SUN_DISTANCE = 150; // Distance of sun from Earth center
export const SUN_INTENSITY = 2.2; // Enhanced brightness intensity of the sun
export const SUN_COLOR = '#ffaa44'; // Base color of the sun
export const SUN_CORONA_COLOR = '#ff6b35'; // Color of the sun's corona

// Enhanced solar lighting settings
export const SOLAR_COLOR_TEMPERATURE = 5778; // Realistic solar color temperature in Kelvin
export const SOLAR_ACTIVITY_MIN = 0.8; // Minimum solar activity multiplier
export const SOLAR_ACTIVITY_MAX = 1.2; // Maximum solar activity multiplier
export const SHADOW_MAP_SIZE = 2048; // Shadow map resolution
export const SHADOW_CAMERA_SIZE = 20; // Shadow camera frustum size

// Earth rotate camera settings
export const EARTH_ROTATE_DISTANCE = EARTH_RADIUS + 12; // Camera distance for Earth rotate mode (closer zoom)
export const EARTH_ROTATE_SPEED = 0.1047; // Radians per second (360° in 15 seconds - faster)
export const EARTH_ROTATE_TRANSITION_SPEED = 0.05; // Lerp factor for smooth transitions

// TV D-pad Camera Controls
export const TV_DPAD_CONFIG = {
  // Camera rotation settings
  ROTATION_SPEED: 0.05, // Radians per frame for smooth rotation
  ROTATION_TRANSITION_DURATION: 1000, // ms for smooth transitions
  
  // Zoom settings
  ZOOM_IN_DISTANCE: EARTH_RADIUS + 2, // Closest zoom level
  ZOOM_OUT_DISTANCE: CAMERA_DISTANCE * 2, // Farthest zoom level
  ZOOM_SPEED: 0.1, // Zoom speed multiplier
  
  // UI positioning
  LEFT_MARGIN: '20px',
  VERTICAL_CENTER: '50%',
  BUTTON_SIZE: '60px',
  BUTTON_SPACING: '20px'
};

// Cardinal direction coordinates
export const CARDINAL_DIRECTIONS = {
  NORTH: { longitude: 0, latitude: 0, distance: CAMERA_DISTANCE },
  EAST: { longitude: 90, latitude: 0, distance: CAMERA_DISTANCE },
  SOUTH: { longitude: 180, latitude: 0, distance: CAMERA_DISTANCE },
  WEST: { longitude: 270, latitude: 0, distance: CAMERA_DISTANCE }
};

// TV Interface Configuration
export const TV_CONFIG = {
  // Device detection
  DETECTION_WIDTH: 1920,
  
  // Layout and spacing
  SAFE_ZONE_PADDING: '5%',
  MENU_WIDTH: '320px',
  
  // Typography
  MIN_FONT_SIZE: '32px', // Following TV UX guidelines for 10-foot viewing
  FONT_SCALE_FACTOR: 1.5, // 50% larger fonts for TV
  LINE_HEIGHT_FACTOR: 1.2, // Increased line height for readability
  
  // Button dimensions
  BUTTON_MIN_HEIGHT: '48px',
  BUTTON_MIN_WIDTH: '200px',
  
  // Focus state styling
  FOCUS_BORDER_WIDTH: '3px',
  FOCUS_BORDER_COLOR: '#4A90E2',
  FOCUS_BORDER_RADIUS: '8px',
  FOCUS_SHADOW: '0 0 0 3px rgba(74, 144, 226, 0.3)',
  FOCUS_SCALE: 1.05,
  FOCUS_TRANSITION: 'all 150ms ease-in-out',
  
  // Animation durations
  ANIMATION_DURATION: 300,
  SLIDE_IN_DURATION: 300,
  SLIDE_OUT_DURATION: 300,
  FADE_DURATION: 200,
  SCALE_DURATION: 150,
  
  // Animation easing functions
  EASING_SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASING_BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // High contrast colors for TV visibility
  HIGH_CONTRAST_TEXT: '#ffffff',
  HIGH_CONTRAST_BACKGROUND: '#000000',
  HIGH_CONTRAST_BORDER: '#ffffff',
  HIGH_CONTRAST_ACCENT: '#4A90E2',
  
  // Safe zone measurements
  SAFE_ZONE_TOP: '5vh',
  SAFE_ZONE_BOTTOM: '5vh',
  SAFE_ZONE_LEFT: '5vw',
  SAFE_ZONE_RIGHT: '5vw',
} as const;
