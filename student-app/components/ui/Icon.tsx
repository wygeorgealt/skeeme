import React, { useEffect } from 'react';
import * as LucideIcons from 'lucide-react-native';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withSpring,
  Easing 
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type IconColorToken = 
  | 'default'
  | 'neutral'
  | 'primary' 
  | 'active'
  | 'accent' 
  | 'secondary'
  | 'muted' 
  | 'text' 
  | 'textSecondary' 
  | 'textTertiary'
  | 'tertiary'
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

export type IconAnimationType = boolean | 'pulse' | 'bounce' | 'spin';

export interface IconProps extends Omit<LucideProps, 'size' | 'color'> {
  /** Lucide icon name (e.g. 'Search', 'ArrowLeft', 'BookOpen') */
  name?: keyof typeof LucideIcons;
  /** Direct Lucide Icon component reference */
  icon?: LucideIcon;
  /** Preset size ('xs'|'sm'|'md'|'lg'|'xl') or explicit pixel number */
  size?: IconSize;
  /** Semantic color token or custom color string. Defaults to 'default' (neutral dark / white) */
  color?: IconColorToken | string;
  /** Stroke width in pixels. Defaults to 2 */
  strokeWidth?: number;
  /** Optional smooth animation ('pulse' | 'bounce' | 'spin' | true) */
  animated?: IconAnimationType;
}

export function Icon({
  name,
  icon: IconComponentProp,
  size = 'md',
  color = 'default',
  strokeWidth = 2,
  animated = false,
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
      case 'default':
      case 'neutral':
      case 'text':
      case 'textPrimary':
        return C.icon;
      case 'secondary':
      case 'muted':
      case 'textSecondary':
        return C.iconSecondary;
      case 'tertiary':
      case 'textTertiary':
      case 'iconMuted':
        return C.iconTertiary;
      case 'primary':
      case 'active':
      case 'brand':
        return C.primary;
      case 'accent':
        return Palette.blue.accent;
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
        // Handle common accidental string tokens
        if (c === 'textTertiary' || c === 'tertiary') return C.iconTertiary;
        if (c === 'textSecondary' || c === 'muted' || c === 'secondary') return C.iconSecondary;
        if (c === 'textPrimary' || c === 'text' || c === 'default') return C.icon;
        if (c === 'primary' || c === 'active') return C.primary;
        return c;
    }
  };

  const resolvedColor = resolveColor(color);

  // Resolve the Lucide icon component
  let ComponentToRender = IconComponentProp;
  if (!ComponentToRender && name) {
    ComponentToRender = LucideIcons[name] as LucideIcon | undefined;
  }

  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      scale.value = 1;
      rotation.value = 0;
      translateY.value = 0;
      return;
    }

    if (animated === 'spin') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
    } else if (animated === 'bounce') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      );
    } else {
      // 'pulse' or true: subtle gentle scale pulse
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  if (!ComponentToRender) {
    return null;
  }

  const iconElement = (
    <ComponentToRender
      size={resolvedSize}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      style={!animated ? style : undefined}
      {...rest}
    />
  );

  if (animated) {
    return (
      <Animated.View style={[animatedStyle, style]}>
        {iconElement}
      </Animated.View>
    );
  }

  return iconElement;
}

export default Icon;
