import { Vector3 } from 'three';

/**
 * Calculate the sun's position in 3D space based on current time
 * Uses simplified astronomical calculations for real-time sun position
 */
export function calculateSunPosition(date: Date = new Date()): Vector3 {
  // Get day of year (1-365)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Solar declination angle (Earth's tilt effect)
  const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  const decRad = declination * Math.PI / 180;
  
  // Calculate the sun's subsolar point (where sun is directly overhead)
  // At UTC time, calculate which longitude the sun is over
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
  // The sun moves 15 degrees per hour westward
  // At UTC 12:00 (noon), sun is at 0° longitude (Greenwich)
  // At UTC 18:00 (6 PM), sun is at -90° longitude (US East Coast should be in daylight)
  // At UTC 00:00 (midnight), sun is at 180° longitude (International Date Line)
  const sunLongitude = -(utcHours - 12) * 15; // Negative for westward movement
  
  // Convert to radians
  const sunLongitudeRad = sunLongitude * Math.PI / 180;
  
  // Calculate sun position in Earth-centered coordinates
  // For Three.js coordinate system:
  // - X-axis points to 0° longitude (Greenwich meridian)  
  // - Y-axis points to North Pole
  // - Z-axis points to 90° longitude (towards Asia)
  
  const distance = 100; // Distance doesn't matter for directional lighting
  
  // Calculate the sun's position vector
  const x = distance * Math.cos(decRad) * Math.cos(sunLongitudeRad);
  const y = distance * Math.sin(decRad);
  const z = -distance * Math.cos(decRad) * Math.sin(sunLongitudeRad); // Negative Z for correct orientation
  
  return new Vector3(x, y, z);
}

/**
 * Calculate if a point on Earth is in daylight
 * @param latitude Latitude in degrees
 * @param longitude Longitude in degrees
 * @param sunPosition Sun position vector
 * @returns Value between 0 (night) and 1 (day)
 */
export function calculateDayNightFactor(
  latitude: number, 
  longitude: number, 
  sunPosition: Vector3
): number {
  // Convert lat/long to radians
  const latRad = latitude * Math.PI / 180;
  const lonRad = longitude * Math.PI / 180;
  
  // Calculate point on Earth surface
  const earthPoint = new Vector3(
    Math.cos(latRad) * Math.cos(lonRad),
    Math.sin(latRad),
    Math.cos(latRad) * Math.sin(lonRad)
  );
  
  // Calculate dot product with sun direction
  const sunDirection = sunPosition.clone().normalize();
  const dotProduct = earthPoint.dot(sunDirection);
  
  // Smooth transition around terminator line
  const smoothness = 0.1;
  return Math.max(0, Math.min(1, (dotProduct + smoothness) / (2 * smoothness)));
}

/**
 * Get current solar time for a given longitude
 */
export function getSolarTime(longitude: number, date: Date = new Date()): Date {
  const solarTime = new Date(date);
  const timeOffset = longitude * 4; // 4 minutes per degree
  solarTime.setMinutes(solarTime.getMinutes() + timeOffset);
  return solarTime;
}
