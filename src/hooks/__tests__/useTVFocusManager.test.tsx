import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTVFocusManager, findFocusableElements, isElementFocusable } from '../useTVFocusManager';

// Mock DOM elements for testing
const createMockButton = (id: string, disabled = false): HTMLElement => {
  const button = document.createElement('button');
  button.id = id;
  button.textContent = `Button ${id}`;
  if (disabled) {
    button.disabled = true;
  }
  
  // Mock focus method
  button.focus = vi.fn();
  button.click = vi.fn();
  
  return button;
};

const createMockInput = (id: string, disabled = false): HTMLElement => {
  const input = document.createElement('input');
  input.id = id;
  input.type = 'text';
  if (disabled) {
    input.disabled = true;
  }
  
  input.focus = vi.fn();
  input.click = vi.fn();
  
  return input;
};

describe('useTVFocusManager', () => {
  let mockElements: HTMLElement[];
  let onEscapeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock focusable elements
    mockElements = [
      createMockButton('btn1'),
      createMockButton('btn2'),
      createMockButton('btn3')
    ];
    
    onEscapeMock = vi.fn();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up event listeners - no need to pass a function
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should initialize with default focus index', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      expect(result.current.currentFocusIndex).toBe(0);
    });

    it('should initialize with custom initial focus index', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock,
          initialFocusIndex: 1
        })
      );

      expect(result.current.currentFocusIndex).toBe(1);
    });

    it('should focus the initial element when enabled', () => {
      renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      expect(mockElements[0].focus).toHaveBeenCalled();
    });

    it('should not focus elements when disabled', () => {
      renderHook(() =>
        useTVFocusManager({
          isEnabled: false,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      expect(mockElements[0].focus).not.toHaveBeenCalled();
    });
  });

  describe('Arrow key navigation', () => {
    it('should move focus to next element on ArrowDown', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      act(() => {
        result.current.focusNext();
      });

      expect(result.current.currentFocusIndex).toBe(1);
      expect(mockElements[1].focus).toHaveBeenCalled();
    });

    it('should move focus to previous element on ArrowUp', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock,
          initialFocusIndex: 1
        })
      );

      act(() => {
        result.current.focusPrevious();
      });

      expect(result.current.currentFocusIndex).toBe(0);
      expect(mockElements[0].focus).toHaveBeenCalled();
    });

    it('should handle keyboard events for arrow navigation', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      // Prevent default should be called
      const preventDefaultSpy = vi.spyOn(downEvent, 'preventDefault');

      act(() => {
        result.current.handleKeyDown(downEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.currentFocusIndex).toBe(1);
      expect(mockElements[1].focus).toHaveBeenCalled();
    });

    it('should handle left and right arrow keys for linear navigation', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
          // No gridConfig = linear navigation
        })
      );

      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      // Test right arrow (should move to next in linear mode)
      const rightPreventDefaultSpy = vi.spyOn(rightEvent, 'preventDefault');
      act(() => {
        result.current.handleKeyDown(rightEvent);
      });

      expect(rightPreventDefaultSpy).toHaveBeenCalled();
      expect(result.current.currentFocusIndex).toBe(1);
      expect(mockElements[1].focus).toHaveBeenCalled();

      // Test left arrow (should move to previous in linear mode)
      const leftPreventDefaultSpy = vi.spyOn(leftEvent, 'preventDefault');
      act(() => {
        result.current.handleKeyDown(leftEvent);
      });

      expect(leftPreventDefaultSpy).toHaveBeenCalled();
      expect(result.current.currentFocusIndex).toBe(0);
      expect(mockElements[0].focus).toHaveBeenCalled();
    });

    it('should handle grid navigation with 2D movement', () => {
      // Create a 2x2 grid of elements for testing
      const gridElements = [
        createMockButton('btn1'), // 0: row 0, col 0
        createMockButton('btn2'), // 1: row 0, col 1
        createMockButton('btn3'), // 2: row 1, col 0
        createMockButton('btn4')  // 3: row 1, col 1
      ];

      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: gridElements,
          onEscape: onEscapeMock,
          gridConfig: { columns: 2 }
        })
      );

      // Start at position 0 (top-left)
      expect(result.current.currentFocusIndex).toBe(0);

      // Move right: 0 -> 1
      act(() => {
        result.current.focusRight();
      });
      expect(result.current.currentFocusIndex).toBe(1);

      // Move down: 1 -> 3
      act(() => {
        result.current.focusDown();
      });
      expect(result.current.currentFocusIndex).toBe(3);

      // Move left: 3 -> 2
      act(() => {
        result.current.focusLeft();
      });
      expect(result.current.currentFocusIndex).toBe(2);

      // Move up: 2 -> 0
      act(() => {
        result.current.focusUp();
      });
      expect(result.current.currentFocusIndex).toBe(0);
    });

    it('should stop at grid boundaries without wrapping', () => {
      // Create a 3x2 grid (6 elements) for testing boundary behavior
      const gridElements = [
        createMockButton('btn1'), // 0: row 0, col 0
        createMockButton('btn2'), // 1: row 0, col 1  
        createMockButton('btn3'), // 2: row 0, col 2
        createMockButton('btn4'), // 3: row 1, col 0
        createMockButton('btn5'), // 4: row 1, col 1
        createMockButton('btn6')  // 5: row 1, col 2
      ];

      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: gridElements,
          onEscape: onEscapeMock,
          gridConfig: { columns: 3 }
        })
      );

      // Test horizontal boundary: rightmost stays at rightmost
      act(() => {
        result.current.focusElement(2); // Top-right corner
      });
      act(() => {
        result.current.focusRight(); // Should stay at current position
      });
      expect(result.current.currentFocusIndex).toBe(2); // Still top-right corner

      // Test horizontal boundary: leftmost stays at leftmost
      act(() => {
        result.current.focusElement(3); // Bottom-left corner
      });
      act(() => {
        result.current.focusLeft(); // Should stay at current position
      });
      expect(result.current.currentFocusIndex).toBe(3); // Still bottom-left corner

      // Test vertical boundary: top stays at top
      act(() => {
        result.current.focusElement(1); // Top-middle
      });
      act(() => {
        result.current.focusUp(); // Should stay at current position
      });
      expect(result.current.currentFocusIndex).toBe(1); // Still top-middle

      // Test vertical boundary: bottom stays at bottom
      act(() => {
        result.current.focusElement(5); // Bottom-right
      });
      act(() => {
        result.current.focusDown(); // Should stay at current position
      });
      expect(result.current.currentFocusIndex).toBe(5); // Still bottom-right
    });
  });

  describe('Focus boundary behavior', () => {
    it('should stay at first element when going up from first element', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock,
          initialFocusIndex: 0
        })
      );

      act(() => {
        result.current.focusPrevious();
      });

      expect(result.current.currentFocusIndex).toBe(0);
      expect(mockElements[0].focus).toHaveBeenCalled();
    });

    it('should stay at last element when going down from last element', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock,
          initialFocusIndex: 2
        })
      );

      act(() => {
        result.current.focusNext();
      });

      expect(result.current.currentFocusIndex).toBe(2);
      expect(mockElements[2].focus).toHaveBeenCalled();
    });
  });

  describe('Enter and Space key activation', () => {
    it('should activate current element on Enter key', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');

      act(() => {
        result.current.handleKeyDown(enterEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockElements[0].click).toHaveBeenCalled();
    });

    it('should activate current element on Space key', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock,
          initialFocusIndex: 1
        })
      );

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');

      act(() => {
        result.current.handleKeyDown(spaceEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockElements[1].click).toHaveBeenCalled();
    });
  });

  describe('Escape key handling', () => {
    it('should call onEscape callback when Escape key is pressed', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventDefaultSpy = vi.spyOn(escapeEvent, 'preventDefault');

      act(() => {
        result.current.handleKeyDown(escapeEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(onEscapeMock).toHaveBeenCalled();
    });

    it('should not call onEscape if callback is not provided', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements
        })
      );

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      act(() => {
        result.current.handleKeyDown(escapeEvent);
      });

      // Should not throw error
      expect(onEscapeMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty focusable elements array', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: [],
          onEscape: onEscapeMock
        })
      );

      expect(result.current.currentFocusIndex).toBe(0);

      act(() => {
        result.current.focusNext();
      });

      expect(result.current.currentFocusIndex).toBe(0);
    });

    it('should clamp focus index when elements array changes', () => {
      const { result, rerender } = renderHook(
        ({ elements }) =>
          useTVFocusManager({
            isEnabled: true,
            focusableElements: elements,
            onEscape: onEscapeMock,
            initialFocusIndex: 2
          }),
        { initialProps: { elements: mockElements } }
      );

      expect(result.current.currentFocusIndex).toBe(2);

      // Reduce elements array
      const reducedElements = [mockElements[0]];
      rerender({ elements: reducedElements });

      expect(result.current.currentFocusIndex).toBe(0);
    });

    it('should not handle keyboard events when disabled', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: false,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      act(() => {
        result.current.handleKeyDown(downEvent);
      });

      expect(result.current.currentFocusIndex).toBe(0);
      expect(mockElements[1].focus).not.toHaveBeenCalled();
    });

    it('should handle programmatic focus element calls', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      act(() => {
        result.current.focusElement(2);
      });

      expect(result.current.currentFocusIndex).toBe(2);
      expect(mockElements[2].focus).toHaveBeenCalled();
    });

    it('should handle out-of-bounds focus element calls', () => {
      const { result } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      act(() => {
        result.current.focusElement(10); // Out of bounds
      });

      expect(result.current.currentFocusIndex).toBe(2); // Should clamp to last element
      expect(mockElements[2].focus).toHaveBeenCalled();

      act(() => {
        result.current.focusElement(-5); // Negative index
      });

      expect(result.current.currentFocusIndex).toBe(0); // Should clamp to first element
      expect(mockElements[0].focus).toHaveBeenCalled();
    });
  });

  describe('Global keyboard event listener', () => {
    it('should add global keyboard event listener when enabled', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove global keyboard event listener when disabled', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { rerender } = renderHook(
        ({ enabled }) =>
          useTVFocusManager({
            isEnabled: enabled,
            focusableElements: mockElements,
            onEscape: onEscapeMock
          }),
        { initialProps: { enabled: true } }
      );

      // Disable the hook
      rerender({ enabled: false });

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should clean up event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useTVFocusManager({
          isEnabled: true,
          focusableElements: mockElements,
          onEscape: onEscapeMock
        })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});

