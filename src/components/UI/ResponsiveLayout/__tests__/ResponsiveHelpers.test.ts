import { DeviceType } from '../../../../state/DeviceContext';
import {
  getResponsiveClasses,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveLayout,
  getResponsiveGridCols,
  getResponsiveFlexDirection,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveGap,
  getResponsiveWidth,
  getResponsiveHeight,
  getResponsiveTextAlign,
  getResponsiveDisplay,
  combineResponsiveClasses
} from '../ResponsiveHelpers';

describe('ResponsiveHelpers', () => {
  describe('getResponsiveClasses', () => {
    it('should return mobile classes for mobile device', () => {
      const result = getResponsiveClasses('mobile-class', 'desktop-class', 'tv-class', DeviceType.MOBILE);
      expect(result).toBe('mobile-class');
    });

    it('should return desktop classes for desktop device', () => {
      const result = getResponsiveClasses('mobile-class', 'desktop-class', 'tv-class', DeviceType.DESKTOP);
      expect(result).toBe('desktop-class');
    });

    it('should return TV classes for TV device', () => {
      const result = getResponsiveClasses('mobile-class', 'desktop-class', 'tv-class', DeviceType.TV);
      expect(result).toBe('tv-class');
    });

    it('should fallback to desktop classes for TV device when TV classes not provided', () => {
      const result = getResponsiveClasses('mobile-class', 'desktop-class', '', DeviceType.TV);
      expect(result).toBe('desktop-class');
    });
  });

  describe('getResponsiveSpacing', () => {
    it('should return mobile spacing for mobile device', () => {
      const result = getResponsiveSpacing('p-2', 'p-4', DeviceType.MOBILE);
      expect(result).toBe('p-2');
    });

    it('should return desktop spacing for desktop device', () => {
      const result = getResponsiveSpacing('p-2', 'p-4', DeviceType.DESKTOP);
      expect(result).toBe('p-4');
    });
  });

  describe('getResponsiveFontSize', () => {
    it('should return mobile font size for mobile device', () => {
      const result = getResponsiveFontSize('text-sm', 'text-lg', DeviceType.MOBILE);
      expect(result).toBe('text-sm');
    });

    it('should return desktop font size for desktop device', () => {
      const result = getResponsiveFontSize('text-sm', 'text-lg', DeviceType.DESKTOP);
      expect(result).toBe('text-lg');
    });
  });

  describe('getResponsiveLayout', () => {
    it('should return mobile layout for mobile device', () => {
      const result = getResponsiveLayout('flex', 'grid', DeviceType.MOBILE);
      expect(result).toBe('flex');
    });

    it('should return desktop layout for desktop device', () => {
      const result = getResponsiveLayout('flex', 'grid', DeviceType.DESKTOP);
      expect(result).toBe('grid');
    });

    it('should return block layout', () => {
      const result = getResponsiveLayout('block', 'block', DeviceType.DESKTOP);
      expect(result).toBe('block');
    });
  });

  describe('getResponsiveGridCols', () => {
    it('should return mobile grid columns for mobile device', () => {
      const result = getResponsiveGridCols(1, 3, DeviceType.MOBILE);
      expect(result).toBe('grid-cols-1');
    });

    it('should return desktop grid columns for desktop device', () => {
      const result = getResponsiveGridCols(1, 3, DeviceType.DESKTOP);
      expect(result).toBe('grid-cols-3');
    });

    it('should handle all grid column options', () => {
      expect(getResponsiveGridCols(2, 1, DeviceType.MOBILE)).toBe('grid-cols-2');
      expect(getResponsiveGridCols(1, 2, DeviceType.DESKTOP)).toBe('grid-cols-2');
      expect(getResponsiveGridCols(1, 4, DeviceType.DESKTOP)).toBe('grid-cols-4');
    });
  });

  describe('getResponsiveFlexDirection', () => {
    it('should return mobile flex direction for mobile device', () => {
      const result = getResponsiveFlexDirection('col', 'row', DeviceType.MOBILE);
      expect(result).toBe('flex-col');
    });

    it('should return desktop flex direction for desktop device', () => {
      const result = getResponsiveFlexDirection('col', 'row', DeviceType.DESKTOP);
      expect(result).toBe('flex-row');
    });
  });

  describe('getResponsivePadding', () => {
    it('should return mobile padding for mobile device', () => {
      const result = getResponsivePadding('sm', 'lg', DeviceType.MOBILE);
      expect(result).toBe('p-2');
    });

    it('should return desktop padding for desktop device', () => {
      const result = getResponsivePadding('sm', 'lg', DeviceType.DESKTOP);
      expect(result).toBe('p-6');
    });

    it('should handle all padding sizes', () => {
      expect(getResponsivePadding('md', 'md', DeviceType.MOBILE)).toBe('p-3');
      expect(getResponsivePadding('md', 'md', DeviceType.DESKTOP)).toBe('p-4');
      expect(getResponsivePadding('lg', 'sm', DeviceType.MOBILE)).toBe('p-4');
      expect(getResponsivePadding('lg', 'sm', DeviceType.DESKTOP)).toBe('p-3');
    });
  });

  describe('getResponsiveMargin', () => {
    it('should return mobile margin for mobile device', () => {
      const result = getResponsiveMargin('sm', 'lg', DeviceType.MOBILE);
      expect(result).toBe('m-2');
    });

    it('should return desktop margin for desktop device', () => {
      const result = getResponsiveMargin('sm', 'lg', DeviceType.DESKTOP);
      expect(result).toBe('m-6');
    });

    it('should handle all margin sizes', () => {
      expect(getResponsiveMargin('md', 'md', DeviceType.MOBILE)).toBe('m-3');
      expect(getResponsiveMargin('md', 'md', DeviceType.DESKTOP)).toBe('m-4');
      expect(getResponsiveMargin('lg', 'sm', DeviceType.MOBILE)).toBe('m-4');
      expect(getResponsiveMargin('lg', 'sm', DeviceType.DESKTOP)).toBe('m-3');
    });
  });

  describe('getResponsiveGap', () => {
    it('should return correct gap classes', () => {
      expect(getResponsiveGap('sm', 'lg', DeviceType.MOBILE)).toBe('gap-2');
      expect(getResponsiveGap('sm', 'lg', DeviceType.DESKTOP)).toBe('gap-6');
      expect(getResponsiveGap('md', 'md', DeviceType.MOBILE)).toBe('gap-4');
      expect(getResponsiveGap('md', 'md', DeviceType.DESKTOP)).toBe('gap-4');
    });
  });

  describe('getResponsiveWidth', () => {
    it('should return mobile width for mobile device', () => {
      const result = getResponsiveWidth('full', 'auto', DeviceType.MOBILE);
      expect(result).toBe('w-full');
    });

    it('should return desktop width for desktop device', () => {
      const result = getResponsiveWidth('full', 'auto', DeviceType.DESKTOP);
      expect(result).toBe('w-auto');
    });

    it('should handle custom width values', () => {
      const result = getResponsiveWidth('full', 'w-96', DeviceType.DESKTOP);
      expect(result).toBe('w-96');
    });

    it('should handle all predefined width options', () => {
      expect(getResponsiveWidth('fit', 'fit', DeviceType.MOBILE)).toBe('w-fit');
      expect(getResponsiveWidth('auto', 'auto', DeviceType.DESKTOP)).toBe('w-auto');
    });
  });

  describe('getResponsiveHeight', () => {
    it('should return mobile height for mobile device', () => {
      const result = getResponsiveHeight('auto', 'full', DeviceType.MOBILE);
      expect(result).toBe('h-auto');
    });

    it('should return desktop height for desktop device', () => {
      const result = getResponsiveHeight('auto', 'full', DeviceType.DESKTOP);
      expect(result).toBe('h-full');
    });

    it('should handle all height options', () => {
      expect(getResponsiveHeight('screen', 'screen', DeviceType.MOBILE)).toBe('h-screen');
      expect(getResponsiveHeight('full', 'auto', DeviceType.DESKTOP)).toBe('h-auto');
    });
  });

  describe('getResponsiveTextAlign', () => {
    it('should return mobile text alignment for mobile device', () => {
      const result = getResponsiveTextAlign('center', 'left', DeviceType.MOBILE);
      expect(result).toBe('text-center');
    });

    it('should return desktop text alignment for desktop device', () => {
      const result = getResponsiveTextAlign('center', 'left', DeviceType.DESKTOP);
      expect(result).toBe('text-left');
    });

    it('should handle all alignment options', () => {
      expect(getResponsiveTextAlign('right', 'right', DeviceType.MOBILE)).toBe('text-right');
      expect(getResponsiveTextAlign('left', 'center', DeviceType.DESKTOP)).toBe('text-center');
    });
  });

  describe('getResponsiveDisplay', () => {
    it('should return mobile display for mobile device', () => {
      const result = getResponsiveDisplay('block', 'flex', DeviceType.MOBILE);
      expect(result).toBe('block');
    });

    it('should return desktop display for desktop device', () => {
      const result = getResponsiveDisplay('block', 'flex', DeviceType.DESKTOP);
      expect(result).toBe('flex');
    });

    it('should handle all display options', () => {
      expect(getResponsiveDisplay('grid', 'hidden', DeviceType.MOBILE)).toBe('grid');
      expect(getResponsiveDisplay('hidden', 'grid', DeviceType.DESKTOP)).toBe('grid');
    });
  });

  describe('combineResponsiveClasses', () => {
    it('should combine multiple responsive class groups for mobile', () => {
      const combiner = combineResponsiveClasses(
        { mobile: 'p-2', desktop: 'p-4' },
        { mobile: 'text-sm', desktop: 'text-lg' },
        { mobile: 'flex-col', desktop: 'flex-row' }
      );
      
      const result = combiner(DeviceType.MOBILE);
      expect(result).toBe('p-2 text-sm flex-col');
    });

    it('should combine multiple responsive class groups for desktop', () => {
      const combiner = combineResponsiveClasses(
        { mobile: 'p-2', desktop: 'p-4' },
        { mobile: 'text-sm', desktop: 'text-lg' },
        { mobile: 'flex-col', desktop: 'flex-row' }
      );
      
      const result = combiner(DeviceType.DESKTOP);
      expect(result).toBe('p-4 text-lg flex-row');
    });

    it('should handle TV classes when provided', () => {
      const combiner = combineResponsiveClasses(
        { mobile: 'p-2', desktop: 'p-4', tv: 'p-6' },
        { mobile: 'text-sm', desktop: 'text-lg', tv: 'text-xl' }
      );
      
      const result = combiner(DeviceType.TV);
      expect(result).toBe('p-6 text-xl');
    });

    it('should fallback to desktop classes for TV when TV classes not provided', () => {
      const combiner = combineResponsiveClasses(
        { mobile: 'p-2', desktop: 'p-4' },
        { mobile: 'text-sm', desktop: 'text-lg' }
      );
      
      const result = combiner(DeviceType.TV);
      expect(result).toBe('p-4 text-lg');
    });
  });
});