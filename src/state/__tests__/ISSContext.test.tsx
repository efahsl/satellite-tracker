import React from 'react';
import { render, act } from '@testing-library/react';
import { ISSProvider, useISS } from '../ISSContext';

// Test component to access the context
const TestComponent = () => {
  const { state, dispatch } = useISS();
  
  return (
    <div>
      <div data-testid="followISS">{state.followISS.toString()}</div>
      <div data-testid="earthRotateMode">{state.earthRotateMode.toString()}</div>
      <button 
        data-testid="toggle-follow" 
        onClick={() => dispatch({ type: 'TOGGLE_FOLLOW_ISS' })}
      >
        Toggle Follow ISS
      </button>
      <button 
        data-testid="toggle-earth-rotate" 
        onClick={() => dispatch({ type: 'TOGGLE_EARTH_ROTATE' })}
      >
        Toggle Earth Rotate
      </button>
    </div>
  );
};

describe('ISSContext Earth Rotate Mode', () => {
  it('should have correct initial state', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    expect(getByTestId('followISS')).toHaveTextContent('true');
    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');
  });

  it('should toggle earth rotate mode', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');
  });

  it('should ensure mutual exclusivity - earth rotate disables follow ISS', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    // Initially followISS is true, earthRotateMode is false
    expect(getByTestId('followISS')).toHaveTextContent('true');
    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');

    // Toggle earth rotate mode
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    // Earth rotate should be true, follow ISS should be false
    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');
  });

  it('should ensure mutual exclusivity - follow ISS disables earth rotate', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    // First enable earth rotate mode
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');

    // Then toggle follow ISS
    act(() => {
      getByTestId('toggle-follow').click();
    });

    // Follow ISS should be true, earth rotate should be false
    expect(getByTestId('followISS')).toHaveTextContent('true');
    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');
  });

  it('should toggle earth rotate mode off when clicked again', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    // Toggle earth rotate on
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');

    // Toggle earth rotate off
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');
    // followISS should remain false since it was disabled when earth rotate was enabled
    expect(getByTestId('followISS')).toHaveTextContent('false');
  });

  it('should handle multiple rapid toggles correctly', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    // Rapid toggles of earth rotate mode
    act(() => {
      getByTestId('toggle-earth-rotate').click();
      getByTestId('toggle-earth-rotate').click();
      getByTestId('toggle-earth-rotate').click();
    });

    // Should end up with earth rotate on, follow ISS off
    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');
  });

  it('should handle alternating mode switches correctly', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    // Start with follow ISS active
    expect(getByTestId('followISS')).toHaveTextContent('true');
    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');

    // Switch to earth rotate
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });
    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');

    // Switch back to follow ISS
    act(() => {
      getByTestId('toggle-follow').click();
    });
    expect(getByTestId('followISS')).toHaveTextContent('true');
    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');

    // Switch to earth rotate again
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });
    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');
  });

  it('should maintain state consistency when both modes are disabled', () => {
    const { getByTestId } = render(
      <ISSProvider>
        <TestComponent />
      </ISSProvider>
    );

    // Disable follow ISS (initially true)
    act(() => {
      getByTestId('toggle-follow').click();
    });

    // Both should be false now
    expect(getByTestId('followISS')).toHaveTextContent('false');
    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');

    // Enable earth rotate
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');

    // Disable earth rotate
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    // Both should be false again
    expect(getByTestId('followISS')).toHaveTextContent('false');
    expect(getByTestId('earthRotateMode')).toHaveTextContent('false');
  });

  it('should preserve other state properties when toggling modes', () => {
    const TestComponentWithAllState = () => {
      const { state, dispatch } = useISS();
      
      return (
        <div>
          <div data-testid="followISS">{state.followISS.toString()}</div>
          <div data-testid="earthRotateMode">{state.earthRotateMode.toString()}</div>
          <div data-testid="loading">{state.loading.toString()}</div>
          <div data-testid="error">{state.error || 'null'}</div>
          <div data-testid="crew-count">{state.crew.length}</div>
          <button 
            data-testid="toggle-earth-rotate" 
            onClick={() => dispatch({ type: 'TOGGLE_EARTH_ROTATE' })}
          >
            Toggle Earth Rotate
          </button>
        </div>
      );
    };

    const { getByTestId } = render(
      <ISSProvider>
        <TestComponentWithAllState />
      </ISSProvider>
    );

    // Verify initial state (loading may be true initially due to data fetching)
    const initialLoading = getByTestId('loading').textContent;
    expect(getByTestId('error')).toHaveTextContent('null');
    expect(getByTestId('crew-count')).toHaveTextContent('0');

    // Toggle earth rotate mode
    act(() => {
      getByTestId('toggle-earth-rotate').click();
    });

    // Camera modes should change, but other state should remain unchanged
    expect(getByTestId('earthRotateMode')).toHaveTextContent('true');
    expect(getByTestId('followISS')).toHaveTextContent('false');
    expect(getByTestId('loading')).toHaveTextContent(initialLoading || 'false');
    expect(getByTestId('error')).toHaveTextContent('null');
    expect(getByTestId('crew-count')).toHaveTextContent('0');
  });
});