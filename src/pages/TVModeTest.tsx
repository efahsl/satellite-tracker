import React from 'react';
import { useDevice } from '../state/DeviceContext';
import { useUI } from '../state/UIContext';
import { ISSFollowControls } from '../components/Controls/ISSFollowControls';

const TVModeTest: React.FC = () => {
  const { state, isTVProfile } = useDevice();
  const { state: uiState, setHamburgerMenuVisible } = useUI();

  const forceTV = () => {
    // Temporarily override window dimensions for testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
    window.dispatchEvent(new Event('resize'));
  };

  const resetDimensions = () => {
    // Reset to actual window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: window.outerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: window.outerHeight,
    });
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">TV Mode Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Device Information</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Screen Width: {state.screenWidth}px</div>
            <div>Screen Height: {state.screenHeight}px</div>
            <div>Device Type: {state.deviceType}</div>
            <div>TV Profile: {isTVProfile ? '✅ Active' : '❌ Inactive'}</div>
            <div>Touch Device: {state.isTouchDevice ? 'Yes' : 'No'}</div>
            <div>Orientation: {state.orientation}</div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">UI State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Menu Visible: {uiState.hamburgerMenuVisible ? '✅ Yes' : '❌ No'}</div>
            <div>Menu Focus Index: {uiState.hamburgerMenuFocusIndex}</div>
            <div>Last Active Button: {uiState.lastActiveButtonIndex} (0=Follow ISS, 1=Earth Rotate, 2=Manual)</div>
            <div className="text-yellow-400">Focus State: Visual and internal focus should match</div>
            <div>TV Camera Controls: {uiState.tvCameraControlsVisible ? '✅ Visible' : '❌ Hidden'}</div>
            <div>Zoom Mode: {uiState.zoomMode}</div>
            <div>Is Zooming: {uiState.isZooming ? '✅ Yes' : '❌ No'}</div>
            <div>FPS Monitor: {uiState.fpsMonitorVisible ? 'Visible' : 'Hidden'}</div>
            <div>Info Panel: {uiState.infoPanelVisible ? 'Visible' : 'Hidden'}</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="space-x-4">
          <button
            onClick={forceTV}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Force TV Mode (1920x1080)
          </button>
          <button
            onClick={resetDimensions}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Reset to Actual Size
          </button>
          <button
            onClick={() => setHamburgerMenuVisible(true)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Show Menu
          </button>
          <button
            onClick={() => setHamburgerMenuVisible(false)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Hide Menu
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">ISS Follow Controls Test</h2>
        <p className="mb-4 text-gray-300">
          {isTVProfile 
            ? "TV Profile is active. Clicking 'Manual' should close the hamburger menu."
            : "TV Profile is not active. Clicking 'Manual' will not affect the menu."
          }
        </p>
        <ISSFollowControls />
      </div>

      <div className="mt-8 p-4 bg-yellow-900 rounded">
        <h3 className="text-lg font-semibold mb-2">Instructions for Testing Focus Management</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Force TV Mode" to simulate a 1920px wide screen</li>
          <li>Verify that "TV Profile" shows as "✅ Active"</li>
          <li>Verify that "Menu Visible" shows as "✅ Yes"</li>
          <li>Click the "Manual" button in the ISS Follow Controls</li>
          <li>Verify that "Last Active Button" changes to "2" (Manual button)</li>
          <li>Verify that "Menu Visible" changes to "❌ No"</li>
          <li>Press Esc/Back key to reopen the menu</li>
          <li>Verify that the "Manual" button is focused (should have focus ring)</li>
          <li><strong>Test Boundary Behavior:</strong> Press Up arrow - focus should NOT wrap to bottom</li>
          <li><strong>Test Boundary Behavior:</strong> Navigate to first item and press Up - should stay at first</li>
          <li><strong>Test Boundary Behavior:</strong> Navigate to last item and press Down - should stay at last</li>
          <li>Check that TV Camera Controls coordinate properly with menu state</li>
        </ol>
      </div>
    </div>
  );
};

export default TVModeTest;