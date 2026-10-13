import { Platform } from 'react-native';

// ─── Standardized Skeeme Blue & Black Design System ─────────────────────────

export const Palette = {
  blue: {
    primary: '#007AFF',
    accent: '#0A84FF',
    lightContainer: '#E5F1FF',
    darkContainer: 'rgba(0, 122, 255, 0.18)',
    border: '#007AFF',
  },
  dark: {
    background: '#0B0C0E',
    surface: '#16181D',
    surfaceLow: '#20232B',
    surfaceElevated: '#282C37',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
  },
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceLow: '#F1F3F5',
    surfaceElevated: '#E9ECEF',
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.16)',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
  },
  semantic: {
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    destructive: '#EF4444',
    destructiveLight: 'rgba(239, 68, 68, 0.15)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.15)',
  },
};

export const Colors = {
  light: {
    // Backgrounds
    background: Palette.light.background,
    secondaryBackground: Palette.light.surface,
    card: Palette.light.surface,
    elevated: Palette.light.surfaceElevated,
    surfaceLow: Palette.light.surfaceLow,
    
    // Text
    text: Palette.light.textPrimary,
    textSecondary: Palette.light.textSecondary,
    textTertiary: Palette.light.textTertiary,
    
    // Brand / Primary Action
    primary: Palette.blue.primary,
    primaryAccent: Palette.blue.accent,
    primaryLight: Palette.blue.lightContainer,
    
    // Semantic
    destructive: Palette.semantic.destructive,
    success: Palette.semantic.success,
    successLight: Palette.semantic.successLight,
    warning: Palette.semantic.warning,
    
    // Separators & Borders
    separator: Palette.light.border,
    separatorOpaque: '#E2E8F0',
    border: Palette.light.border,
    borderStrong: Palette.light.borderStrong,
    
    // Icons
    icon: Palette.light.textSecondary,
    iconActive: Palette.blue.primary,
    tabIconDefault: Palette.light.textTertiary,
    tabIconSelected: Palette.blue.primary,

    // Card elevation
    cardShadowColor: '#000000',
    cardShadowOpacity: 0.04,
    cardShadowRadius: 8,
    cardShadowOffset: { width: 0, height: 2 },
    cardElevation: 1,

    // Aliases
    cardSecondary: Palette.light.surfaceLow,
    glassBorder: Palette.light.border,
    glassBackground: 'rgba(255, 255, 255, 0.88)',
  },
  dark: {
    // Backgrounds
    background: Palette.dark.background,
    secondaryBackground: Palette.dark.surface,
    card: Palette.dark.surface,
    elevated: Palette.dark.surfaceElevated,
    surfaceLow: Palette.dark.surfaceLow,
    
    // Text
    text: Palette.dark.textPrimary,
    textSecondary: Palette.dark.textSecondary,
    textTertiary: Palette.dark.textTertiary,
    
    // Brand / Primary Action
    primary: Palette.blue.primary,
    primaryAccent: Palette.blue.accent,
    primaryLight: Palette.blue.darkContainer,
    
    // Semantic
    destructive: Palette.semantic.destructive,
    success: Palette.semantic.success,
    successLight: Palette.semantic.successLight,
    warning: Palette.semantic.warning,
    
    // Separators & Borders
    separator: Palette.dark.border,
    separatorOpaque: '#282C37',
    border: Palette.dark.border,
    borderStrong: Palette.dark.borderStrong,
    
    // Icons
    icon: Palette.dark.textSecondary,
    iconActive: Palette.blue.primary,
    tabIconDefault: Palette.dark.textTertiary,
    tabIconSelected: Palette.blue.primary,

    // Card elevation
    cardShadowColor: '#000000',
    cardShadowOpacity: 0.35,
    cardShadowRadius: 10,
    cardShadowOffset: { width: 0, height: 3 },
    cardElevation: 3,

    // Aliases
    cardSecondary: Palette.dark.surfaceLow,
    glassBorder: Palette.dark.border,
    glassBackground: 'rgba(22, 24, 29, 0.88)',
  },
};

// ─── Spacing Grid (8pt base) ────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius ──────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999,
};

// ─── Typography Scale ───────────────────────────────────────────────────────
export const FontSize = {
  largeTitle: 34,
  title1: 28,
  title2: 22,
  title3: 20,
  headline: 17,
  body: 17,
  callout: 16,
  subhead: 15,
  footnote: 13,
  caption1: 12,
  caption2: 11,
};

// ─── Platform Fonts ─────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
