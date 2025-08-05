import React, { memo, useMemo } from 'react';
import { useISS } from '../../state/ISSContext';

const Altitude: React.FC = memo(() => {
  const { state } = useISS();
  const { position } = state;

  // Memoize formatted altitude and velocity data
  const formattedData = useMemo(() => {
    if (!position) return null;
    
    const { altitude, velocity } = position;
    
    return {
      altitude: {
        km: altitude.toFixed(2),
        miles: (altitude * 0.621371).toFixed(2),
      },
      velocity: {
        kmh: velocity.toFixed(2),
        mph: (velocity * 0.621371).toFixed(2),
      },
    };
  }, [position?.altitude, position?.velocity]);

  if (!position) {
    return (
      <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-3 mb-3">
        <h3 className="text-sm font-semibold mb-1">Altitude & Velocity</h3>
        <p className="text-gray-300 text-xs">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-3 mb-3">
      <h3 className="text-sm font-semibold mb-1">Altitude & Velocity</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-gray-300 text-xs">Altitude</p>
          <p className="text-iss-white font-mono text-sm">
            {formattedData?.altitude.km} <span className="text-xs">km</span>
          </p>
          <p className="text-gray-400 text-xs">
            {formattedData?.altitude.miles} miles
          </p>
        </div>
        <div>
          <p className="text-gray-300 text-xs">Velocity</p>
          <p className="text-iss-white font-mono text-sm">
            {formattedData?.velocity.kmh} <span className="text-xs">km/h</span>
          </p>
          <p className="text-gray-400 text-xs">
            {formattedData?.velocity.mph} mph
          </p>
        </div>
      </div>
      
      {/* Orbit time calculation */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <p className="text-gray-300 text-xs">Orbital Period</p>
        <p className="text-iss-white text-xs">
          {/* ISS orbits Earth approximately every 90 minutes */}
          ~90 minutes per orbit
        </p>
      </div>
    </div>
  );
});

export default Altitude;
