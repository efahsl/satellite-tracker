import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ISSProvider } from '../../../state/ISSContext';
import { PerformanceProvider } from '../../../state/PerformanceContext';
import HamburgerMenu from '../HamburgerMenu';

// Mock the control components to avoid complex dependencies
jest.mock('../../../Controls/ISSFollowControls', () => ({
  ISSFollowControls: () => <div data-testid="iss-follow-controls">ISS Follow Controls</div>
}));

jest.mock('../../../Controls/PerformanceControls', () => ({
  PerformanceControls: () => <div data-testid="performance-controls">Performance Controls</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ISSProvider>
      <PerformanceProvider>
        {component}
      </PerformanceProvider>
    </ISSProvider>
  );
};

describe('HamburgerMenu', () => {
  it('renders hamburger button', () => {
    renderWithProviders(<HamburgerMenu />);
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('toggles menu visibility when button is clicked', () => {
    renderWithProviders(<HamburgerMenu />);
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
    renderWithProviders(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Open menu
    fireEvent.click(button);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
    
    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });

  it('closes menu when backdrop is clicked', () => {
    renderWithProviders(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /open menu/i });
    
    // Open menu
    fireEvent.click(button);
    expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
    
    // Click backdrop
    const backdrop = screen.getByRole('generic', { hidden: true });
    fireEvent.click(backdrop);
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<HamburgerMenu />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-label', 'Open menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'hamburger-menu-content');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('updates accessibility attributes when menu is opened', () => {
    renderWithProviders(<HamburgerMenu />);
    const button = screen.getByRole('button');
    
    // Open menu
    fireEvent.click(button);
    
    expect(button).toHaveAttribute('aria-label', 'Close menu');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders menu content with proper ARIA attributes', () => {
    renderWithProviders(<HamburgerMenu />);
    const button = screen.getByRole('button');
    
    // Open menu
    fireEvent.click(button);
    
    const menuContent = screen.getByRole('dialog');
    expect(menuContent).toHaveAttribute('aria-modal', 'true');
    expect(menuContent).toHaveAttribute('aria-label', 'Navigation menu');
  });

  it('applies custom className when provided', () => {
    const { container } = renderWithProviders(
      <HamburgerMenu className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders hamburger icon with three lines', () => {
    renderWithProviders(<HamburgerMenu />);
    const icon = screen.getByRole('button').querySelector('.hamburger-menu__icon');
    expect(icon).toBeInTheDocument();
    
    const lines = icon?.querySelectorAll('.hamburger-menu__line');
    expect(lines).toHaveLength(3);
  });

  it('does not close menu when escape is pressed and menu is closed', () => {
    renderWithProviders(<HamburgerMenu />);
    
    // Menu should be closed initially
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
    
    // Press escape (should not cause any issues)
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('iss-follow-controls')).not.toBeInTheDocument();
  });
});
