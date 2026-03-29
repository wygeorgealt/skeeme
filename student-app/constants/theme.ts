import { Platform } from 'react-native';

// ─── iOS HIG Design System ────────────────────────────────────────────────────

export const Colors = {
  light: {
    // Backgrounds
    background: '#F2F2F7',
    card: '#FFFFFF',
    cardSecondary: '#F2F2F7',
    // Text
    text: '#111111',
    textSecondary: '#6E6E73',
    textTertiary: '#AEAEB2',
    // Brand / Primary
    primary: '#007AFF',
    // Semantic
    destructive: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    // Separators
    separator: 'rgba(60,60,67,0.12)',
    separatorOpaque: '#C6C6C8',
    // Tab bar
    tabBar: 'rgba(255,255,255,0.80)',
    tabBarBorder: 'rgba(60,60,67,0.12)',
    // Icon
    icon: '#6E6E73',
    iconActive: '#007AFF',
    // Legacy tint
    tint: '#007AFF',
    tabIconDefault: '#6E6E73',
    tabIconSelected: '#007AFF',
  },
  dark: {
    // Backgrounds
    background: '#000000',
    card: '#1C1C1E',
    cardSecondary: '#2C2C2E',
    // Text
    text: '#FFFFFF',
    textSecondary: '#A1A1A6',
    textTertiary: '#636366',
    // Brand / Primary
    primary: '#0A84FF',
    // Semantic
    destructive: '#FF453A',
    success: '#30D158',
    warning: '#FFD60A',
    // Separators
    separator: 'rgba(84,84,88,0.40)',
    separatorOpaque: '#38383A',
    // Tab bar
    tabBar: 'rgba(28,28,30,0.80)',
    tabBarBorder: 'rgba(84,84,88,0.40)',
    // Icon
    icon: '#A1A1A6',
    iconActive: '#0A84FF',
    // Legacy tint
    tint: '#0A84FF',
    tabIconDefault: '#A1A1A6',
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

