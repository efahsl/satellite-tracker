import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { ControlsRef } from '../components/Globe/Controls';

interface CameraControlsContextType {
  controlsRef: React.RefObject<ControlsRef>;
}

const CameraControlsContext = createContext<CameraControlsContextType | undefined>(undefined);

export const CameraControlsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const controlsRef = useRef<ControlsRef>(null);

  return (
    <CameraControlsContext.Provider value={{ controlsRef }}>
      {children}
    </CameraControlsContext.Provider>
  );
};

export const useCameraControlsContext = () => {
  const context = useContext(CameraControlsContext);
  if (context === undefined) {
    throw new Error('useCameraControlsContext must be used within a CameraControlsProvider');
  }
  return context;
};