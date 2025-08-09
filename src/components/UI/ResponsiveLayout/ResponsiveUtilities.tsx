import React, { ReactNode, memo, useMemo, useCallback } from 'react';
import { useDevice } from '../../../state/DeviceContext';

// Responsive text component with device-specific font sizes
interface ResponsiveTextProps {
  children: ReactNode;
  mobileSize?: 'xs' | 'sm' | 'base' | 'lg';
  desktopSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = memo(({
  children,
  mobileSize = 'sm',
  desktopSize = 'base',
  weight = 'normal',
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  // Memoize class mappings to prevent recreation
  const sizeClasses = useMemo(() => ({
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  }), []);
  
  const weightClasses = useMemo(() => ({
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }), []);
  
  // Memoize computed classes
  const computedClasses = useMemo(() => {
    const size = isMobile ? mobileSize : desktopSize;
    return `${sizeClasses[size]} ${weightClasses[weight]} ${className}`;
  }, [isMobile, mobileSize, desktopSize, weight, className, sizeClasses, weightClasses]);
  
  return (
    <span className={computedClasses}>
      {children}
    </span>
  );
});

// Responsive button component with device-specific sizing
interface ResponsiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  mobileSize?: 'sm' | 'md' | 'lg';
  desktopSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = memo(({
  children,
  onClick,
  variant = 'primary',
  mobileSize = 'md',
  desktopSize = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  // Memoize class mappings
  const baseClasses = useMemo(() => 
    'rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2', []);
  
  const variantClasses = useMemo(() => ({
    primary: 'bg-iss-highlight text-white hover:bg-blue-700 focus:ring-iss-highlight',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-gray-700 text-gray-300 hover:bg-gray-700 focus:ring-gray-500'
  }), []);
  
  const sizeClasses = useMemo(() => ({
    sm: isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
    md: isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-base',
    lg: isMobile ? 'px-4 py-2 text-base' : 'px-6 py-3 text-lg'
  }), [isMobile]);
  
  // Memoize computed classes
  const computedClasses = useMemo(() => {
    const size = isMobile ? mobileSize : desktopSize;
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;
  }, [baseClasses, variantClasses, sizeClasses, variant, isMobile, mobileSize, desktopSize, fullWidth, disabled, className]);
  
  // Memoize click handler to prevent recreation
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={computedClasses}
    >
      {children}
    </button>
  );
});

// Responsive card component with device-specific padding and spacing
interface ResponsiveCardProps {
  children: ReactNode;
  mobilePadding?: 'sm' | 'md' | 'lg';
  desktopPadding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
  className?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = memo(({
  children,
  mobilePadding = 'md',
  desktopPadding = 'lg',
  shadow = true,
  border = true,
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  // Memoize class mappings
  const baseClasses = useMemo(() => 'rounded-lg bg-space-blue/30 backdrop-blur-sm', []);
  
  const paddingClasses = useMemo(() => ({
    sm: isMobile ? 'p-2' : 'p-3',
    md: isMobile ? 'p-3' : 'p-4',
    lg: isMobile ? 'p-4' : 'p-6'
  }), [isMobile]);
  
  // Memoize computed classes
  const computedClasses = useMemo(() => {
    const padding = isMobile ? mobilePadding : desktopPadding;
    const shadowClass = shadow ? 'shadow-md' : '';
    const borderClass = border ? 'border border-gray-700' : '';
    
    return `${baseClasses} ${paddingClasses[padding]} ${shadowClass} ${borderClass} ${className}`;
  }, [baseClasses, paddingClasses, isMobile, mobilePadding, desktopPadding, shadow, border, className]);
  
  return (
    <div className={computedClasses}>
      {children}
    </div>
  );
});

// Responsive list component with device-specific spacing
interface ResponsiveListProps {
  children: ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const ResponsiveList: React.FC<ResponsiveListProps> = memo(({
  children,
  spacing = 'normal',
  orientation = 'vertical',
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  // Memoize base classes
  const baseClasses = useMemo(() => 
    orientation === 'horizontal' ? 'flex' : 'space-y-2', [orientation]);
  
  // Memoize spacing classes
  const spacingClasses = useMemo(() => ({
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    loose: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4'
  }), [orientation]);
  
  const mobileSpacingClasses = useMemo(() => ({
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    loose: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3'
  }), [orientation]);
  
  // Memoize computed classes
  const computedClasses = useMemo(() => {
    const spacingClass = isMobile ? mobileSpacingClasses[spacing] : spacingClasses[spacing];
    return `${baseClasses} ${spacingClass} ${className}`;
  }, [baseClasses, isMobile, mobileSpacingClasses, spacingClasses, spacing, className]);
  
  return (
    <div className={computedClasses}>
      {children}
    </div>
  );
});

// Responsive image component with device-specific sizing
interface ResponsiveImageProps {
  src: string;
  alt: string;
  mobileSize?: 'sm' | 'md' | 'lg' | 'full';
  desktopSize?: 'sm' | 'md' | 'lg' | 'full';
  aspectRatio?: 'square' | 'video' | 'auto';
  className?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = memo(({
  src,
  alt,
  mobileSize = 'full',
  desktopSize = 'full',
  aspectRatio = 'auto',
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  // Memoize class mappings
  const sizeClasses = useMemo(() => ({
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    full: 'w-full h-auto'
  }), []);
  
  const aspectRatioClasses = useMemo(() => ({
    square: 'aspect-square object-cover',
    video: 'aspect-video object-cover',
    auto: 'object-contain'
  }), []);
  
  // Memoize computed classes
  const computedClasses = useMemo(() => {
    const size = isMobile ? mobileSize : desktopSize;
    return `${sizeClasses[size]} ${aspectRatioClasses[aspectRatio]} rounded-md ${className}`;
  }, [sizeClasses, aspectRatioClasses, isMobile, mobileSize, desktopSize, aspectRatio, className]);
  
  return (
    <img
      src={src}
      alt={alt}
      className={computedClasses}
    />
  );
});

// Responsive modal/dialog component
interface ResponsiveModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  mobileFullScreen?: boolean;
  className?: string;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = memo(({
  children,
  isOpen,
  onClose,
  title,
  mobileFullScreen = false,
  className = ''
}) => {
  const { isMobile } = useDevice();
  
  // Memoize modal classes
  const modalClasses = useMemo(() => {
    const baseClasses = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    const backdropClasses = 'fixed inset-0 bg-black bg-opacity-50';
    
    const contentClasses = isMobile && mobileFullScreen
      ? 'w-full h-full bg-space-black rounded-none'
      : isMobile
      ? 'w-full max-w-sm bg-space-blue/90 backdrop-blur-sm rounded-lg'
      : 'w-full max-w-md bg-space-blue/90 backdrop-blur-sm rounded-lg';
    
    return { baseClasses, backdropClasses, contentClasses };
  }, [isMobile, mobileFullScreen]);
  
  // Memoize close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  if (!isOpen) return null;
  
  const { baseClasses, backdropClasses, contentClasses } = modalClasses;
  
  return (
    <div className={baseClasses}>
      <div className={backdropClasses} onClick={handleClose} />
      <div className={`${contentClasses} ${className} relative z-10`}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
});