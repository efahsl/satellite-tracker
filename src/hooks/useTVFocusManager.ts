import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Grid configuration for 2D navigation
 */
interface GridConfig {
  /** Number of columns in the grid */
  columns: number;
  /** Number of rows in the grid (optional, calculated from elements if not provided) */
  rows?: number;
}

/**
 * Props for the TV focus manager hook
 */
interface UseTVFocusManagerProps {
  /** Whether TV focus management is enabled */
  isEnabled: boolean;
  /** Array of focusable elements to manage */
  focusableElements: HTMLElement[];
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Initial focus index (defaults to 0) */
  initialFocusIndex?: number;
  /** Grid configuration for 2D navigation (optional, defaults to linear navigation) */
  gridConfig?: GridConfig;
}

/**
 * Return type for the TV focus manager hook
 */
interface UseTVFocusManagerReturn {
  /** Current focus index */
  currentFocusIndex: number;
  /** Handler for keyboard events */
  handleKeyDown: (event: KeyboardEvent) => void;
  /** Function to programmatically focus an element by index */
  focusElement: (index: number) => void;
  /** Function to focus the next element */
  focusNext: () => void;
  /** Function to focus the previous element */
  focusPrevious: () => void;
  /** Function to focus element above (grid navigation) */
  focusUp: () => void;
  /** Function to focus element below (grid navigation) */
  focusDown: () => void;
  /** Function to focus element to the left (grid navigation) */
  focusLeft: () => void;
  /** Function to focus element to the right (grid navigation) */
  focusRight: () => void;
}

/**
 * Helper function to find all focusable elements within a container
 */
export const findFocusableElements = (container: HTMLElement | null): HTMLElement[] => {
  if (!container) return [];

  const focusableSelectors = [
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'a[href]:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]:not([tabindex="-1"])'
  ].join(', ');

  const elements = container.querySelectorAll(focusableSelectors);
  return Array.from(elements).filter(element => {
    const tabIndex = (element as HTMLElement).tabIndex;
    return tabIndex !== -1;
  }) as HTMLElement[];
};

/**
 * Helper function to check if an element is currently visible and focusable
 */
export const isElementFocusable = (element: HTMLElement): boolean => {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    !element.hasAttribute('disabled') &&
    element.tabIndex !== -1
  );
};

/**
 * Custom hook for managing TV remote control focus navigation
 * Provides keyboard navigation with arrow keys, Enter/Space activation, and Escape handling
 */
