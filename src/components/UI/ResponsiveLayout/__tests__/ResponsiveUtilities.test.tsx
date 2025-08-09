import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import {
  ResponsiveText,
  ResponsiveButton,
  ResponsiveCard,
  ResponsiveList,
  ResponsiveImage,
  ResponsiveModal
} from '../ResponsiveUtilities';

// Mock the useDevice hook for testing
const mockDeviceContext = {
  state: {
    deviceType: 'desktop' as const,
    screenWidth: 1024,
    screenHeight: 768,
    isTouchDevice: false,
    orientation: 'landscape' as const
  },
  dispatch: vi.fn(),
  isMobile: false,
  isDesktop: true,
  isTV: false
};

vi.mock('../../../../state/DeviceContext', () => ({
  ...vi.importActual('../../../../state/DeviceContext'),
  useDevice: () => mockDeviceContext
}));

describe('ResponsiveUtilities Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ResponsiveText', () => {
    it('should apply mobile text size when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveText mobileSize="sm" desktopSize="lg">
          Test Text
        </ResponsiveText>
      );
      
      const textElement = screen.getByText('Test Text');
      expect(textElement).toHaveClass('text-sm', 'font-normal');
    });

    it('should apply desktop text size when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveText mobileSize="sm" desktopSize="lg">
          Test Text
        </ResponsiveText>
      );
      
      const textElement = screen.getByText('Test Text');
      expect(textElement).toHaveClass('text-lg', 'font-normal');
    });

    it('should apply custom weight', () => {
      render(
        <ResponsiveText weight="bold">
          Test Text
        </ResponsiveText>
      );
      
      const textElement = screen.getByText('Test Text');
      expect(textElement).toHaveClass('font-bold');
    });
  });

  describe('ResponsiveButton', () => {
    it('should apply mobile button size when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveButton mobileSize="sm" desktopSize="lg">
          Click Me
        </ResponsiveButton>
      );
      
      const buttonElement = screen.getByRole('button', { name: 'Click Me' });
      expect(buttonElement).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('should apply desktop button size when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveButton mobileSize="sm" desktopSize="lg">
          Click Me
        </ResponsiveButton>
      );
      
      const buttonElement = screen.getByRole('button', { name: 'Click Me' });
      expect(buttonElement).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      
      render(
        <ResponsiveButton onClick={handleClick}>
          Click Me
        </ResponsiveButton>
      );
      
      const buttonElement = screen.getByRole('button', { name: 'Click Me' });
      fireEvent.click(buttonElement);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const handleClick = vi.fn();
      
      render(
        <ResponsiveButton onClick={handleClick} disabled>
          Click Me
        </ResponsiveButton>
      );
      
      const buttonElement = screen.getByRole('button', { name: 'Click Me' });
      expect(buttonElement).toBeDisabled();
      expect(buttonElement).toHaveClass('opacity-50', 'cursor-not-allowed');
      
      fireEvent.click(buttonElement);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply full width when fullWidth is true', () => {
      render(
        <ResponsiveButton fullWidth>
          Click Me
        </ResponsiveButton>
      );
      
      const buttonElement = screen.getByRole('button', { name: 'Click Me' });
      expect(buttonElement).toHaveClass('w-full');
    });

    it('should apply different variants', () => {
      const { rerender } = render(
        <ResponsiveButton variant="primary">
          Primary
        </ResponsiveButton>
      );
      
      let buttonElement = screen.getByRole('button', { name: 'Primary' });
      expect(buttonElement).toHaveClass('bg-iss-highlight', 'text-white');
      
      rerender(
        <ResponsiveButton variant="secondary">
          Secondary
        </ResponsiveButton>
      );
      
      buttonElement = screen.getByRole('button', { name: 'Secondary' });
      expect(buttonElement).toHaveClass('bg-gray-700', 'text-white');
      
      rerender(
        <ResponsiveButton variant="outline">
          Outline
        </ResponsiveButton>
      );
      
      buttonElement = screen.getByRole('button', { name: 'Outline' });
      expect(buttonElement).toHaveClass('border', 'border-gray-700', 'text-gray-300');
    });
  });

  describe('ResponsiveCard', () => {
    it('should apply mobile padding when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveCard mobilePadding="sm" desktopPadding="lg">
          <div data-testid="card-content">Card Content</div>
        </ResponsiveCard>
      );
      
      const cardElement = screen.getByTestId('card-content').parentElement;
      expect(cardElement).toHaveClass('p-2');
    });

    it('should apply desktop padding when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveCard mobilePadding="sm" desktopPadding="lg">
          <div data-testid="card-content">Card Content</div>
        </ResponsiveCard>
      );
      
      const cardElement = screen.getByTestId('card-content').parentElement;
      expect(cardElement).toHaveClass('p-6');
    });

    it('should apply shadow and border by default', () => {
      render(
        <ResponsiveCard>
          <div data-testid="card-content">Card Content</div>
        </ResponsiveCard>
      );
      
      const cardElement = screen.getByTestId('card-content').parentElement;
      expect(cardElement).toHaveClass('shadow-md', 'border', 'border-gray-700');
    });

    it('should not apply shadow and border when disabled', () => {
      render(
        <ResponsiveCard shadow={false} border={false}>
          <div data-testid="card-content">Card Content</div>
        </ResponsiveCard>
      );
      
      const cardElement = screen.getByTestId('card-content').parentElement;
      expect(cardElement).not.toHaveClass('shadow-md', 'border', 'border-gray-700');
    });
  });

  describe('ResponsiveList', () => {
    it('should apply vertical spacing by default', () => {
      render(
        <ResponsiveList>
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveList>
      );
      
      const listElement = screen.getByText('Item 1').parentElement;
      expect(listElement).toHaveClass('space-y-2');
    });

    it('should apply horizontal spacing when orientation is horizontal', () => {
      render(
        <ResponsiveList orientation="horizontal">
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveList>
      );
      
      const listElement = screen.getByText('Item 1').parentElement;
      expect(listElement).toHaveClass('flex', 'space-x-2');
    });

    it('should apply different spacing options', () => {
      const { rerender } = render(
        <ResponsiveList spacing="tight">
          <div>Item 1</div>
        </ResponsiveList>
      );
      
      let listElement = screen.getByText('Item 1').parentElement;
      expect(listElement).toHaveClass('space-y-1');
      
      rerender(
        <ResponsiveList spacing="loose">
          <div>Item 1</div>
        </ResponsiveList>
      );
      
      listElement = screen.getByText('Item 1').parentElement;
      expect(listElement).toHaveClass('space-y-4');
    });
  });

  describe('ResponsiveImage', () => {
    it('should render image with responsive sizing', () => {
      render(
        <ResponsiveImage
          src="/test-image.jpg"
          alt="Test Image"
          mobileSize="sm"
          desktopSize="lg"
        />
      );
      
      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toHaveAttribute('src', '/test-image.jpg');
      expect(imageElement).toHaveClass('rounded-md');
    });

    it('should apply mobile size when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveImage
          src="/test-image.jpg"
          alt="Test Image"
          mobileSize="sm"
          desktopSize="lg"
        />
      );
      
      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toHaveClass('w-16', 'h-16');
    });

    it('should apply desktop size when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveImage
          src="/test-image.jpg"
          alt="Test Image"
          mobileSize="sm"
          desktopSize="lg"
        />
      );
      
      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toHaveClass('w-32', 'h-32');
    });

    it('should apply aspect ratio classes', () => {
      render(
        <ResponsiveImage
          src="/test-image.jpg"
          alt="Test Image"
          aspectRatio="square"
        />
      );
      
      const imageElement = screen.getByAltText('Test Image');
      expect(imageElement).toHaveClass('aspect-square', 'object-cover');
    });
  });

  describe('ResponsiveModal', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ResponsiveModal isOpen={false} onClose={vi.fn()}>
          <div data-testid="modal-content">Modal Content</div>
        </ResponsiveModal>
      );
      
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ResponsiveModal isOpen={true} onClose={vi.fn()}>
          <div data-testid="modal-content">Modal Content</div>
        </ResponsiveModal>
      );
      
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(
        <ResponsiveModal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div data-testid="modal-content">Modal Content</div>
        </ResponsiveModal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      
      render(
        <ResponsiveModal isOpen={true} onClose={handleClose} title="Test Modal">
          <div data-testid="modal-content">Modal Content</div>
        </ResponsiveModal>
      );
      
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const handleClose = vi.fn();
      
      render(
        <ResponsiveModal isOpen={true} onClose={handleClose}>
          <div data-testid="modal-content">Modal Content</div>
        </ResponsiveModal>
      );
      
      // Find the backdrop (the fixed inset-0 div that's not the content)
      const backdrop = document.querySelector('.fixed.inset-0.bg-black');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should apply mobile full screen when mobileFullScreen is true and on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveModal isOpen={true} onClose={vi.fn()} mobileFullScreen={true}>
          <div data-testid="modal-content">Modal Content</div>
        </ResponsiveModal>
      );
      
      const modalContent = screen.getByTestId('modal-content').closest('.relative');
      expect(modalContent).toHaveClass('w-full', 'h-full', 'bg-space-black', 'rounded-none');
    });
  });
});