import React, { memo } from 'react';
import { useISS } from '../../state/ISSContext';

const Crew: React.FC = memo(() => {
  const { state } = useISS();
  const { crew, error } = state;

  if (error) {
    return (
      <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Crew</h3>
        <p className="text-red-400">Error loading crew data</p>
      </div>
    );
  }

  if (!crew || crew.length === 0) {
    return (
      <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Crew</h3>
        <p className="text-gray-300">Loading crew data...</p>
      </div>
    );
  }

  return (
    <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Current Crew</h3>
      <p className="text-gray-300 mb-2">
        {crew.length} astronauts currently aboard the ISS
      </p>
      <ul className="space-y-2">
        {crew.map((person, index) => (
          <li key={index} className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-iss-highlight flex items-center justify-center mr-3">
              {person.name.charAt(0)}
            </div>
            <div>
              <p className="text-iss-white">{person.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default Crew;
