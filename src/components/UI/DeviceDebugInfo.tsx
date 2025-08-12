import React from 'react';
import { useDevice } from '../../state/DeviceContext';

interface DeviceDebugInfoProps {
  className?: string;
}

export const DeviceDebugInfo: React.FC<DeviceDebugInfoProps> = ({ className = '' }) => {
  const { state, isTVProfile, isMobile, isDesktop, isTV } = useDevice();

  return (
    <div className={`fixed top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50 ${className}`}>
      <div>Width: {state.screenWidth}px</div>
      <div>Height: {state.screenHeight}px</div>
      <div>Type: {state.deviceType}</div>
      <div>TV Profile: {isTVProfile ? '✅' : '❌'}</div>
      <div>Mobile: {isMobile ? '✅' : '❌'}</div>
      <div>Desktop: {isDesktop ? '✅' : '❌'}</div>
      <div>TV: {isTV ? '✅' : '❌'}</div>
    </div>
  );
};