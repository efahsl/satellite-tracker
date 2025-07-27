/**
 * Converts latitude and longitude to 3D coordinates on a sphere
 * @param latitude Latitude in degrees
 * @param longitude Longitude in degrees
 * @param radius Radius of the sphere
 * @returns [x, y, z] coordinates
 */
export const latLongToVector3 = (
  latitude: number,
  longitude: number,
  radius: number
): [number, number, number] => {
  // Convert latitude and longitude from degrees to radians
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  // Calculate 3D coordinates
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
};

/**
 * Calculates the distance between two points on Earth
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Determines if a location on Earth is in daylight or night
 * @param latitude Latitude in degrees
 * @param longitude Longitude in degrees
 * @param date Date object (defaults to current time)
 * @returns Boolean indicating if the location is in daylight
 */
export const isInDaylight = (
  latitude: number,
  longitude: number,
  date: Date = new Date()
): boolean => {
  // Get the day of the year (0-365)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Calculate the declination angle
  const declination =
    23.45 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);

  // Convert to radians
  const lat = (latitude * Math.PI) / 180;
  const dec = (declination * Math.PI) / 180;

  // Calculate the hour angle
  const hourAngle =
    (date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      longitude / 15 -
      12) *
    15;
  const hourAngleRad = (hourAngle * Math.PI) / 180;

  // Calculate the solar elevation
  const elevation =
    Math.asin(
      Math.sin(lat) * Math.sin(dec) +
        Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngleRad)
    ) *
    (180 / Math.PI);

  // If elevation > 0, the sun is above the horizon
  return elevation > 0;
};
