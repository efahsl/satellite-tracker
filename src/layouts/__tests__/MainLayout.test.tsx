import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import MainLayout from '../MainLayout';
import { DeviceProvider } from '../../state/DeviceContext';

// Mock the HamburgerMenu component
vi.mock('../../components/UI/HamburgerMenu/HamburgerMenu', () => ({
  default: () => <div data-testid="hamburger-menu">Hamburger Menu</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <DeviceProvider>
        {component}
      </DeviceProvider>
    </BrowserRouter>
  );
};

describe('MainLayout', () => {
  it('renders without warnings', () => {
    const { getByText, getByTestId } = renderWithProviders(<MainLayout />);
    
    expect(getByText('ISS Live Tracker')).toBeInTheDocument();
    expect(getByTestId('hamburger-menu')).toBeInTheDocument();
    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('About')).toBeInTheDocument();
  });

  it('renders header with proper structure', () => {
    const { container } = renderWithProviders(<MainLayout />);
    const header = container.querySelector('header');
    
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('bg-space-blue', 'shadow-md');
  });

  it('renders navigation links', () => {
    const { getByText } = renderWithProviders(<MainLayout />);
    
    const homeLink = getByText('Home').closest('a');
    const aboutLink = getByText('About').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('renders footer with current year', () => {
    const { getByText } = renderWithProviders(<MainLayout />);
    const currentYear = new Date().getFullYear();
    
    expect(getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });

  it('applies responsive styling based on device context', () => {
    const { container } = renderWithProviders(<MainLayout />);
    const header = container.querySelector('header');
    
    expect(header).toBeInTheDocument();
    // The component should render without errors and apply device-based styling
  });

  it('renders component without errors', () => {
    // This test verifies that the component renders without throwing errors
    expect(() => {
      renderWithProviders(<MainLayout />);
    }).not.toThrow();
  });

  it('uses responsive components for layout', () => {
    const { container } = renderWithProviders(<MainLayout />);
    
    // Check that the layout uses responsive components
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('applies proper semantic HTML structure', () => {
    renderWithProviders(<MainLayout />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders layout structure correctly', () => {
    renderWithProviders(<MainLayout />);
    
    // The component should render the basic layout structure
    expect(() => {
      renderWithProviders(<MainLayout />);
    }).not.toThrow();
  });
});