// DebtMap Premium Dark Theme
// Inspired by Uber, Robinhood, Linear

export const Colors = {
  // Background colors
  background: '#0A0A0F',
  surface: '#111118',
  surfaceAlt: '#16161F',
  surfaceHover: '#1A1A24',
  
  // Primary accent - Electric Cyan (like Uber GPS)
  primary: '#00D4FF',
  primaryDark: '#00A3CC',
  primaryLight: '#33DDFF',
  primaryGlow: 'rgba(0, 212, 255, 0.3)',
  
  // Positive - Green (savings achieved)
  positive: '#00E676',
  positiveLight: '#69F0AE',
  positiveDark: '#00C853',
  positiveGlow: 'rgba(0, 230, 118, 0.2)',
  
  // Alert - Orange (interest paid)
  alert: '#FF6B35',
  alertLight: '#FF8A65',
  alertDark: '#E64A19',
  alertGlow: 'rgba(255, 107, 53, 0.2)',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8B9E',
  textMuted: '#5C5C6F',
  
  // Border & dividers
  border: 'rgba(255, 255, 255, 0.08)',
  borderFocus: 'rgba(0, 212, 255, 0.5)',
  
  // Status colors
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF5252',
  info: '#00D4FF',
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#00D4FF', '#0099CC'],
  gradientPositive: ['#00E676', '#00C853'],
  gradientDark: ['#0A0A0F', '#16161F'],
};

export const Typography = {
  // Font families
  mono: 'SpaceMono',  // For financial numbers
  body: 'System',      // System font for body text
  
  // Font sizes
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
  
  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  }),
};
