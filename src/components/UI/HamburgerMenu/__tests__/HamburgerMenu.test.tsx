import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import HamburgerMenu from '../HamburgerMenu';

// Mock the control components to avoid complex dependencies
vi.mock('../../../Controls/ISSFollowControls', () => ({
  ISSFollowControls: () => <div data-testid="iss-follow-controls">ISS Follow Controls</div>
}));

vi.mock('../../../Controls/PerformanceControls', () => ({
  PerformanceControls: () => <div data-testid="performance-controls">Performance Controls</div>
}));

// Mock the device context
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

vi.mock('../../../state/DeviceContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDevice: () => mockDeviceContext
  };
});

const renderComponent = (component: React.ReactElement) => {
  return render(component);
};

describe('HamburgerMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hamburger button', () => {
    renderComponent(<HamburgerMenu />);
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('toggles menu visibility when button is clicked', () => {
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Menu should be closed initially
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(button);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
    expect(screen.getByTestId('performance-controls')).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(button);
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });

  it('closes menu when escape key is pressed', () => {
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Open menu
    fireEvent.click(button);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
    
    // Press escape on the hamburger menu container
    const menuContainer = screen.getByRole('button').closest('.hamburger-menu');
    if (menuContainer) {
      fireEvent.keyDown(menuContainer, { key: 'Escape' });
    }
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });

  it('closes menu when backdrop is clicked', () => {
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Open menu
    fireEvent.click(button);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
    
    // Click backdrop
    const backdrop = document.querySelector('.hamburger-menu__backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-label', 'Open menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'hamburger-menu-content');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('updates accessibility attributes when menu is opened', () => {
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button');
    
    // Open menu
    fireEvent.click(button);
    
    expect(button).toHaveAttribute('aria-label', 'Close menu');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders menu content with proper ARIA attributes', () => {
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button');
    
    // Open menu
    fireEvent.click(button);
    
    const menuContent = screen.getByRole('dialog');
    expect(menuContent).toHaveAttribute('aria-modal', 'true');
    expect(menuContent).toHaveAttribute('aria-label', 'Navigation menu');
  });

  it('applies custom className when provided', () => {
    const { container } = renderComponent(
      <HamburgerMenu className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders hamburger icon with three lines', () => {
    renderComponent(<HamburgerMenu />);
    const icon = screen.getByRole('button').querySelector('.hamburger-menu__icon');
    expect(icon).toBeInTheDocument();
    
    const lines = icon?.querySelectorAll('.hamburger-menu__line');
    expect(lines).toHaveLength(3);
  });

  it('does not close menu when escape is pressed and menu is closed', () => {
    renderComponent(<HamburgerMenu />);
    
    // Menu should be closed initially
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
    
    // Press escape (should not cause any issues)
    const menuContainer = screen.getByRole('button').closest('.hamburger-menu');
    if (menuContainer) {
      fireEvent.keyDown(menuContainer, { key: 'Escape' });
    }
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });

  it('applies mobile-specific behavior when on mobile', () => {
    // Set mobile context
    mockDeviceContext.isMobile = true;
    mockDeviceContext.isDesktop = false;
    
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Open menu
    fireEvent.click(button);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
    
    // Click on controls should close menu on mobile
    const controls = screen.getByTestId('iss-follow-controls');
    fireEvent.click(controls);
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });

  it('does not auto-close menu on desktop when controls are clicked', () => {
    // Set desktop context
    mockDeviceContext.isMobile = false;
    mockDeviceContext.isDesktop = true;
    
    renderComponent(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Open menu
    fireEvent.click(button);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
    
    // Click on controls should NOT close menu on desktop
    const controls = screen.getByTestId('iss-follow-controls');
    fireEvent.click(controls);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
  });
});
