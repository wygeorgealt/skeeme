import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable, type GlassStyle } from 'expo-glass-effect';
import { AccessibilityInfo, Platform, StyleSheet, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';
import { useEffect, useState, type ReactNode } from 'react';

interface GlassProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fallbackStyle?: StyleProp<ViewStyle>;
  fallbackColor: ColorValue;
  tintColor?: ColorValue;
  glassEffectStyle?: GlassStyle;
  interactive?: boolean;
}

interface AccessibilityState {
  reduceTransparency: boolean;
  reduceMotion: boolean;
  highTextContrast: boolean;
}

export function Glass({
  children,
  style,
  fallbackStyle,
  fallbackColor,
  tintColor,
  glassEffectStyle = 'regular',
  interactive = false,
}: GlassProps) {
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    reduceTransparency: false,
    reduceMotion: false,
    highTextContrast: false,
  });

  useEffect(() => {
    let active = true;
    const update = (key: keyof AccessibilityState, value: boolean) => {
      if (active) setAccessibility((current) => ({ ...current, [key]: value }));
    };

    const subscriptions = [
      AccessibilityInfo.addEventListener('reduceMotionChanged', (value) =>
        update('reduceMotion', value),
      ),
    ];

    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceTransparencyEnabled().then(
        (value) => update('reduceTransparency', value),
        (error: unknown) => console.warn('[Glass] Could not read Reduce Transparency setting:', error),
      );
      subscriptions.push(
        AccessibilityInfo.addEventListener('reduceTransparencyChanged', (value) =>
          update('reduceTransparency', value),
        ),
      );
    }
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => update('reduceMotion', value),
      (error: unknown) => console.warn('[Glass] Could not read Reduce Motion setting:', error),
    );

    if (Platform.OS === 'android') {
      AccessibilityInfo.isHighTextContrastEnabled().then(
        (value) => update('highTextContrast', value),
        (error: unknown) => console.warn('[Glass] Could not read High Text Contrast setting:', error),
      );
      subscriptions.push(
        AccessibilityInfo.addEventListener('highTextContrastChanged', (value) =>
          update('highTextContrast', value),
        ),
      );
    }

    return () => {
      active = false;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  const nativeGlassAvailable =
    Platform.OS === 'ios' &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable() &&
    !accessibility.reduceTransparency;

  if (nativeGlassAvailable) {
    return (
      <GlassView
        glassEffectStyle={glassEffectStyle}
        isInteractive={interactive && !accessibility.reduceMotion}
        tintColor={tintColor}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { backgroundColor: fallbackColor },
        accessibility.highTextContrast && styles.highContrast,
        fallbackStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  highContrast: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
