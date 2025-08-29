import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';

// Define device types
export enum DeviceType {
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  TV = 'tv'
}

// Define device state interface
export interface DeviceState {
  deviceType: DeviceType;
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
  orientation?: 'portrait' | 'landscape';
}

// Define action types
type DeviceAction =
  | { type: 'SET_DEVICE_TYPE'; payload: DeviceType }
  | { type: 'UPDATE_SCREEN_SIZE'; payload: { width: number; height: number } }
  | { type: 'SET_TOUCH_DEVICE'; payload: boolean }
  | { type: 'SET_ORIENTATION'; payload: 'portrait' | 'landscape' }
  | { type: 'INITIALIZE_DEVICE'; payload: Partial<DeviceState> };

// Define context type
interface DeviceContextType {
  state: DeviceState;
  dispatch: React.Dispatch<DeviceAction>;
  // Computed properties for convenience
  isMobile: boolean;
  isDesktop: boolean;
  isTV: boolean;
  isTVProfile: boolean;
}

// Initial state
const initialState: DeviceState = {
  deviceType: DeviceType.DESKTOP,
  screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
  screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
  isTouchDevice: false,
  orientation: 'landscape'
};

// Device detection utility functions - memoized for performance
const detectTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
};

// Memoized device type detection to avoid recalculation
const detectDeviceType = (width: number, height: number, isTouchDevice: boolean): DeviceType => {
  // Mobile: Screen width < 768px (Bootstrap's md breakpoint) OR touch device with width < 1200px
  if (width < 768 || (isTouchDevice && width < 1200)) {
    return DeviceType.MOBILE;
  }
  
  // TV: Screen width >= 1920px (general TV detection for existing functionality)
  if (width >= 1920 && height >= 1080) {
    return DeviceType.TV;
  }
  
  // Desktop: Default case
  return DeviceType.DESKTOP;
};

// TV Profile detection - specifically for exactly 1920px width
const detectTVProfile = (width: number): boolean => {
  return width === 1920;
};

const detectOrientation = (width: number, height: number): 'portrait' | 'landscape' => {
  return width > height ? 'landscape' : 'portrait';
};

// Reducer function
const deviceReducer = (state: DeviceState, action: DeviceAction): DeviceState => {
  switch (action.type) {
    case 'SET_DEVICE_TYPE':
      return {
        ...state,
        deviceType: action.payload,
      };
    case 'UPDATE_SCREEN_SIZE': {
      const { width, height } = action.payload;
      const newDeviceType = detectDeviceType(width, height, state.isTouchDevice);
      const newOrientation = detectOrientation(width, height);
      
      return {
        ...state,
        screenWidth: width,
        screenHeight: height,
        deviceType: newDeviceType,
        orientation: newOrientation,
      };
    }
    case 'SET_TOUCH_DEVICE': {
      const newDeviceType = detectDeviceType(state.screenWidth, state.screenHeight, action.payload);
      
      return {
        ...state,
        isTouchDevice: action.payload,
        deviceType: newDeviceType,
      };
    }
    case 'SET_ORIENTATION':
      return {
        ...state,
        orientation: action.payload,
      };
    case 'INITIALIZE_DEVICE': {
      const newState = { ...state, ...action.payload };
      const deviceType = detectDeviceType(
        newState.screenWidth,
        newState.screenHeight,
        newState.isTouchDevice
      );
      const orientation = detectOrientation(newState.screenWidth, newState.screenHeight);
      
      return {
        ...newState,
        deviceType,
        orientation,
      };
    }
    default:
      return state;
  }
};

// Create context
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Provider component with optimized performance
export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(deviceReducer, initialState);

  // Initialize device detection - memoized to prevent recreation
  const initializeDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = detectTouchDevice();
    const deviceType = detectDeviceType(width, height, isTouchDevice);
    const isTVProfile = detectTVProfile(width);

    console.log('🖥️ DeviceContext: Initializing device detection', {
      dimensions: `${width}x${height}`,
      deviceType,
      isTouchDevice,
      isTVProfile,
      orientation: detectOrientation(width, height)
    });

    dispatch({
      type: 'INITIALIZE_DEVICE',
      payload: {
        screenWidth: width,
        screenHeight: height,
        isTouchDevice,
      },
    });
  }, []);

  // Handle window resize with debouncing - optimized for performance
  const handleResize = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = detectDeviceType(width, height, state.isTouchDevice);
    const isTVProfile = detectTVProfile(width);

    // console.log('📏 DeviceContext: Screen size changed', {
    //   dimensions: `${width}x${height}`,
    //   deviceType,
    //   isTVProfile,
    //   orientation: detectOrientation(width, height)
    // });

    dispatch({
      type: 'UPDATE_SCREEN_SIZE',
      payload: {
        width,
        height,
      },
    });
  }, [state.isTouchDevice]);

  // Handle orientation change - optimized with proper cleanup
  const handleOrientationChange = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Use setTimeout to ensure screen dimensions are updated after orientation change
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_SCREEN_SIZE',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    }, 100);
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Initialize device detection on mount
    initializeDevice();

    // Add resize listener with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    // Add event listeners
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup function
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [initializeDevice, handleResize, handleOrientationChange]);

  // Memoize computed properties
  const isMobile = useMemo(() => state.deviceType === DeviceType.MOBILE, [state.deviceType]);
  const isDesktop = useMemo(() => state.deviceType === DeviceType.DESKTOP, [state.deviceType]);
  const isTV = useMemo(() => state.deviceType === DeviceType.TV, [state.deviceType]);
  const isTVProfile = useMemo(() => {
    const tvProfile = detectTVProfile(state.screenWidth);
    return tvProfile;
  }, [state.screenWidth]);

  // Log device profile changes
  useEffect(() => {
    console.log('📱 DeviceContext: Current device profile', {
      dimensions: `${state.screenWidth}x${state.screenHeight}`,
      deviceType: state.deviceType,
      isMobile,
      isDesktop,
      isTV,
      isTVProfile,
      isTouchDevice: state.isTouchDevice,
      orientation: state.orientation
    });
  }, [state.deviceType, state.screenWidth, state.screenHeight, isMobile, isDesktop, isTV, isTVProfile, state.isTouchDevice, state.orientation]);

  // Log current device profile whenever it changes
  useEffect(() => {
    if (state.screenWidth > 0) { // Only log if we have valid dimensions (not initial state)
      const currentProfile = isTVProfile ? 'TV Profile' : 
                           isMobile ? 'Mobile' : 
                           isDesktop ? 'Desktop' : 
                           isTV ? 'TV (General)' : 'Unknown';
      
      console.log(`📱 Device Profile: ${currentProfile}`, {
        screenWidth: state.screenWidth,
        screenHeight: state.screenHeight,
        deviceType: state.deviceType,
        isTVProfile
      });
    }
  }, [state.screenWidth, state.screenHeight, state.deviceType, isTVProfile, isMobile, isDesktop, isTV]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    isMobile,
    isDesktop,
    isTV,
    isTVProfile,
  }), [state, dispatch, isMobile, isDesktop, isTV, isTVProfile]);

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
};

// Custom hook for using the device context
export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};