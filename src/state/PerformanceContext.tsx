import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type PerformanceTier = 'high' | 'medium' | 'low';

export interface PerformanceSettings {
  earthQuality: 'high' | 'medium' | 'low';
  trailLength: number;
  trailSegments: number;
  shadowEnabled: boolean;
  textureQuality: 'high' | 'medium' | 'low';
  animationFPS: number;
  updateInterval: number;
  cityEffects: boolean;
  sunEnabled: boolean;
}

export interface PerformanceState {
  tier: PerformanceTier;
  settings: PerformanceSettings;
}

type PerformanceAction = 
  | { type: 'SET_TIER'; payload: PerformanceTier }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<PerformanceSettings> };

interface PerformanceContextType {
  state: PerformanceState;
  dispatch: React.Dispatch<PerformanceAction>;
  setTier: (tier: PerformanceTier) => void;
  getSettings: () => PerformanceSettings;
}

const PERFORMANCE_TIERS: Record<PerformanceTier, PerformanceSettings> = {
  high: {
    earthQuality: 'high',
    trailLength: 300,
    trailSegments: 8,
    shadowEnabled: true,
    textureQuality: 'high',
    animationFPS: 60,
    updateInterval: 5000,
    cityEffects: true,
    sunEnabled: true
  },
  medium: {
    earthQuality: 'medium',
    trailLength: 150,
    trailSegments: 4,
    shadowEnabled: false,
    textureQuality: 'medium',
    animationFPS: 30,
    updateInterval: 10000,
    cityEffects: true,
    sunEnabled: true
  },
  low: {
    earthQuality: 'low',
    trailLength: 50,
    trailSegments: 2,
    shadowEnabled: false,
    textureQuality: 'low',
    animationFPS: 15,
    updateInterval: 30000,
    cityEffects: false,
    sunEnabled: false
  }
};

const initialState: PerformanceState = {
  tier: 'high',
  settings: PERFORMANCE_TIERS.high
};

function performanceReducer(state: PerformanceState, action: PerformanceAction): PerformanceState {
  switch (action.type) {
    case 'SET_TIER':
      return {
        tier: action.payload,
        settings: PERFORMANCE_TIERS[action.payload]
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    default:
      return state;
  }
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  const setTier = (tier: PerformanceTier) => {
    dispatch({ type: 'SET_TIER', payload: tier });
  };

  const getSettings = () => state.settings;

  const value: PerformanceContextType = {
    state,
    dispatch,
    setTier,
    getSettings
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
} 