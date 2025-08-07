import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ISSProvider } from '../../../state/ISSContext';
import { ISSFollowControls } from '../ISSFollowControls';

describe('ISSFollowControls Earth Rotate Button', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ISSProvider>
        {component}
      </ISSProvider>
    );
  };

  it('should render Earth Rotate button', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    expect(getByText('Earth Rotate')).toBeInTheDocument();
  });

  it('should toggle Earth Rotate mode when button is clicked', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const earthRotateButton = getByText('Earth Rotate');
    
    // Initially should show "Earth Rotate"
    expect(earthRotateButton).toBeInTheDocument();
    
    // Click to activate
    fireEvent.click(earthRotateButton);
    
    // Should now show "Earth Rotating"
    expect(getByText('Earth Rotating')).toBeInTheDocument();
  });

  it('should show correct status when Earth Rotate mode is active', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const earthRotateButton = getByText('Earth Rotate');
    fireEvent.click(earthRotateButton);
    
    expect(getByText('Rotating')).toBeInTheDocument();
  });

  it('should apply active styling when Earth Rotate mode is enabled', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const earthRotateButton = getByText('Earth Rotate');
    fireEvent.click(earthRotateButton);
    
    const activeButton = getByText('Earth Rotating');
    expect(activeButton.closest('button')).toHaveClass('iss-follow-controls__button--active-earth-rotate');
  });

  it('should show checkmark indicator when Earth Rotate mode is active', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const earthRotateButton = getByText('Earth Rotate');
    fireEvent.click(earthRotateButton);
    
    expect(getByText('✓')).toBeInTheDocument();
  });

  it('should ensure mutual exclusivity between Follow ISS and Earth Rotate', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    // Initially Follow ISS should be active
    expect(getByText('Following ISS')).toBeInTheDocument();
    
    // Click Earth Rotate
    const earthRotateButton = getByText('Earth Rotate');
    fireEvent.click(earthRotateButton);
    
    // Follow ISS should be deactivated, Earth Rotate should be active
    expect(getByText('Follow ISS')).toBeInTheDocument(); // Not "Following ISS"
    expect(getByText('Earth Rotating')).toBeInTheDocument();
    
    // Click Follow ISS
    const followButton = getByText('Follow ISS');
    fireEvent.click(followButton);
    
    // Earth Rotate should be deactivated, Follow ISS should be active
    expect(getByText('Following ISS')).toBeInTheDocument();
    expect(getByText('Earth Rotate')).toBeInTheDocument(); // Not "Earth Rotating"
  });

  it('should update description based on active mode', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    // Initially should show ISS tracking description
    expect(getByText('Camera is automatically tracking the ISS')).toBeInTheDocument();
    
    // Click Earth Rotate
    const earthRotateButton = getByText('Earth Rotate');
    fireEvent.click(earthRotateButton);
    
    // Should show Earth rotate description
    expect(getByText('Camera is rotating around Earth')).toBeInTheDocument();
    
    // Deactivate Earth Rotate
    const earthRotatingButton = getByText('Earth Rotating');
    fireEvent.click(earthRotatingButton);
    
    // Should show choose mode description
    expect(getByText('Choose a camera tracking mode')).toBeInTheDocument();
  });

  it('should render button with correct initial styling', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const earthRotateButton = getByText('Earth Rotate');
    const buttonElement = earthRotateButton.closest('button');
    
    // Should have base button class
    expect(buttonElement).toHaveClass('iss-follow-controls__button');
    // Should not have active class initially
    expect(buttonElement).not.toHaveClass('iss-follow-controls__button--active-earth-rotate');
  });

  it('should apply correct active styling with blue gradient', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const earthRotateButton = getByText('Earth Rotate');
    fireEvent.click(earthRotateButton);
    
    const activeButton = getByText('Earth Rotating');
    const buttonElement = activeButton.closest('button');
    
    // Should have active class for Earth Rotate
    expect(buttonElement).toHaveClass('iss-follow-controls__button--active-earth-rotate');
    
    // Verify the CSS class exists (the actual blue gradient styling is in CSS)
    const computedStyle = window.getComputedStyle(buttonElement!);
    // Note: In jsdom, computed styles may not reflect CSS, but we can verify the class is applied
    expect(buttonElement).toHaveClass('iss-follow-controls__button--active-earth-rotate');
  });

  it('should verify Follow ISS button also uses blue styling when active', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    // Follow ISS is initially active
    const followButton = getByText('Following ISS');
    const buttonElement = followButton.closest('button');
    
    // Should have the standard active class (which now uses blue gradient)
    expect(buttonElement).toHaveClass('iss-follow-controls__button--active');
  });

  it('should handle click events correctly and dispatch actions', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const earthRotateButton = getByText('Earth Rotate');
    
    // Verify button is clickable
    expect(earthRotateButton.closest('button')).not.toBeDisabled();
    
    // Click should change the button text (indicating action was dispatched)
    fireEvent.click(earthRotateButton);
    expect(getByText('Earth Rotating')).toBeInTheDocument();
    
    // Click again should toggle back
    const earthRotatingButton = getByText('Earth Rotating');
    fireEvent.click(earthRotatingButton);
    expect(getByText('Earth Rotate')).toBeInTheDocument();
  });

  it('should synchronize button state with context state correctly', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    // Initial state: Follow ISS active, Earth Rotate inactive
    expect(getByText('Following ISS')).toBeInTheDocument();
    expect(getByText('Earth Rotate')).toBeInTheDocument();
    expect(getByText('Tracking')).toBeInTheDocument();
    
    // Activate Earth Rotate
    fireEvent.click(getByText('Earth Rotate'));
    
    // State should be synchronized: Earth Rotate active, Follow ISS inactive
    expect(getByText('Earth Rotating')).toBeInTheDocument();
    expect(getByText('Follow ISS')).toBeInTheDocument();
    expect(getByText('Rotating')).toBeInTheDocument();
    
    // Activate Follow ISS
    fireEvent.click(getByText('Follow ISS'));
    
    // State should be synchronized: Follow ISS active, Earth Rotate inactive
    expect(getByText('Following ISS')).toBeInTheDocument();
    expect(getByText('Earth Rotate')).toBeInTheDocument();
    expect(getByText('Tracking')).toBeInTheDocument();
  });

  it('should render buttons side-by-side with correct layout', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    const followButton = getByText('Following ISS').closest('button');
    const earthRotateButton = getByText('Earth Rotate').closest('button');
    
    // Both buttons should exist
    expect(followButton).toBeInTheDocument();
    expect(earthRotateButton).toBeInTheDocument();
    
    // They should be in the same container
    const container = followButton?.parentElement;
    expect(container).toContain(earthRotateButton);
    
    // Container should have the button container class
    expect(container).toHaveClass('iss-follow-controls__button-container');
  });

  it('should show status indicator with correct color for each mode', () => {
    const { getByText } = renderWithProvider(<ISSFollowControls />);
    
    // Initially Follow ISS is active - status should show "Tracking"
    const initialStatus = getByText('Tracking');
    expect(initialStatus).toHaveClass('iss-follow-controls__status-value--active');
    
    // Activate Earth Rotate
    fireEvent.click(getByText('Following ISS')); // Deactivate Follow ISS first
    fireEvent.click(getByText('Earth Rotate'));
    
    // Status should show "Rotating" with Earth Rotate color
    const rotatingStatus = getByText('Rotating');
    expect(rotatingStatus).toHaveClass('iss-follow-controls__status-value--active-earth-rotate');
  });
});