export const useTVFocusManager = ({
  isEnabled,
  focusableElements,
  onEscape,
  initialFocusIndex = 0,
  gridConfig
}: UseTVFocusManagerProps): UseTVFocusManagerReturn => {
  const [currentFocusIndex, setCurrentFocusIndex] = useState(initialFocusIndex);
  const keydownHandlerRef = useRef<((event: KeyboardEvent) => void) | null>(null);

  // Clamp focus index to valid range
  const clampFocusIndex = useCallback((index: number): number => {
    if (focusableElements.length === 0) return 0;
    if (index < 0) return focusableElements.length - 1;
    if (index >= focusableElements.length) return 0;
    return index;
  }, [focusableElements.length]);

  // Focus an element by index
  const focusElement = useCallback((index: number) => {
    const clampedIndex = clampFocusIndex(index);
    const element = focusableElements[clampedIndex];
    
    if (element && isElementFocusable(element)) {
      element.focus();
      setCurrentFocusIndex(clampedIndex);
    }
  }, [focusableElements, clampFocusIndex]);

  // Focus next element (with looping)
  const focusNext = useCallback(() => {
    const nextIndex = currentFocusIndex + 1;
    focusElement(nextIndex);
  }, [currentFocusIndex, focusElement]);

  // Focus previous element (with looping)
  const focusPrevious = useCallback(() => {
    const prevIndex = currentFocusIndex - 1;
    focusElement(prevIndex);
  }, [currentFocusIndex, focusElement]);

  // Grid navigation functions
  const focusUp = useCallback(() => {
    if (!gridConfig) {
      focusPrevious();
      return;
    }
    
    const { columns } = gridConfig;
    const currentRow = Math.floor(currentFocusIndex / columns);
    const currentCol = currentFocusIndex % columns;
    
    if (currentRow === 0) {
      // At top row, wrap to bottom row
      const totalRows = Math.ceil(focusableElements.length / columns);
      const targetRow = totalRows - 1;
      const targetIndex = Math.min(targetRow * columns + currentCol, focusableElements.length - 1);
      focusElement(targetIndex);
    } else {
      // Move up one row
      const targetIndex = (currentRow - 1) * columns + currentCol;
      focusElement(targetIndex);
    }
  }, [currentFocusIndex, focusableElements.length, gridConfig, focusElement, focusPrevious]);

  const focusDown = useCallback(() => {
    if (!gridConfig) {
      focusNext();
      return;
    }
    
    const { columns } = gridConfig;
    const currentRow = Math.floor(currentFocusIndex / columns);
    const currentCol = currentFocusIndex % columns;
    const totalRows = Math.ceil(focusableElements.length / columns);
    
    if (currentRow === totalRows - 1) {
      // At bottom row, wrap to top row
      const targetIndex = currentCol;
      focusElement(targetIndex);
    } else {
      // Move down one row
      const targetIndex = Math.min((currentRow + 1) * columns + currentCol, focusableElements.length - 1);
      focusElement(targetIndex);
    }
  }, [currentFocusIndex, focusableElements.length, gridConfig, focusElement, focusNext]);

  const focusLeft = useCallback(() => {
    if (!gridConfig) {
      focusPrevious();
      return;
    }
    
    const { columns } = gridConfig;
    const currentRow = Math.floor(currentFocusIndex / columns);
    const currentCol = currentFocusIndex % columns;
    
    if (currentCol === 0) {
      // At leftmost column, wrap to rightmost column of same row
      const targetIndex = Math.min(currentRow * columns + (columns - 1), focusableElements.length - 1);
      focusElement(targetIndex);
    } else {
      // Move left one column
      const targetIndex = currentFocusIndex - 1;
      focusElement(targetIndex);
    }
  }, [currentFocusIndex, focusableElements.length, gridConfig, focusElement, focusPrevious]);

  const focusRight = useCallback(() => {
    if (!gridConfig) {
      focusNext();
      return;
    }
    
    const { columns } = gridConfig;
    const currentRow = Math.floor(currentFocusIndex / columns);
    const currentCol = currentFocusIndex % columns;
    
    if (currentCol === columns - 1 || currentFocusIndex === focusableElements.length - 1) {
      // At rightmost column or last element, wrap to leftmost column of same row
      const targetIndex = currentRow * columns;
      focusElement(targetIndex);
    } else {
      // Move right one column
      const targetIndex = currentFocusIndex + 1;
      focusElement(targetIndex);
    }
  }, [currentFocusIndex, focusableElements.length, gridConfig, focusElement, focusNext]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusDown();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        focusUp();
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        focusLeft();
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        focusRight();
        break;
      
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        const currentElement = focusableElements[currentFocusIndex];
        if (currentElement && isElementFocusable(currentElement)) {
          currentElement.click();
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        if (onEscape) {
          onEscape();
        }
        break;
      
      default:
        // Don't prevent default for other keys
        break;
    }
  }, [isEnabled, currentFocusIndex, focusableElements, focusUp, focusDown, focusLeft, focusRight, onEscape]);

  // Set up global keyboard event listener when enabled
  useEffect(() => {
    if (!isEnabled) {
      // Remove event listener if disabled
      if (keydownHandlerRef.current) {
        document.removeEventListener('keydown', keydownHandlerRef.current);
        keydownHandlerRef.current = null;
      }
      return;
    }

    // Store reference to handler for cleanup
    keydownHandlerRef.current = handleKeyDown;
    
    // Add global keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      if (keydownHandlerRef.current) {
        document.removeEventListener('keydown', keydownHandlerRef.current);
        keydownHandlerRef.current = null;
      }
    };
  }, [isEnabled, handleKeyDown]);

  // Reset focus index when focusable elements change
  useEffect(() => {
    if (focusableElements.length === 0) {
      setCurrentFocusIndex(0);
    } else if (currentFocusIndex >= focusableElements.length) {
      const newIndex = Math.max(0, focusableElements.length - 1);
      setCurrentFocusIndex(newIndex);
    }
  }, [focusableElements.length, currentFocusIndex]);

  // Track if we've done initial focus to prevent re-focusing on element changes
  const hasInitializedRef = useRef(false);
  
  // Focus initial element when enabled and elements are available (only once)
  useEffect(() => {
    if (isEnabled && focusableElements.length > 0 && !hasInitializedRef.current) {
      const validIndex = clampFocusIndex(initialFocusIndex);
      setCurrentFocusIndex(validIndex);
      focusElement(validIndex);
      hasInitializedRef.current = true;
    }
    
    // Reset initialization flag when disabled
    if (!isEnabled) {
      hasInitializedRef.current = false;
    }
  }, [isEnabled, focusableElements.length, clampFocusIndex, focusElement, initialFocusIndex]);

  return {
    currentFocusIndex,
    handleKeyDown,
    focusElement,
    focusNext,
    focusPrevious,
    focusUp,
    focusDown,
    focusLeft,
    focusRight
  };
};

export default useTVFocusManager;