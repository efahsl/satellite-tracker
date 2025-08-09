import React from 'react';
import Globe from '../components/Globe/Globe';
import FloatingInfoPanel from '../components/UI/FloatingInfoPanel/FloatingInfoPanel';
import FPSMonitor from '../components/Globe/FPSMonitor';

const Home: React.FC = () => {
  return (
    <div 
      className="relative w-full h-screen bg-space-black overflow-hidden"
      style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        position: 'relative'
      }}
    >
      {/* Globe container - takes full screen */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minHeight: '100vh'
        }}
      >
        <Globe width="100%" height="100%" />
      </div>
      
      {/* FPS Monitor - positioned in top-right corner */}
      <FPSMonitor position="top-right" />

      {/* Floating Info Panel - positioned in bottom-right */}
      <div className="absolute bottom-0 right-0 z-10">
        <FloatingInfoPanel />
      </div>
    </div>
  );
};

export default Home;
