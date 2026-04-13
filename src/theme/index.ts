// Theme tokens for UPSC Pathfinder
// Dark study theme — optimized for long reading sessions

export const colors = {
  // Backgrounds
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A24',
  surfaceCard: '#1E1E2A',

  // Brand / Accent
  primary: '#6366F1',     // Indigo — main accent
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0A0A0F',

  // Progress
  progressTrack: '#2A2A3A',
  progressFill: '#6366F1',

  // Borders
  border: '#2A2A3A',
  borderLight: '#3A3A4A',

  // Misc
  overlay: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(99,102,241,0.15)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  // Font sizes
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  overline: 11,
  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
};
