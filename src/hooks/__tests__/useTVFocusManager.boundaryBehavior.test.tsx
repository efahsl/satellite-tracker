import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTVFocusManager } from '../useTVFocusManager';

// Mock button creation helper
const createMockButton = (id: string) => {
  const button = document.createElement('button');
  button.id = id;
  button.focus = vi.fn();
  button.click = vi.fn();
  button.tabIndex = 0;
  return button;
};

describe('useTVFocusManager Boundary Behavior', () => {
  let mockElements: HTMLElement[];
  let onEscapeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock elements representing a typical TV menu structure
    mockElements = [
      createMockButton('follow-iss'),      // Index 0
      createMockButton('earth-rotate'),    // Index 1  
      createMockButton('manual'),          // Index 2 (Manual button)
      createMockButton('performance'),     // Index 3
      createMockButton('display'),         // Index 4
      createMockButton('position-info')    // Index 5 (Bottom item)
    ];
    onEscapeMock = vi.fn();
  });

  it('should not wrap from Manual button to bottom when pressing Up', () => {
    const { result } = renderHook(() =>
      useTVFocusManager({
        isEnabled: true,
        focusableElements: mockElements,
        onEscape: onEscapeMock,
        initialFocusIndex: 2 // Start at Manual button
      })
    );

    // Verify we start at Manual button (index 2)
    expect(result.current.currentFocusIndex).toBe(2);

    // Press Up from Manual button
    act(() => {
      result.current.focusPrevious();
    });

    // Should move to previous element (index 1), not wrap to bottom
    expect(result.current.currentFocusIndex).toBe(1);
    expect(mockElements[1].focus).toHaveBeenCalled();
  });

  it('should not wrap from first element to last when pressing Up', () => {
    const { result } = renderHook(() =>
      useTVFocusManager({
        isEnabled: true,
        focusableElements: mockElements,
        onEscape: onEscapeMock,
        initialFocusIndex: 0 // Start at first element
      })
    );

    // Verify we start at first element
    expect(result.current.currentFocusIndex).toBe(0);

    // Press Up from first element
    act(() => {
      result.current.focusPrevious();
    });

    // Should stay at first element (index 0), not wrap to last
    expect(result.current.currentFocusIndex).toBe(0);
    expect(mockElements[0].focus).toHaveBeenCalled();
  });

  it('should not wrap from last element to first when pressing Down', () => {
    const { result } = renderHook(() =>
      useTVFocusManager({
        isEnabled: true,
        focusableElements: mockElements,
        onEscape: onEscapeMock,
        initialFocusIndex: 5 // Start at last element
      })
    );

    // Verify we start at last element
    expect(result.current.currentFocusIndex).toBe(5);

    // Press Down from last element
    act(() => {
      result.current.focusNext();
    });

    // Should stay at last element (index 5), not wrap to first
    expect(result.current.currentFocusIndex).toBe(5);
    expect(mockElements[5].focus).toHaveBeenCalled();
  });

  it('should allow normal navigation within boundaries', () => {
    const { result } = renderHook(() =>
      useTVFocusManager({
        isEnabled: true,
        focusableElements: mockElements,
        onEscape: onEscapeMock,
        initialFocusIndex: 2 // Start at Manual button
      })
    );

    // Move down from Manual (index 2) to Performance (index 3)
    act(() => {
      result.current.focusNext();
    });
    expect(result.current.currentFocusIndex).toBe(3);

    // Move down from Performance (index 3) to Display (index 4)
    act(() => {
      result.current.focusNext();
    });
    expect(result.current.currentFocusIndex).toBe(4);

    // Move back up from Display (index 4) to Performance (index 3)
    act(() => {
      result.current.focusPrevious();
    });
    expect(result.current.currentFocusIndex).toBe(3);

    // Move back up from Performance (index 3) to Manual (index 2)
    act(() => {
      result.current.focusPrevious();
    });
    expect(result.current.currentFocusIndex).toBe(2);
  });

  it('should handle keyboard events without wrapping', () => {
    const { result } = renderHook(() =>
      useTVFocusManager({
        isEnabled: true,
        focusableElements: mockElements,
        onEscape: onEscapeMock,
        initialFocusIndex: 0
      })
    );

    // Simulate ArrowUp key at first element
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      result.current.handleKeyDown(event);
    });

    // Should stay at first element
    expect(result.current.currentFocusIndex).toBe(0);

    // Move to last element
    act(() => {
      result.current.focusElement(5);
    });

    // Simulate ArrowDown key at last element
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      result.current.handleKeyDown(event);
    });

    // Should stay at last element
    expect(result.current.currentFocusIndex).toBe(5);
  });
});