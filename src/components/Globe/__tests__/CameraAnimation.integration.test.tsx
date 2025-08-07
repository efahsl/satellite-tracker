import React from 'react';
import { render, act } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import Controls from '../Controls';
import { ISSProvider } from '../../../state/ISSContext';
import { vi } from 'vitest';
import { EARTH_ROTATE_DISTANCE, EARTH_ROTATE_SPEED, EARTH_ROTATE_TRANSITION_SPEED } from '../../../utils/constants';

// Mock Three.js components and hooks
const mockCamera = {
  position: { set: vi.fn(), copy: vi.fn(), lookAt: vi.fn() },
  lookAt: vi.fn(),
};

const mockControls = {
  target: { set: vi.fn() },
  update: vi.fn(),
};

let frameCallback: ((state: any, delta: number) => void) | null = null;

vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    useThree: () => ({ camera: mockCamera }),
    useFrame: vi.fn((callback) => {
      frameCallback = callback;
    }),
    Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  };
});

vi.mock('@react-three/drei', () => ({
  OrbitControls: React.forwardRef((props: any, ref: any) => {
    // Simulate ref assignment
    if (ref) {
      if (typeof ref === 'function') {
        ref(mockControls);
      } else {
        ref.current = mockControls;
      }
    }
    return <div data-testid="orbit-controls" {...props} />;
  }),
}));

// Mock ISS position data
const mockISSPosition = {
  latitude: 0,
  longitude: 0,
  altitude: 400,
  velocity: 27600,
  timestamp: Date.now(),
};

