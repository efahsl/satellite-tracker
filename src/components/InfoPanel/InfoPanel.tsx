import React, { memo, useCallback, useMemo } from 'react';
import { useISS } from '../../state/ISSContext';
import Coordinates from './Coordinates';
import Altitude from './Altitude';
// import Crew from './Crew';

interface InfoPanelProps {
  className?: string;
}

const InfoPanel: React.FC<InfoPanelProps> = memo(({ className = '' }) => {
  const { state, dispatch } = useISS();

  const handleToggleFollow = useCallback(() => {
    dispatch({ type: 'TOGGLE_FOLLOW_ISS' });
  }, [dispatch]);

  // Memoize the formatted timestamp to prevent unnecessary recalculations
  const formattedTimestamp = useMemo(() => {
    return state.position
      ? new Date(state.position.timestamp * 1000).toLocaleTimeString()
      : 'Loading...';
  }, [state.position?.timestamp]);

  return (
    <div className={`p-4 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-iss-white mb-1">
          ISS Live Tracker
        </h2>
        <p className="text-gray-300">
          Real-time tracking of the International Space Station
        </p>
      </div>

      {/* Toggle follow ISS button */}
      <div className="mb-6">
        <button
          onClick={handleToggleFollow}
          className={`px-4 py-2 rounded-md transition-colors ${
            state.followISS
              ? 'bg-iss-highlight text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {state.followISS ? 'Following ISS' : 'Follow ISS'}
        </button>
        <p className="text-xs text-gray-400 mt-1">
          {state.followISS
            ? 'Camera is automatically tracking the ISS'
            : 'Click to make camera follow the ISS'}
        </p>
      </div>

      {/* Information panels */}
      <Coordinates />
      <Altitude />
      {/* <Crew /> */}

      {/* Last updated timestamp */}
      <div className="text-gray-400 text-xs mt-4">
        Last updated: {formattedTimestamp}
      </div>

      {/* Attribution */}
      <div className="text-gray-500 text-xs mt-6">
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
