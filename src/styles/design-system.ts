// Design System Tokens
export const designTokens = {
  colors: {
    // Space Theme Colors
    spaceBlack: '#121212',
    spaceBlue: '#1e3a8a',
    issWhite: '#f8fafc',
    issHighlight: '#3b82f6',
    
    // Semantic Colors
    primary: '#3b82f6',
    secondary: '#1e3a8a',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Grays
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    
    // Opacity Variants
    spaceBlack80: 'rgba(18, 18, 18, 0.8)',
    spaceBlack90: 'rgba(18, 18, 18, 0.9)',
    spaceBlack95: 'rgba(18, 18, 18, 0.95)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white15: 'rgba(255, 255, 255, 0.15)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white30: 'rgba(255, 255, 255, 0.3)',
    white50: 'rgba(255, 255, 255, 0.5)',
    white80: 'rgba(255, 255, 255, 0.8)',
    white90: 'rgba(255, 255, 255, 0.9)',
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
  
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
      orbitron: '"Orbitron", sans-serif',
      exo: '"Exo 2", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
    },
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultra: '1536px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
} as const;

// Type exports for use in components
export type ColorToken = keyof typeof designTokens.colors;
export type SpacingToken = keyof typeof designTokens.spacing;
export type BreakpointToken = keyof typeof designTokens.breakpoints;
export type TypographyToken = keyof typeof designTokens.typography;

// Utility functions
export const getColor = (color: ColorToken): string => designTokens.colors[color];
export const getSpacing = (spacing: SpacingToken): string => designTokens.spacing[spacing];
export const getBreakpoint = (breakpoint: BreakpointToken): string => designTokens.breakpoints[breakpoint];

// Media query helpers
export const mediaQueries = {
  mobile: `@media (max-width: ${designTokens.breakpoints.mobile})`,
  tablet: `@media (min-width: ${designTokens.breakpoints.tablet})`,
  desktop: `@media (min-width: ${designTokens.breakpoints.desktop})`,
  wide: `@media (min-width: ${designTokens.breakpoints.wide})`,
  ultra: `@media (min-width: ${designTokens.breakpoints.ultra})`,
} as const;
