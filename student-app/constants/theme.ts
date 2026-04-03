import { Platform } from 'react-native';

// ─── iOS HIG Design System ────────────────────────────────────────────────────

export const Colors = {
  light: {
    // Backgrounds
    background: 'transparent', // Let GlowBackground shine through seamlessly
    card: '#FFFFFF',
    cardSecondary: '#F8FAFF', // Slightly tinted white
    // Text
    text: '#0F172A', // Deep slate for better contrast than true black
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    // Brand / Primary
    primary: '#007AFF',
    primaryLight: '#E5F1FF',
    // Semantic
    destructive: '#FF3B30',
    success: '#34C759',
    successLight: '#E8F5E9',
    warning: '#FF9500',
    // Separators
    separator: 'rgba(15,23,42,0.06)',
    separatorOpaque: '#E2E8F0',
    // Effects
    glassBorder: 'rgba(0,0,0,0.04)',
    glassBackground: 'rgba(255,255,255,0.85)',
    // Icon
    icon: '#64748B',
    iconActive: '#007AFF',
    tabIconDefault: '#64748B',
    tabIconSelected: '#007AFF',
  },
  dark: {
    // Backgrounds (Silvery Liquid Dark)
    background: 'transparent', // Let GlowBackground shine through seamlessly
    card: 'rgba(255, 255, 255, 0.03)', // Translucent glass effect
    cardSecondary: 'rgba(255, 255, 255, 0.06)',
    // Text
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    // Brand / Primary
    primary: '#0A84FF',
    primaryLight: 'rgba(10, 132, 255, 0.15)',
    // Semantic
    destructive: '#FF453A',
    success: '#30D158',
    successLight: 'rgba(48, 209, 88, 0.15)',
    warning: '#FFD60A',
    // Separators
    separator: 'rgba(255, 255, 255, 0.06)',
    separatorOpaque: '#27272A',
    // Effects (The Liquid Silver Magic)
    glassBorder: 'rgba(255, 255, 255, 0.12)', // Shiny inner borders
    glassBackground: 'rgba(24, 24, 27, 0.65)',
    // Icon
    icon: '#A1A1AA',
    iconActive: '#0A84FF',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: '#0A84FF',
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
  pill: 100,
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

