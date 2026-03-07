// FreeDueda Design System — v3
// Palette: Neutral Grey/White (Fintech clean) | Trading: #00C851 (green) / #FF4444 (red)
// Light/Dark via DarkColors / LightColors exports
// Backwards compat: `Colors` = DarkColors (all existing imports stay valid)

// ─── Color factories ────────────────────────────────────────────────────────

const shared = {
  // Brand — neutral dark slate
  primary:           '#374151',
  primaryLight:      '#4B5563',
  primaryDark:       '#1F2937',
  primaryGlow:       'rgba(55, 65, 81, 0.20)',
  primaryGlowStrong: 'rgba(55, 65, 81, 0.35)',

  // Trading green (positive)
  positive:          '#00C851',
  positiveLight:     '#33D975',
  positiveDark:      '#00A040',
  positiveGlow:      'rgba(0, 200, 81, 0.18)',

  // Trading red (negative / alert)
  alert:             '#FF4444',
  alertLight:        '#FF8888',
  alertDark:         '#CC2222',
  alertGlow:         'rgba(255, 68, 68, 0.18)',

  // Warning (unchanged)
  warning:           '#FFB800',
  warningLight:      '#FCD34D',
  warningDark:       '#D97706',
  warningGlow:       'rgba(255, 184, 0, 0.18)',

  // Info (unchanged)
  info:              '#3B82F6',

  // Semantic aliases
  success:           '#00C851',
  error:             '#FF4444',

  // Gradients
  gradientPrimary:        ['#374151', '#4B5563'] as const,
  gradientPrimaryReverse: ['#4B5563', '#374151'] as const,
  gradientCard:           ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)'] as const,
};

export const DarkColors = {
  ...shared,

  // Backgrounds
  background:    '#0F1117',
  backgroundAlt: '#161B22',
  surface:       'rgba(255, 255, 255, 0.06)',
  surfaceAlt:    'rgba(255, 255, 255, 0.10)',
  surfaceHover:  'rgba(255, 255, 255, 0.14)',
  surfaceLight:  '#1C2028',
  cardWhite:     '#1E2230',

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textMuted:     'rgba(255, 255, 255, 0.38)',
  textOnGreen:   '#FFFFFF',        // texto sobre primary (mantener nombre por compat)
  textOnPrimary: '#FFFFFF',        // alias explícito
  textDark:      '#0F1117',
  textDarkSecondary: '#374151',

  // Borders
  border:       'rgba(255, 255, 255, 0.10)',
  borderFocus:  'rgba(55, 65, 81, 0.50)',
  borderGreen:  'rgba(55, 65, 81, 0.30)',

  // Gradients dark-specific
  gradientDark:      ['#0F1117', '#161B22'] as const,
  gradientDarkGreen: ['#0F1117', '#161B22'] as const,
  gradientGreen:     ['rgba(55,65,81,0.15)', 'rgba(55,65,81,0.03)'] as const,
};

export const LightColors = {
  ...shared,

  // Backgrounds
  background:    '#F9FAFB',
  backgroundAlt: '#F3F4F6',
  surface:       'rgba(0, 0, 0, 0.04)',
  surfaceAlt:    'rgba(0, 0, 0, 0.08)',
  surfaceHover:  'rgba(0, 0, 0, 0.12)',
  surfaceLight:  '#FFFFFF',
  cardWhite:     '#FFFFFF',

  // Text
  textPrimary:   '#111827',
  textSecondary: 'rgba(17, 24, 39, 0.65)',
  textMuted:     'rgba(17, 24, 39, 0.40)',
  textOnGreen:   '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textDark:      '#111827',
  textDarkSecondary: '#374151',

  // Borders
  border:       'rgba(0, 0, 0, 0.08)',
  borderFocus:  'rgba(55, 65, 81, 0.40)',
  borderGreen:  'rgba(55, 65, 81, 0.25)',

  // Gradients light-specific
  gradientDark:      ['#F9FAFB', '#F3F4F6'] as const,
  gradientDarkGreen: ['#F9FAFB', '#F3F4F6'] as const,
  gradientGreen:     ['rgba(55,65,81,0.08)', 'rgba(55,65,81,0.02)'] as const,
};

// ── Backwards-compatible static export (all existing imports keep working) ──
export const Colors = DarkColors;

// ─── Typography ─────────────────────────────────────────────────────────────

export const Typography = {
  heading: 'System',
  body:    'System',
  mono:    'SpaceMono',

  size: {
    xs:   10,
    sm:   12,
    md:   14,
    lg:   16,
    xl:   18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },

  weight: {
    normal:    '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
  },

  lineHeight: {
    tight:   1.1,
    normal:  1.4,
    relaxed: 1.6,
  },

  tracking: {
    tight:   -0.5,
    normal:  0,
    wide:    0.5,
    wider:   1,
    widest:  1.5,
  },
};

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// ─── Border Radius ────────────────────────────────────────────────────────────

export const BorderRadius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor:  '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor:  '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor:  '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  purple: {
    shadowColor:  '#374151',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 8,
  },
  // Keep 'green' name for backwards compat — now slate grey
  green: {
    shadowColor:  '#374151',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor:  color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  }),
};

// ─── Animation ───────────────────────────────────────────────────────────────

export const Animation = {
  duration: {
    fast:   150,
    normal: 250,
    slow:   350,
    splash: 600,
  },
  spring: {
    damping:   18,
    stiffness: 280,
    mass:      1,
  },
};
