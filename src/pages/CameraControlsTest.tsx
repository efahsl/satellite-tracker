import React, { useEffect } from 'react';
import { useISS } from '../state/ISSContext';
import { useUI } from '../state/UIContext';
import { useDevice } from '../state/DeviceContext';

const CameraControlsTest: React.FC = () => {
  const { state: issState, dispatch } = useISS();
  const { state: uiState } = useUI();
  const { isTVProfile } = useDevice();

  // Force manual mode for testing
  useEffect(() => {
    dispatch({ type: 'SET_MANUAL_MODE' });
  }, [dispatch]);

  const isManualMode = !issState.followISS && !issState.earthRotateMode;

  return (
    <div style={{ padding: '2rem', color: 'white', background: '#000' }}>
      <h1>Camera Controls Test Page</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <h2>Debug Info:</h2>
        <p>TV Profile: {isTVProfile ? 'YES' : 'NO'}</p>
        <p>Follow ISS: {issState.followISS ? 'YES' : 'NO'}</p>
        <p>Earth Rotate: {issState.earthRotateMode ? 'YES' : 'NO'}</p>
        <p>Manual Mode: {isManualMode ? 'YES' : 'NO'}</p>
        <p>Should Show Camera Controls: {isTVProfile && isManualMode ? 'YES' : 'NO'}</p>
        <p>Zoom Mode: {uiState.isZoomingIn ? 'ZOOM IN' : 'ZOOM OUT'}</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h2>Controls:</h2>
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_FOLLOW_ISS' })}
          style={{ margin: '0.5rem', padding: '0.5rem' }}
        >
          Toggle Follow ISS
        </button>
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_EARTH_ROTATE' })}
          style={{ margin: '0.5rem', padding: '0.5rem' }}
        >
          Toggle Earth Rotate
        </button>
        <button 
          onClick={() => dispatch({ type: 'SET_MANUAL_MODE' })}
          style={{ margin: '0.5rem', padding: '0.5rem' }}
        >
          Set Manual Mode
        </button>
      </div>

      <div>
        <h2>Instructions:</h2>
        <p>1. Make sure window width is 1920px (TV mode)</p>
        <p>2. Ensure Manual Mode is active (should be automatic)</p>
        <p>3. Camera controls should appear on the left side</p>
        <p>4. Press arrow keys to test camera rotation</p>
        <p>5. Hold Enter key to test zoom</p>
      </div>
    </div>
  );
};

export default CameraControlsTest;