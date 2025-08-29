import React, { memo, useMemo } from 'react';
import { useISS } from '../../state/ISSContext';
import { useDevice } from '../../state/DeviceContext';

const Altitude: React.FC = memo(() => {
  const { state } = useISS();
  const { isTVProfile } = useDevice();
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
      <div className={`backdrop-blur-sm rounded-lg ${isTVProfile ? 'p-5 mb-5' : 'p-3 mb-3'} ${isTVProfile ? 'tv-typography' : ''}`}>
        <h3 className={`${isTVProfile ? 'text-lg' : 'text-sm'} font-semibold mb-1 mt-1`}>Altitude & Velocity</h3>
        <p className={`text-gray-300 ${isTVProfile ? 'text-base' : 'text-xs'}`}>Loading data...</p>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-sm rounded-lg ${isTVProfile ? 'p-5 mb-5' : 'p-3 mb-3'} ${isTVProfile ? 'tv-typography' : ''}`}>
      <h3 className={`${isTVProfile ? 'text-lg' : 'text-sm'} font-semibold mb-1 mt-1`}>Altitude & Velocity</h3>
      <div className={`grid grid-cols-2 ${isTVProfile ? 'gap-4' : 'gap-2'}`}>
        <div>
          <p className={`text-gray-300 ${isTVProfile ? 'text-base' : 'text-xs'}`}>Altitude</p>
          <p className={`text-iss-white font-mono ${isTVProfile ? 'text-lg' : 'text-sm'}`}>
            {formattedData?.altitude.km} <span className={isTVProfile ? 'text-base' : 'text-xs'}>km</span>
          </p>
          <p className={`text-gray-400 ${isTVProfile ? 'text-sm' : 'text-xs'} imperial-unit`}>
            {formattedData?.altitude.miles} miles
          </p>
        </div>
        <div>
          <p className={`text-gray-300 ${isTVProfile ? 'text-base' : 'text-xs'}`}>Velocity</p>
          <p className={`text-iss-white font-mono ${isTVProfile ? 'text-lg' : 'text-sm'}`}>
            {formattedData?.velocity.kmh} <span className={isTVProfile ? 'text-base' : 'text-xs'}>km/h</span>
          </p>
          <p className={`text-gray-400 ${isTVProfile ? 'text-sm' : 'text-xs'} imperial-unit`}>
            {formattedData?.velocity.mph} mph
          </p>
        </div>
      </div>
      
      {/* Orbit time calculation */}
      <div className={`${isTVProfile ? 'mt-4 pt-4' : 'mt-2 pt-2'} border-t border-gray-700 orbital-period`}>
        <p className={`text-gray-300 ${isTVProfile ? 'text-base' : 'text-xs'}`}>Orbital Period</p>
        <p className={`text-iss-white ${isTVProfile ? 'text-sm' : 'text-xs'}`}>
          {/* ISS orbits Earth approximately every 90 minutes */}
          ~90 minutes per orbit
        </p>
      </div>
    </div>
  );
});

export default Altitude;
