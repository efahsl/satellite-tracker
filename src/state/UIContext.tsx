import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';

// Types
interface UIState {
  fpsMonitorVisible: boolean;
  infoPanelVisible: boolean;
  hamburgerMenuVisible: boolean;
  hamburgerMenuFocusIndex: number;
  lastActiveButtonIndex: number; // Track the last active button for focus restoration
  tvCameraControlsVisible: boolean;
  isInZoomMode: boolean;
  activeZoomDirection: 'in' | 'out' | null;
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
  | { type: 'SET_ZOOM_MODE'; payload: boolean }
  | { type: 'SET_ACTIVE_ZOOM_DIRECTION'; payload: 'in' | 'out' | null };

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
  setZoomMode: (isInZoomMode: boolean) => void;
  setActiveZoomDirection: (direction: 'in' | 'out' | null) => void;
}

// Initial state
const initialState: UIState = {
  fpsMonitorVisible: true,
  infoPanelVisible: true,
  hamburgerMenuVisible: true, // Default to visible for TV mode
  hamburgerMenuFocusIndex: 0, // Start focus on first item
  lastActiveButtonIndex: 0, // Track last active button for focus restoration
  tvCameraControlsVisible: false, // Hidden by default, shown when conditions are met
  isInZoomMode: false, // Not in zoom mode by default
  activeZoomDirection: null, // No active zoom direction by default
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
        isInZoomMode: action.payload,
      };
    case 'SET_ACTIVE_ZOOM_DIRECTION':
      return {
        ...state,
        activeZoomDirection: action.payload,
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

  const setZoomMode = useMemo(() => (isInZoomMode: boolean) => {
    dispatch({ type: 'SET_ZOOM_MODE', payload: isInZoomMode });
  }, []);

  const setActiveZoomDirection = useMemo(() => (direction: 'in' | 'out' | null) => {
    dispatch({ type: 'SET_ACTIVE_ZOOM_DIRECTION', payload: direction });
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
    setActiveZoomDirection,
  }), [state, toggleFPSMonitor, toggleInfoPanel, setFPSMonitorVisible, setInfoPanelVisible, setHamburgerMenuVisible, setHamburgerMenuFocus, setLastActiveButton, closeHamburgerMenuForManual, setTVCameraControlsVisible, setZoomMode, setActiveZoomDirection]);

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
