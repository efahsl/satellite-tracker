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
});