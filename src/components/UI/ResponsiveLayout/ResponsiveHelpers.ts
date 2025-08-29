import { DeviceType } from '../../../state/DeviceContext';

// Device-specific styling helper functions
export const getResponsiveClasses = (
  mobileClasses: string,
  desktopClasses: string,
  tvClasses: string = '',
  deviceType: DeviceType
): string => {
  switch (deviceType) {
    case DeviceType.MOBILE:
      return mobileClasses;
    case DeviceType.TV:
      return tvClasses || desktopClasses;
    case DeviceType.DESKTOP:
    default:
      return desktopClasses;
  }
};

// Responsive spacing helper
export const getResponsiveSpacing = (
  mobileSpacing: string,
  desktopSpacing: string,
  deviceType: DeviceType
): string => {
  return deviceType === DeviceType.MOBILE ? mobileSpacing : desktopSpacing;
};

// Responsive font size helper
export const getResponsiveFontSize = (
  mobileFontSize: string,
  desktopFontSize: string,
  deviceType: DeviceType
): string => {
  return deviceType === DeviceType.MOBILE ? mobileFontSize : desktopFontSize;
};

// Responsive layout helper
export const getResponsiveLayout = (
  mobileLayout: 'flex' | 'grid' | 'block',
  desktopLayout: 'flex' | 'grid' | 'block',
  deviceType: DeviceType
): string => {
  const layout = deviceType === DeviceType.MOBILE ? mobileLayout : desktopLayout;
  
  const layoutClasses = {
    flex: 'flex',
    grid: 'grid',
    block: 'block'
  };
  
  return layoutClasses[layout];
};

// Responsive grid columns helper
export const getResponsiveGridCols = (
  mobileColumns: 1 | 2,
  desktopColumns: 1 | 2 | 3 | 4,
  deviceType: DeviceType
): string => {
  const columns = deviceType === DeviceType.MOBILE ? mobileColumns : desktopColumns;
  
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };
  
  return gridClasses[columns];
};

// Responsive flex direction helper
export const getResponsiveFlexDirection = (
  mobileDirection: 'row' | 'col',
  desktopDirection: 'row' | 'col',
  deviceType: DeviceType
): string => {
  const direction = deviceType === DeviceType.MOBILE ? mobileDirection : desktopDirection;
  
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };
  
  return directionClasses[direction];
};

// Responsive padding helper
export const getResponsivePadding = (
  mobilePadding: 'sm' | 'md' | 'lg',
  desktopPadding: 'sm' | 'md' | 'lg',
  deviceType: DeviceType
): string => {
  const padding = deviceType === DeviceType.MOBILE ? mobilePadding : desktopPadding;
  
  const paddingClasses = {
    sm: deviceType === DeviceType.MOBILE ? 'p-2' : 'p-3',
    md: deviceType === DeviceType.MOBILE ? 'p-3' : 'p-4',
    lg: deviceType === DeviceType.MOBILE ? 'p-4' : 'p-6'
  };
  
  return paddingClasses[padding];
};

// Responsive margin helper
export const getResponsiveMargin = (
  mobileMargin: 'sm' | 'md' | 'lg',
  desktopMargin: 'sm' | 'md' | 'lg',
  deviceType: DeviceType
): string => {
  const margin = deviceType === DeviceType.MOBILE ? mobileMargin : desktopMargin;
  
  const marginClasses = {
    sm: deviceType === DeviceType.MOBILE ? 'm-2' : 'm-3',
    md: deviceType === DeviceType.MOBILE ? 'm-3' : 'm-4',
    lg: deviceType === DeviceType.MOBILE ? 'm-4' : 'm-6'
  };
  
  return marginClasses[margin];
};

// Responsive gap helper
export const getResponsiveGap = (
  mobileGap: 'sm' | 'md' | 'lg',
  desktopGap: 'sm' | 'md' | 'lg',
  deviceType: DeviceType
): string => {
  const gap = deviceType === DeviceType.MOBILE ? mobileGap : desktopGap;
  
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  return gapClasses[gap];
};

// Responsive width helper
export const getResponsiveWidth = (
  mobileWidth: 'full' | 'auto' | 'fit',
  desktopWidth: 'full' | 'auto' | 'fit' | string,
  deviceType: DeviceType
): string => {
  const width = deviceType === DeviceType.MOBILE ? mobileWidth : desktopWidth;
  
  const widthClasses: Record<string, string> = {
    full: 'w-full',
    auto: 'w-auto',
    fit: 'w-fit'
  };
  
  return widthClasses[width] || width;
};

// Responsive height helper
export const getResponsiveHeight = (
  mobileHeight: 'auto' | 'full' | 'screen',
  desktopHeight: 'auto' | 'full' | 'screen',
  deviceType: DeviceType
): string => {
  const height = deviceType === DeviceType.MOBILE ? mobileHeight : desktopHeight;
  
  const heightClasses = {
    auto: 'h-auto',
    full: 'h-full',
    screen: 'h-screen'
  };
  
  return heightClasses[height];
};

// Responsive text alignment helper
export const getResponsiveTextAlign = (
  mobileAlign: 'left' | 'center' | 'right',
  desktopAlign: 'left' | 'center' | 'right',
  deviceType: DeviceType
): string => {
  const align = deviceType === DeviceType.MOBILE ? mobileAlign : desktopAlign;
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return alignClasses[align];
};

// Responsive display helper
export const getResponsiveDisplay = (
  mobileDisplay: 'block' | 'flex' | 'grid' | 'hidden',
  desktopDisplay: 'block' | 'flex' | 'grid' | 'hidden',
  deviceType: DeviceType
): string => {
  const display = deviceType === DeviceType.MOBILE ? mobileDisplay : desktopDisplay;
  
  const displayClasses = {
    block: 'block',
    flex: 'flex',
    grid: 'grid',
    hidden: 'hidden'
  };
  
  return displayClasses[display];
};

// Utility to combine multiple responsive classes
export const combineResponsiveClasses = (
  ...classGroups: Array<{ mobile: string; desktop: string; tv?: string }>
): ((deviceType: DeviceType) => string) => {
  return (deviceType: DeviceType) => {
    return classGroups
      .map(group => getResponsiveClasses(group.mobile, group.desktop, group.tv, deviceType))
      .join(' ');
  };
};