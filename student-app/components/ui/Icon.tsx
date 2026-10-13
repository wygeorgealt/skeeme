import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type IconColorToken = 
  | 'primary' 
  | 'accent' 
  | 'muted' 
  | 'text' 
  | 'textSecondary' 
  | 'success' 
  | 'destructive' 
  | 'warning' 
  | 'white' 
  | 'border';

export const ICON_SIZES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
};

export interface IconProps extends Omit<LucideProps, 'size' | 'color'> {
  /** Lucide icon name (e.g. 'Search', 'ArrowLeft', 'BookOpen') */
  name?: keyof typeof LucideIcons;
  /** Direct Lucide Icon component reference */
  icon?: LucideIcon;
  /** Preset size ('xs'|'sm'|'md'|'lg'|'xl') or explicit pixel number */
  size?: IconSize;
  /** Semantic color token or custom color string */
  color?: IconColorToken | string;
  /** Stroke width in pixels. Defaults to 2 */
  strokeWidth?: number;
}

export function Icon({
  name,
  icon: IconComponentProp,
  size = 'md',
  color = 'text',
  strokeWidth = 2,
  style,
  ...rest
}: IconProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];

  // Resolve numerical size
  const resolvedSize = typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.md;

  // Resolve color
  const resolveColor = (c: IconColorToken | string): string => {
    switch (c) {
      case 'primary':
        return C.primary;
      case 'accent':
        return Palette.blue.accent;
      case 'muted':
        return C.textSecondary;
      case 'text':
        return C.text;
      case 'textSecondary':
        return C.textSecondary;
      case 'success':
        return C.success;
      case 'destructive':
        return C.destructive;
      case 'warning':
        return C.warning;
      case 'white':
        return '#FFFFFF';
      case 'border':
        return C.border;
      default:
        return c;
    }
  };

  const resolvedColor = resolveColor(color);

  // Resolve the Lucide icon component
  let ComponentToRender = IconComponentProp;
  if (!ComponentToRender && name) {
    ComponentToRender = LucideIcons[name] as LucideIcon | undefined;
  }

  if (!ComponentToRender) {
    return null;
  }

  return (
    <ComponentToRender
      size={resolvedSize}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      style={style}
      {...rest}
    />
  );
}

export default Icon;
