import React, { ReactNode } from 'react';
import { useDevice } from '../../../state/DeviceContext';

// Base responsive wrapper component props
interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
}

// MobileOnly component - only renders on mobile devices
export const MobileOnly: React.FC<ResponsiveWrapperProps> = ({ children, className = '' }) => {
  const { isMobile } = useDevice();
  
  if (!isMobile) return null;
  
  return (
    <div className={`mobile-only ${className}`}>
      {children}
    </div>
  );
};

// DesktopOnly component - only renders on desktop devices
export const DesktopOnly: React.FC<ResponsiveWrapperProps> = ({ children, className = '' }) => {
  const { isDesktop } = useDevice();
  
  if (!isDesktop) return null;
  
  return (
    <div className={`desktop-only ${className}`}>
      {children}
    </div>
  );
};

// TVOnly component - only renders on TV devices (future support)
export const TVOnly: React.FC<ResponsiveWrapperProps> = ({ children, className = '' }) => {
  const { isTV } = useDevice();
  
  if (!isTV) return null;
  
  return (
    <div className={`tv-only ${className}`}>
      {children}
    </div>
  );
};

// Responsive Grid component with device-specific configurations
interface ResponsiveGridProps {
  children: ReactNode;
  mobileColumns?: 1 | 2;
  desktopColumns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  mobileColumns = 1,
  desktopColumns = 2,
  gap = 'md',
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  const getGridClasses = () => {
    const baseClasses = 'grid';
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    };
    
    if (isMobile) {
      const mobileGridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2'
      };
      return `${baseClasses} ${mobileGridClasses[mobileColumns]} ${gapClasses[gap]}`;
    } else {
      const desktopGridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
      };
      return `${baseClasses} ${desktopGridClasses[desktopColumns]} ${gapClasses[gap]}`;
    }
  };
  
  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Flex component with device-specific configurations
interface ResponsiveFlexProps {
  children: ReactNode;
  mobileDirection?: 'row' | 'col';
  desktopDirection?: 'row' | 'col';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  mobileDirection = 'col',
  desktopDirection = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  const getFlexClasses = () => {
    const baseClasses = 'flex';
    
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col'
    };
    
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end'
    };
    
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between'
    };
    
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    };
    
    const direction = isMobile ? mobileDirection : desktopDirection;
    
    return `${baseClasses} ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} ${gapClasses[gap]}`;
  };
  
  return (
    <div className={`${getFlexClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Container component with device-specific padding and max-width
interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  const getContainerClasses = () => {
    const baseClasses = 'w-full mx-auto';
    
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full'
    };
    
    const paddingClasses = {
      sm: isMobile ? 'px-2' : 'px-4',
      md: isMobile ? 'px-3' : 'px-6',
      lg: isMobile ? 'px-4' : 'px-8'
    };
    
    return `${baseClasses} ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`;
  };
  
  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Device-specific styling helper component
interface DeviceStyleProps {
  children: ReactNode;
  mobileClassName?: string;
  desktopClassName?: string;
  tvClassName?: string;
  baseClassName?: string;
}

export const DeviceStyle: React.FC<DeviceStyleProps> = ({
  children,
  mobileClassName = '',
  desktopClassName = '',
  tvClassName = '',
  baseClassName = ''
}) => {
  const { isMobile, isDesktop, isTV } = useDevice();
  
  const getDeviceClasses = () => {
    let classes = baseClassName;
    
    if (isMobile && mobileClassName) {
      classes += ` ${mobileClassName}`;
    } else if (isDesktop && desktopClassName) {
      classes += ` ${desktopClassName}`;
    } else if (isTV && tvClassName) {
      classes += ` ${tvClassName}`;
    }
    
    return classes.trim();
  };
  
  return (
    <div className={getDeviceClasses()}>
      {children}
    </div>
  );
};

// Responsive spacing helper component
interface ResponsiveSpacingProps {
  children: ReactNode;
  mobilePadding?: string;
  desktopPadding?: string;
  mobileMargin?: string;
  desktopMargin?: string;
  className?: string;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  mobilePadding = '',
  desktopPadding = '',
  mobileMargin = '',
  desktopMargin = '',
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  const getSpacingClasses = () => {
    let classes = className;
    
    if (isMobile) {
      if (mobilePadding) classes += ` ${mobilePadding}`;
      if (mobileMargin) classes += ` ${mobileMargin}`;
    } else {
      if (desktopPadding) classes += ` ${desktopPadding}`;
      if (desktopMargin) classes += ` ${desktopMargin}`;
    }
    
    return classes.trim();
  };
  
  return (
    <div className={getSpacingClasses()}>
      {children}
    </div>
  );
};