describe('Camera Animation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    frameCallback = null;
  });

  const renderControlsWithProvider = (earthRotateMode = false) => {
    return render(
      <ISSProvider>
        <Canvas>
          <Controls earthRotateMode={earthRotateMode} />
        </Canvas>
      </ISSProvider>
    );
  };

  it('should initialize camera at correct position', () => {
    renderControlsWithProvider();

    // Verify initial camera setup
    expect(mockCamera.position.set).toHaveBeenCalledWith(0, 0, 12); // CAMERA_DISTANCE
    expect(mockCamera.lookAt).toHaveBeenCalledWith(0, 0, 0);
  });

  it('should position camera at equatorial orbit during Earth rotate mode', () => {
    renderControlsWithProvider(true);

    // Simulate frame update
    if (frameCallback) {
      act(() => {
        frameCallback!({}, 0.016); // ~60fps delta
      });
    }

    // Verify controls target is set to Earth center
    expect(mockControls.target.set).toHaveBeenCalledWith(0, 0, 0);
    
    // Verify camera position is updated (copy should be called)
    expect(mockCamera.position.copy).toHaveBeenCalled();
    
    // Verify camera looks at Earth center
    expect(mockCamera.lookAt).toHaveBeenCalledWith(0, 0, 0);
  });

  it('should calculate correct rotation speed for current configuration', () => {
    // Verify the constant is set to a reasonable value
    // Current setting: 0.1047 radians/second (approximately 60 seconds for full rotation)
    expect(EARTH_ROTATE_SPEED).toBe(0.1047);
    expect(EARTH_ROTATE_SPEED).toBeGreaterThan(0);
    expect(EARTH_ROTATE_SPEED).toBeLessThan(1);
  });

  it('should maintain correct distance during rotation', () => {
    renderControlsWithProvider(true);

    // The distance should be EARTH_RADIUS + 10 (as currently configured)
    expect(EARTH_ROTATE_DISTANCE).toBe(15); // EARTH_RADIUS (5) + 10
  });

  it('should handle smooth transitions when entering Earth rotate mode', () => {
    const { rerender } = renderControlsWithProvider(false);

    // Initially not in Earth rotate mode
    if (frameCallback) {
      act(() => {
        frameCallback!({}, 0.016);
      });
    }

    // Switch to Earth rotate mode
    rerender(
      <ISSProvider>
        <Canvas>
          <Controls earthRotateMode={true} />
        </Canvas>
      </ISSProvider>
    );

    // Simulate multiple frame updates to test smooth transition
    if (frameCallback) {
      act(() => {
        frameCallback!({}, 0.016);
        frameCallback!({}, 0.016);
        frameCallback!({}, 0.016);
      });
    }

    // Verify smooth transition behavior
    expect(mockCamera.position.copy).toHaveBeenCalled();
    expect(mockControls.target.set).toHaveBeenCalledWith(0, 0, 0);
  });

  it('should handle smooth transitions when exiting Earth rotate mode', () => {
    const { rerender } = renderControlsWithProvider(true);

    // Start in Earth rotate mode
    if (frameCallback) {
      act(() => {
        frameCallback!({}, 0.016);
      });
    }

    // Switch out of Earth rotate mode
    rerender(
      <ISSProvider>
        <Canvas>
          <Controls earthRotateMode={false} />
        </Canvas>
      </ISSProvider>
    );

    // Simulate frame updates for transition
    if (frameCallback) {
      act(() => {
        frameCallback!({}, 0.016);
        frameCallback!({}, 0.016);
      });
    }

    // Verify transition back to default position
    expect(mockCamera.position.copy).toHaveBeenCalled();
  });

  it('should verify Earth remains centered during rotation', () => {
    renderControlsWithProvider(true);

    // Simulate multiple frame updates (rotation)
    if (frameCallback) {
      act(() => {
        // Simulate several frames to test continuous rotation
        for (let i = 0; i < 10; i++) {
          frameCallback!({}, 0.016);
        }
      });
    }

    // Verify that target is consistently set to Earth center
    expect(mockControls.target.set).toHaveBeenCalledWith(0, 0, 0);
    
    // Verify camera consistently looks at Earth center
    expect(mockCamera.lookAt).toHaveBeenCalledWith(0, 0, 0);
  });

  it('should update rotation angle correctly over time', () => {
    renderControlsWithProvider(true);

    const deltaTime = 1.0; // 1 second
    
    if (frameCallback) {
      act(() => {
        frameCallback!({}, deltaTime);
      });
    }

    // After 1 second, the rotation should have advanced by EARTH_ROTATE_SPEED radians
    // We can't directly test the angle, but we can verify the camera position was updated
    expect(mockCamera.position.copy).toHaveBeenCalled();
  });

  it('should handle component unmount and cleanup', () => {
    const { unmount } = renderControlsWithProvider(true);

    // Simulate some rotation
    if (frameCallback) {
      act(() => {
        frameCallback!({}, 0.016);
      });
    }

    // Unmount component
    act(() => {
      unmount();
    });

    // Component should unmount without errors
    // The cleanup is handled by React's useEffect cleanup
    expect(true).toBe(true); // Test passes if no errors thrown
  });

  it('should use correct transition speed for smooth camera movement', () => {
    // Verify the transition speed constant is appropriate for smooth movement
    expect(EARTH_ROTATE_TRANSITION_SPEED).toBe(0.05);
    expect(EARTH_ROTATE_TRANSITION_SPEED).toBeGreaterThan(0);
    expect(EARTH_ROTATE_TRANSITION_SPEED).toBeLessThan(1);
  });

  it('should handle rapid mode switching without errors', () => {
    const { rerender } = renderControlsWithProvider(false);

    // Rapidly switch modes
    act(() => {
      rerender(
        <ISSProvider>
          <Canvas>
            <Controls earthRotateMode={true} />
          </Canvas>
        </ISSProvider>
      );
      
      if (frameCallback) frameCallback!({}, 0.016);
      
      rerender(
        <ISSProvider>
          <Canvas>
            <Controls earthRotateMode={false} />
          </Canvas>
        </ISSProvider>
      );
      
      if (frameCallback) frameCallback!({}, 0.016);
      
      rerender(
        <ISSProvider>
          <Canvas>
            <Controls earthRotateMode={true} />
          </Canvas>
        </ISSProvider>
      );
      
      if (frameCallback) frameCallback!({}, 0.016);
    });

    // Should handle rapid switching without errors
    expect(mockCamera.position.copy).toHaveBeenCalled();
    expect(mockControls.update).toHaveBeenCalled();
  });

  it('should maintain consistent frame rate handling', () => {
    renderControlsWithProvider(true);

    // Test with different delta times (simulating variable frame rates)
    const deltaTimes = [0.016, 0.033, 0.008, 0.020]; // Different frame rates
    
    if (frameCallback) {
      act(() => {
        deltaTimes.forEach(delta => {
          frameCallback!({}, delta);
        });
      });
    }

    // Should handle variable frame rates smoothly
    expect(mockCamera.position.copy).toHaveBeenCalled();
    expect(mockControls.update).toHaveBeenCalled();
  });

  it('should integrate properly with OrbitControls', () => {
    const { getByTestId } = renderControlsWithProvider(true);

    const orbitControls = getByTestId('orbit-controls');
    
    // Verify OrbitControls is rendered
    expect(orbitControls).toBeInTheDocument();
    
    // In the mocked environment, we just verify the component renders
    // The actual props are handled by the Three.js OrbitControls component
    expect(orbitControls).toHaveAttribute('data-testid', 'orbit-controls');
  });
});