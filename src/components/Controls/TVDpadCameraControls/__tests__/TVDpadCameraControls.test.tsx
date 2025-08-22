import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TVDpadCameraControls } from '../TVDpadCameraControls';
import { DeviceProvider } from '../../../../state/DeviceContext';

// Mock the useDevice hook
const mockUseDevice = vi.fn();

vi.mock('../../../../state/DeviceContext', async () => {
  const actual = await vi.importActual('../../../../state/DeviceContext');
  return {
    ...actual,
    useDevice: () => mockUseDevice(),
  };
});

describe('TVDpadCameraControls', () => {
  const defaultProps = {
    isVisible: true,
    onHide: vi.fn(),
    onDirectionChange: vi.fn(),
    onZoomChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TV Mode Rendering', () => {
    it('should render when in TV mode and visible', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: true,
      });

      render(
        <DeviceProvider>
          <TVDpadCameraControls {...defaultProps} />
        </DeviceProvider>
      );

      // Check that D-pad buttons are rendered
      expect(screen.getByLabelText('Rotate camera to North')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotate camera to South')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotate camera to East')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotate camera to West')).toBeInTheDocument();

      // Check that zoom control is rendered
      expect(screen.getByText('Hold SELECT to Zoom IN')).toBeInTheDocument();
      expect(screen.getByText('Press and hold Enter')).toBeInTheDocument();

      // Check that back hint is rendered
      expect(screen.getByText('Press ESC to return to menu')).toBeInTheDocument();
    });

    it('should not render when not in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: false,
      });

      render(
        <DeviceProvider>
          <TVDpadCameraControls {...defaultProps} />
        </DeviceProvider>
      );

      expect(screen.queryByLabelText('Rotate camera to North')).not.toBeInTheDocument();
    });

    it('should not render when not visible', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: true,
      });

      render(
        <DeviceProvider>
          <TVDpadCameraControls {...defaultProps} isVisible={false} />
        </DeviceProvider>
      );

      expect(screen.queryByLabelText('Rotate camera to North')).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onDirectionChange when direction buttons are clicked', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: true,
      });

      render(
        <DeviceProvider>
          <TVDpadCameraControls {...defaultProps} />
        </DeviceProvider>
      );

      // Click up button
      fireEvent.click(screen.getByLabelText('Rotate camera to North'));
      expect(defaultProps.onDirectionChange).toHaveBeenCalledWith('up');

      // Click right button
      fireEvent.click(screen.getByLabelText('Rotate camera to East'));
      expect(defaultProps.onDirectionChange).toHaveBeenCalledWith('right');

      // Click down button
      fireEvent.click(screen.getByLabelText('Rotate camera to South'));
      expect(defaultProps.onDirectionChange).toHaveBeenCalledWith('down');

      // Click left button
      fireEvent.click(screen.getByLabelText('Rotate camera to West'));
      expect(defaultProps.onDirectionChange).toHaveBeenCalledWith('left');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all buttons', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: true,
      });

      render(
        <DeviceProvider>
          <TVDpadCameraControls {...defaultProps} />
        </DeviceProvider>
      );

      expect(screen.getByLabelText('Rotate camera to North')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotate camera to South')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotate camera to East')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotate camera to West')).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: true,
      });

      render(
        <DeviceProvider>
          <TVDpadCameraControls {...defaultProps} />
        </DeviceProvider>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
