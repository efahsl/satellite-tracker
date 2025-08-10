import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisplayControls } from '../DisplayControls';
import { UIProvider } from '../../../state/UIContext';

// Mock the UI context for testing
const MockUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <UIProvider>{children}</UIProvider>;
};

describe('DisplayControls', () => {
  it('renders without crashing', () => {
    render(
      <MockUIProvider>
        <DisplayControls />
      </MockUIProvider>
    );

    expect(screen.getByText('Display Options')).toBeInTheDocument();
    expect(screen.getByText('Control which information panels are visible on screen')).toBeInTheDocument();
  });

  it('renders both toggle buttons', () => {
    render(
      <MockUIProvider>
        <DisplayControls />
      </MockUIProvider>
    );

    expect(screen.getByText(/FPS Stats/)).toBeInTheDocument();
    expect(screen.getByText(/Position Info/)).toBeInTheDocument();
  });

  it('shows correct button states initially', () => {
    render(
      <MockUIProvider>
        <DisplayControls />
      </MockUIProvider>
    );

    // Both should be visible initially (default state)
    expect(screen.getByText('FPS Stats On')).toBeInTheDocument();
    expect(screen.getByText('Position Info On')).toBeInTheDocument();
  });

  it('handles button clicks', () => {
    render(
      <MockUIProvider>
        <DisplayControls />
      </MockUIProvider>
    );

    const fpsButton = screen.getByText(/FPS Stats/);
    const positionButton = screen.getByText(/Position Info/);

    // Click FPS button
    fireEvent.click(fpsButton);
    expect(screen.getByText('FPS Stats Off')).toBeInTheDocument();

    // Click position button
    fireEvent.click(positionButton);
    expect(screen.getByText('Position Info Off')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(
      <MockUIProvider>
        <DisplayControls />
      </MockUIProvider>
    );

    const container = screen.getByText('Display Options').closest('div');
    expect(container).toHaveClass('displayControls');
  });
});
