import React, { memo, useMemo } from "react";
import { useISS } from "../../state/ISSContext";
import { useDevice } from "../../state/DeviceContext";
import Coordinates from "./Coordinates";
import Altitude from "./Altitude";
// import Crew from './Crew';

interface InfoPanelProps {
  className?: string;
}

const InfoPanel: React.FC<InfoPanelProps> = memo(({ className = "" }) => {
  const { state } = useISS();
  const { isTVProfile } = useDevice();

  // Memoize the formatted timestamp to prevent unnecessary recalculations
  const formattedTimestamp = useMemo(() => {
    return state.position
      ? new Date(state.position.timestamp * 1000).toLocaleTimeString()
      : "Loading...";
  }, [state.position?.timestamp]);

  return (
    <div className={`${isTVProfile ? 'p-6 tv-typography' : 'p-4'} hidden md:block ${className}`}>
      <div className={isTVProfile ? 'mb-8' : 'mb-6'}>
        <h2
          className={`${isTVProfile ? 'text-4xl' : 'text-xl'} font-bold text-iss-white mb-1`}
          style={{ 
            fontFamily: "'Orbitron', sans-serif", 
            letterSpacing: "1px",
            fontSize: isTVProfile ? 'calc(1.5rem * 1.5)' : undefined
          }}
        >
          ISS Live Tracker
        </h2>
        <p className={`text-gray-300 ${isTVProfile ? 'text-lg' : ''}`}>
          Real-time tracking of the International Space Station
        </p>
      </div>

      {/* Information panels */}
      <Coordinates />
      <Altitude />
      {/* <Crew /> */}

      {/* Last updated timestamp */}
      <div className={`text-gray-400 ${isTVProfile ? 'text-base mt-6' : 'text-xs mt-4'}`}>
        Last updated: {formattedTimestamp}
      </div>

      {/* Attribution */}
      <div className={`text-gray-500 ${isTVProfile ? 'text-sm mt-8' : 'text-xs mt-6'}`}>
        <p>Data provided by:</p>
        <ul className="list-disc list-inside">
          <li>wheretheiss.at API</li>
          <li>Open Notify API</li>
        </ul>
      </div>
    </div>
  );
});

export default InfoPanel;
