import React from 'react';
import Globe from '../components/Globe/Globe';
import InfoPanel from '../components/InfoPanel/InfoPanel';
import { PerformanceMonitor } from '../components/Controls/PerformanceMonitor';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-space-black">
      {/* Globe container - takes full height on mobile, 100% width and height on desktop */}
      <div className="h-screen md:h-full md:flex-grow relative">
        <Globe width="100%" height="100%" />
        
        {/* Performance Monitor - positioned in top-left corner for testing */}
        <div className="absolute top-4 left-4 z-10">
          <PerformanceMonitor />
        </div>
      </div>
      
      {/* Info panel - hidden on mobile, visible on md screens and above */}
      <div className="hide-on-mobile md:h-full md:w-[350px] md:min-w-[350px] overflow-y-auto bg-space-black border-t md:border-t-0 md:border-l border-gray-800">
        <InfoPanel />
      </div>
    </div>
  );
};

export default Home;
