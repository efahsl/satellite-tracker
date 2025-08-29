// Quick test to verify TV camera constants are properly defined
const fs = require('fs');

// Read the constants file
const constantsFile = fs.readFileSync('src/utils/tvConstants.ts', 'utf8');

// Check that all required constants are present
const requiredConstants = [
  'TV_CAMERA_CONFIG',
  'TV_CAMERA_DIRECTIONS', 
  'TV_CAMERA_ZOOM_MODES',
  'TV_CAMERA_KEYS',
  'TV_CAMERA_CSS_CLASSES'
];

const requiredConfigProperties = [
  'ROTATION_SPEED',
  'ROTATION_ACCELERATION', 
  'MAX_ROTATION_SPEED',
  'MIN_ZOOM_DISTANCE',
  'MAX_ZOOM_DISTANCE',
  'ARROW_ACTIVE_SCALE',
  'ARROW_INACTIVE_OPACITY',
  'TRANSITION_DURATION',
  'CONTROLS_LEFT_OFFSET',
  'ARROW_SIZE',
  'ARROW_SPACING'
];

console.log('Checking TV Camera Constants...');

// Check main constants exist
requiredConstants.forEach(constant => {
  if (constantsFile.includes(`export const ${constant}`)) {
    console.log(`✓ ${constant} is defined`);
  } else {
    console.log(`✗ ${constant} is missing`);
  }
});

// Check config properties exist
requiredConfigProperties.forEach(prop => {
  if (constantsFile.includes(`${prop}:`)) {
    console.log(`✓ TV_CAMERA_CONFIG.${prop} is defined`);
  } else {
    console.log(`✗ TV_CAMERA_CONFIG.${prop} is missing`);
  }
});

console.log('\nConstants verification complete!');