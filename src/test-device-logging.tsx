import React from 'react';
import { createRoot } from 'react-dom/client';
import { DeviceProvider, useDevice } from './state/DeviceContext';

// Test component to demonstrate console logging
const DeviceLogTest: React.FC = () => {
  const { state, isMobile, isDesktop, isTV, isTVProfile } = useDevice();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Device Context Console Logging Test</h2>
      <p>Check the browser console for device profile logs!</p>
      
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
        <h3>Current Device Profile:</h3>
        <ul>
          <li><strong>Dimensions:</strong> {state.screenWidth}x{state.screenHeight}</li>
          <li><strong>Device Type:</strong> {state.deviceType}</li>
          <li><strong>Is Mobile:</strong> {isMobile.toString()}</li>
          <li><strong>Is Desktop:</strong> {isDesktop.toString()}</li>
          <li><strong>Is TV:</strong> {isTV.toString()}</li>
          <li><strong>Is TV Profile (1920px):</strong> {isTVProfile.toString()}</li>
          <li><strong>Touch Device:</strong> {state.isTouchDevice.toString()}</li>
          <li><strong>Orientation:</strong> {state.orientation}</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Go to the Console tab</li>
          <li>Resize the browser window to see device profile changes</li>
          <li>Try resizing to exactly 1920px width to see TV Profile activation</li>
        </ol>
      </div>
    </div>
  );
};

// Test app
const TestApp: React.FC = () => {
  return (
    <DeviceProvider>
      <DeviceLogTest />
    </DeviceProvider>
  );
};

// Mount the test app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
} else {
  console.error('Root container not found');
}