import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';
import type { IconProps } from '@/components/ui/Icon';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Glass } from './Glass';

interface LiquidGlassIconButtonProps {
  accessibilityLabel: string;
  icon: IconProps['name'];
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function LiquidGlassIconButton({
  accessibilityLabel,
  icon,
  onPress,
  size = 56,
  style,
}: LiquidGlassIconButtonProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Glass
        interactive
        fallbackColor={isDark ? '#292A2D' : '#E5E5EA'}
        fallbackStyle={[
          styles.fallback,
          isDark ? styles.darkFallback : styles.lightFallback,
        ]}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
      <Icon name={icon} size={32} strokeWidth={2} color="default" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: { borderWidth: StyleSheet.hairlineWidth },
  lightFallback: {
    borderColor: 'rgba(60,60,67,0.24)',
  },
  darkFallback: {
    borderColor: 'rgba(255,255,255,0.24)',
  },
  pressed: {
    opacity: 0.72,
  },
});
