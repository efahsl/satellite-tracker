import React, { memo, useCallback, useMemo } from 'react';
import { useISS } from '../../state/ISSContext';

const Coordinates: React.FC = memo(() => {
  const { state } = useISS();
  const { position } = state;

  // Memoize the formatCoordinate function
  const formatCoordinate = useCallback((value: number, type: 'lat' | 'long'): string => {
    const direction = type === 'lat' 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    
    const absValue = Math.abs(value);
    return `${absValue.toFixed(4)}° ${direction}`;
  }, []);

  // Memoize formatted coordinates to prevent unnecessary recalculations
  const formattedCoordinates = useMemo(() => {
    if (!position) return null;
    
    return {
      latitude: formatCoordinate(position.latitude, 'lat'),
      longitude: formatCoordinate(position.longitude, 'long'),
    };
  }, [position?.latitude, position?.longitude, formatCoordinate]);

  if (!position) {
    return (
      <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-3 mb-3">
        <h3 className="text-sm font-semibold mb-1">Current Position</h3>
        <p className="text-gray-300 text-xs">Loading position data...</p>
      </div>
    );
  }

  return (
    <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-3 mb-3">
      <h3 className="text-sm font-semibold mb-1">Current Position</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-gray-300 text-xs">Latitude</p>
          <p className="text-iss-white font-mono text-sm">
            {formattedCoordinates?.latitude}
          </p>
        </div>
        <div>
          <p className="text-gray-300 text-xs">Longitude</p>
          <p className="text-iss-white font-mono text-sm">
            {formattedCoordinates?.longitude}
          </p>
        </div>
      </div>
    </div>
  );
});

export default Coordinates;
