import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';

// Types
interface UIState {
  fpsMonitorVisible: boolean;
  infoPanelVisible: boolean;
  hamburgerMenuVisible: boolean;
  hamburgerMenuFocusIndex: number;
  lastActiveButtonIndex: number; // Track the last active button for focus restoration
  tvCameraControlsVisible: boolean;
  zoomMode: 'in' | 'out';
  isZooming: boolean;
}

type UIAction = 
  | { type: 'TOGGLE_FPS_MONITOR' }
  | { type: 'TOGGLE_INFO_PANEL' }
  | { type: 'SET_FPS_MONITOR_VISIBLE'; payload: boolean }
  | { type: 'SET_INFO_PANEL_VISIBLE'; payload: boolean }
  | { type: 'SET_HAMBURGER_MENU_VISIBLE'; payload: boolean }
  | { type: 'SET_HAMBURGER_MENU_FOCUS'; payload: number }
  | { type: 'SET_LAST_ACTIVE_BUTTON'; payload: number }
  | { type: 'CLOSE_HAMBURGER_MENU_FOR_MANUAL' }
  | { type: 'SET_TV_CAMERA_CONTROLS_VISIBLE'; payload: boolean }
  | { type: 'SET_ZOOM_MODE'; payload: 'in' | 'out' }
  | { type: 'SET_ZOOMING'; payload: boolean };

interface UIContextType {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  toggleFPSMonitor: () => void;
  toggleInfoPanel: () => void;
  setFPSMonitorVisible: (visible: boolean) => void;
  setInfoPanelVisible: (visible: boolean) => void;
  setHamburgerMenuVisible: (visible: boolean) => void;
  setHamburgerMenuFocus: (index: number) => void;
  setLastActiveButton: (index: number) => void;
  closeHamburgerMenuForManual: () => void;
  setTVCameraControlsVisible: (visible: boolean) => void;
  setZoomMode: (mode: 'in' | 'out') => void;
  setZooming: (zooming: boolean) => void;
}

// Initial state
const initialState: UIState = {
  fpsMonitorVisible: true,
  infoPanelVisible: true,
  hamburgerMenuVisible: true, // Default to visible for TV mode
  hamburgerMenuFocusIndex: 0, // Start focus on first item
  lastActiveButtonIndex: 0, // Track last active button for focus restoration
  tvCameraControlsVisible: false, // Hidden by default, shown when conditions are met
  zoomMode: 'in', // Default to zoom in mode
  isZooming: false, // Not zooming by default
};

// Create context
const UIContext = createContext<UIContextType | undefined>(undefined);

// Reducer function
const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_FPS_MONITOR':
      return {
        ...state,
        fpsMonitorVisible: !state.fpsMonitorVisible,
      };
    case 'TOGGLE_INFO_PANEL':
      return {
        ...state,
        infoPanelVisible: !state.infoPanelVisible,
      };
    case 'SET_FPS_MONITOR_VISIBLE':
      return {
        ...state,
        fpsMonitorVisible: action.payload,
      };
    case 'SET_INFO_PANEL_VISIBLE':
      return {
        ...state,
        infoPanelVisible: action.payload,
      };
    case 'SET_HAMBURGER_MENU_VISIBLE':
      return {
        ...state,
        hamburgerMenuVisible: action.payload,
      };
    case 'SET_HAMBURGER_MENU_FOCUS':
      return {
        ...state,
        hamburgerMenuFocusIndex: action.payload,
      };
    case 'SET_LAST_ACTIVE_BUTTON':
      return {
        ...state,
        lastActiveButtonIndex: action.payload,
      };
    case 'CLOSE_HAMBURGER_MENU_FOR_MANUAL':
      return {
        ...state,
        hamburgerMenuVisible: false,
        hamburgerMenuFocusIndex: 0, // Reset focus when closing (for backward compatibility)
        // lastActiveButtonIndex is preserved for focus restoration
      };
    case 'SET_TV_CAMERA_CONTROLS_VISIBLE':
      return {
        ...state,
        tvCameraControlsVisible: action.payload,
      };
    case 'SET_ZOOM_MODE':
      return {
        ...state,
        zoomMode: action.payload,
      };
    case 'SET_ZOOMING':
      return {
        ...state,
        isZooming: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Memoized action creators
  const toggleFPSMonitor = useMemo(() => () => {
    dispatch({ type: 'TOGGLE_FPS_MONITOR' });
  }, []);

  const toggleInfoPanel = useMemo(() => () => {
    dispatch({ type: 'TOGGLE_INFO_PANEL' });
  }, []);

  const setFPSMonitorVisible = useMemo(() => (visible: boolean) => {
    dispatch({ type: 'SET_FPS_MONITOR_VISIBLE', payload: visible });
  }, []);

  const setInfoPanelVisible = useMemo(() => (visible: boolean) => {
    dispatch({ type: 'SET_INFO_PANEL_VISIBLE', payload: visible });
  }, []);

  const setHamburgerMenuVisible = useMemo(() => (visible: boolean) => {
    dispatch({ type: 'SET_HAMBURGER_MENU_VISIBLE', payload: visible });
  }, []);

  const setHamburgerMenuFocus = useMemo(() => (index: number) => {
    dispatch({ type: 'SET_HAMBURGER_MENU_FOCUS', payload: index });
  }, []);

  const setLastActiveButton = useMemo(() => (index: number) => {
    dispatch({ type: 'SET_LAST_ACTIVE_BUTTON', payload: index });
  }, []);

  const closeHamburgerMenuForManual = useMemo(() => () => {
    dispatch({ type: 'CLOSE_HAMBURGER_MENU_FOR_MANUAL' });
  }, []);

  const setTVCameraControlsVisible = useMemo(() => (visible: boolean) => {
    dispatch({ type: 'SET_TV_CAMERA_CONTROLS_VISIBLE', payload: visible });
  }, []);

  const setZoomMode = useMemo(() => (mode: 'in' | 'out') => {
    dispatch({ type: 'SET_ZOOM_MODE', payload: mode });
  }, []);

  const setZooming = useMemo(() => (zooming: boolean) => {
    dispatch({ type: 'SET_ZOOMING', payload: zooming });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    toggleFPSMonitor,
    toggleInfoPanel,
    setFPSMonitorVisible,
    setInfoPanelVisible,
    setHamburgerMenuVisible,
    setHamburgerMenuFocus,
    setLastActiveButton,
    closeHamburgerMenuForManual,
    setTVCameraControlsVisible,
    setZoomMode,
    setZooming,
  }), [state, toggleFPSMonitor, toggleInfoPanel, setFPSMonitorVisible, setInfoPanelVisible, setHamburgerMenuVisible, setHamburgerMenuFocus, setLastActiveButton, closeHamburgerMenuForManual, setTVCameraControlsVisible, setZoomMode, setZooming]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook for using the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
