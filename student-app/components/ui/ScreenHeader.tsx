import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Icon } from './Icon';
import { ArrowLeft } from 'lucide-react-native';
import { haptics } from '@/lib/haptics';

export interface ScreenHeaderProps {
  /** Screen title text */
  title: string | React.ReactNode;
  /** Optional secondary subtitle */
  subtitle?: string;
  /** Whether to render a back navigation button. Defaults to true */
  showBack?: boolean;
  /** Custom onBack action. Defaults to safe canGoBack() / replace('/') fallback */
  onBack?: () => void;
  /** Optional right action element (e.g. settings icon, action button, pill) */
  rightAction?: React.ReactNode;
  /** Make header background transparent. Defaults to false */
  transparent?: boolean;
  /** Show bottom hairline border. Defaults to false */
  showBorder?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom title text style */
  titleStyle?: TextStyle;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  transparent = false,
  showBorder = false,
  style,
  titleStyle,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];

  const handleBack = () => {
    haptics.selectionAsync(true);
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(drawer)' as any);
    }
  };

  const backgroundColor = transparent ? 'transparent' : C.background;
  const borderColor = showBorder ? C.border : 'transparent';

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor,
          borderBottomColor: borderColor,
          borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {/* Left: Back Button or spacer */}
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.6}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon icon={ArrowLeft} size={22} color={C.primary} strokeWidth={2.4} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Center: Title & Subtitle */}
        <View style={styles.titleContainer}>
          {typeof title === 'string' ? (
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                { color: C.text },
                titleStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: C.textSecondary }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right: Custom Action or spacer */}
        <View style={styles.rightContainer}>
          {rightAction || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 30,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
});

export default ScreenHeader;
