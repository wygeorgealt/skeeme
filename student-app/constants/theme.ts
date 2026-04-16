import { Platform } from 'react-native';

// ─── iOS HIG Design System ────────────────────────────────────────────────────

export const Colors = {
  light: {
    // Backgrounds
    background: '#F2F2F7',
    secondaryBackground: '#FFFFFF',
    card: '#FFFFFF',
    elevated: '#E5E5EA',
    
    // Text
    text: '#000000',
    textSecondary: '#6D6D72',
    textTertiary: '#8E8E93',
    
    // Brand / Primary Action
    primary: '#007AFF',
    primaryLight: 'rgba(0, 122, 255, 0.1)',
    
    // Semantic
    destructive: '#FF3B30',
    success: '#34C759',
    successLight: 'rgba(52, 199, 89, 0.15)',
    warning: '#FF9500',
    
    // Separators
    separator: 'rgba(60, 60, 67, 0.29)',
    separatorOpaque: '#E5E5EA',
    
    // Icons
    icon: '#6D6D72',
    iconActive: '#007AFF',
    tabIconDefault: '#6D6D72',
    tabIconSelected: '#007AFF',
    // Backwards-compatible aliases
    cardSecondary: '#F2F2F7',
    glassBorder: 'rgba(0,0,0,0.04)',
    glassBackground: 'rgba(255,255,255,0.85)',
  },
  dark: {
    // Backgrounds
    background: '#000000',
    secondaryBackground: '#121212',
    card: '#1C1C1E',
    elevated: '#2C2C2E',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#A1A1A6',
    textTertiary: '#8E8E93',
    
    // Brand / Primary Action
    primary: '#007AFF',
    primaryLight: 'rgba(0, 122, 255, 0.2)',
    
    // Semantic
    destructive: '#FF453A',
    success: '#30D158',
    successLight: 'rgba(48, 209, 88, 0.15)',
    warning: '#FFD60A',
    
    // Separators
    separator: 'rgba(84, 84, 88, 0.65)',
    separatorOpaque: '#38383A',
    
    // Icons
    icon: '#A1A1A6',
    iconActive: '#007AFF',
    tabIconDefault: '#A1A1A6',
    tabIconSelected: '#007AFF',
    // Backwards-compatible aliases
    cardSecondary: '#2C2C2E',
    glassBorder: 'rgba(255,255,255,0.08)',
    glassBackground: 'rgba(28, 28, 30, 0.65)',
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

