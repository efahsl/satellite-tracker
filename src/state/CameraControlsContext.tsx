import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { ControlsRef } from '../components/Globe/Controls';
import { GlobeRef } from '../components/Globe/Globe';

interface CameraControlsContextType {
  globeRef: React.RefObject<GlobeRef>;
  getControlsRef: () => ControlsRef | null;
}

const CameraControlsContext = createContext<CameraControlsContextType | null>(null);

interface CameraControlsProviderProps {
  children: ReactNode;
}

export const CameraControlsProvider: React.FC<CameraControlsProviderProps> = ({ children }) => {
  const globeRef = useRef<GlobeRef>(null);

  const getControlsRef = (): ControlsRef | null => {
    return globeRef.current?.getControlsRef() || null;
  };

  return (
    <CameraControlsContext.Provider value={{ globeRef, getControlsRef }}>
      {children}
    </CameraControlsContext.Provider>
  );
};

export const useCameraControls = (): CameraControlsContextType => {
  const context = useContext(CameraControlsContext);
  if (!context) {
    throw new Error('useCameraControls must be used within a CameraControlsProvider');
  }
  return context;
};