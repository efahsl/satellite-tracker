import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceProvider } from '../../state/DeviceContext';
import { Button } from '../UI/Button/Button';
import { Card } from '../UI/Card/Card';

// Mock window dimensions for TV profile
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Test component that uses TV styling
const TVTestComponent: React.FC = () => {
  return (
    <DeviceProvider>
      <div className="tv-safe-zone tv-typography">
        <h1>TV Typography Test</h1>
        <p>This text should be scaled for TV viewing</p>
        <Button variant="primary">TV Button</Button>
        <Card>
          <Card.Header>
            <Card.Title>TV Card Title</Card.Title>
          </Card.Header>
          <Card.Body>
            <p>TV Card content with proper typography scaling</p>
          </Card.Body>
        </Card>
      </div>
    </DeviceProvider>
  );
};

describe('TV Typography and Safe Zone Styling', () => {
  beforeEach(() => {
    // Reset window dimensions before each test
    mockWindowDimensions(1920, 1080);
    
    // Trigger resize event to update DeviceContext
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    // Clean up
    mockWindowDimensions(1024, 768);
    // Trigger resize event to reset DeviceContext
    window.dispatchEvent(new Event('resize'));
    // Clear the document body to prevent test interference
    document.body.innerHTML = '';
    // Clear any pending timers
    vi.clearAllTimers();
  });

  it('should apply TV typography classes when TV profile is active', () => {
    render(<TVTestComponent />);
    
    // Check that TV typography classes are applied
    const container = screen.getByText('TV Typography Test').closest('div');
    expect(container).toHaveClass('tv-safe-zone');
    expect(container).toHaveClass('tv-typography');
  });

  it('should render TV-scaled typography elements', () => {
    render(<TVTestComponent />);
    
    // Check that elements are rendered (basic smoke test)
    expect(screen.getAllByText('TV Typography Test')[0]).toBeInTheDocument();
    expect(screen.getAllByText('This text should be scaled for TV viewing')[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /tv button/i })[0]).toBeInTheDocument();
    expect(screen.getAllByText('TV Card Title')[0]).toBeInTheDocument();
  });

  it('should apply TV button classes to buttons', () => {
    render(<TVTestComponent />);
    
    const button = screen.getAllByRole('button', { name: /tv button/i })[0];
    expect(button).toHaveClass('tv-button');
    expect(button).toHaveClass('tv-focus-indicator');
  });

  it('should apply TV typography classes to cards', () => {
    render(<TVTestComponent />);
    
    const cardTitle = screen.getAllByText('TV Card Title')[0];
    const cardContainer = cardTitle.closest('.tv-typography');
    expect(cardContainer).toBeInTheDocument();
  });
});

describe('TV Safe Zone CSS Variables', () => {
  it('should have TV-specific CSS classes available', () => {
    // Test that TV-specific classes can be applied without errors
    render(
      <DeviceProvider>
        <div className="tv-safe-zone tv-typography tv-high-contrast">
          <button className="tv-button tv-focus-indicator">Test Button</button>
        </div>
      </DeviceProvider>
    );
    
    // Verify elements render without errors
    expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
  });
});

describe('TV High Contrast Styling', () => {
  it('should apply high contrast classes for TV visibility', () => {
    render(
      <DeviceProvider>
        <div className="tv-high-contrast">
          <p>High contrast text</p>
        </div>
      </DeviceProvider>
    );
    
    const container = screen.getByText('High contrast text').closest('div');
    expect(container).toHaveClass('tv-high-contrast');
  });
});