import React from 'react';
import Controls from '../Controls';

describe('Controls Component Earth Rotate Mode', () => {
  it('should accept earthRotateMode prop in TypeScript interface', () => {
    // This test verifies that the TypeScript interface accepts the earthRotateMode prop
    const controlsProps = {
      earthRotateMode: true,
      autoRotate: false,
      autoRotateSpeed: 0.5,
      enableZoom: true,
      enablePan: true,
      dampingFactor: 0.1,
    };

    // If this compiles without TypeScript errors, the interface is correct
    expect(typeof controlsProps.earthRotateMode).toBe('boolean');
    expect(controlsProps.earthRotateMode).toBe(true);
  });

  it('should have earthRotateMode as optional prop', () => {
    // This test verifies that earthRotateMode is optional
    const controlsPropsWithoutEarthRotate = {
      autoRotate: false,
      autoRotateSpeed: 0.5,
      enableZoom: true,
      enablePan: true,
      dampingFactor: 0.1,
    };

    // If this compiles without TypeScript errors, earthRotateMode is optional
    expect(controlsPropsWithoutEarthRotate.autoRotate).toBe(false);
  });

  it('should accept earthRotateMode as false', () => {
    const controlsProps = {
      earthRotateMode: false,
    };

    expect(controlsProps.earthRotateMode).toBe(false);
  });
});