describe('Helper functions', () => {
  describe('findFocusableElements', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should find all focusable elements in container', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <select><option>Option</option></select>
        <textarea></textarea>
        <a href="#test">Link</a>
        <div tabindex="0">Focusable div</div>
        <div>Non-focusable div</div>
      `;

      const focusableElements = findFocusableElements(container);

      expect(focusableElements).toHaveLength(6);
      expect(focusableElements[0].tagName).toBe('BUTTON');
      expect(focusableElements[1].tagName).toBe('INPUT');
      expect(focusableElements[2].tagName).toBe('SELECT');
      expect(focusableElements[3].tagName).toBe('TEXTAREA');
      expect(focusableElements[4].tagName).toBe('A');
      expect(focusableElements[5].tagName).toBe('DIV');
    });

    it('should exclude disabled elements', () => {
      container.innerHTML = `
        <button>Enabled Button</button>
        <button disabled>Disabled Button</button>
        <input type="text" />
        <input type="text" disabled />
      `;

      const focusableElements = findFocusableElements(container);

      expect(focusableElements).toHaveLength(2);
      expect(focusableElements[0].textContent).toBe('Enabled Button');
      expect(focusableElements[1].tagName).toBe('INPUT');
      expect((focusableElements[1] as HTMLInputElement).disabled).toBe(false);
    });

    it('should exclude elements with tabindex="-1"', () => {
      container.innerHTML = `
        <button>Normal Button</button>
        <button tabindex="-1">Non-focusable Button</button>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Non-focusable div</div>
      `;

      const focusableElements = findFocusableElements(container);

      expect(focusableElements).toHaveLength(2);
      expect(focusableElements[0].textContent).toBe('Normal Button');
      expect(focusableElements[1].textContent).toBe('Focusable div');
    });

    it('should return empty array for null container', () => {
      const focusableElements = findFocusableElements(null);
      expect(focusableElements).toEqual([]);
    });
  });

  describe('isElementFocusable', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('button');
      document.body.appendChild(element);
    });

    afterEach(() => {
      if (element.parentNode) {
        document.body.removeChild(element);
      }
    });

    it('should return true for focusable element', () => {
      expect(isElementFocusable(element)).toBe(true);
    });

    it('should return false for disabled element', () => {
      (element as HTMLButtonElement).disabled = true;
      expect(isElementFocusable(element)).toBe(false);
    });

    it('should return false for hidden element', () => {
      element.style.display = 'none';
      expect(isElementFocusable(element)).toBe(false);
    });

    it('should return false for invisible element', () => {
      element.style.visibility = 'hidden';
      expect(isElementFocusable(element)).toBe(false);
    });

    it('should return false for transparent element', () => {
      element.style.opacity = '0';
      expect(isElementFocusable(element)).toBe(false);
    });

    it('should return false for element with tabindex="-1"', () => {
      element.tabIndex = -1;
      expect(isElementFocusable(element)).toBe(false);
    });

    it('should return false for null element', () => {
      expect(isElementFocusable(null as any)).toBe(false);
    });
  });
});