import React from 'react';
import { Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { Icon } from './Icon';

export interface ScreenHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  showBorder?: boolean;
  style?: ViewStyle;
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
  const isDark = useColorScheme() === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];
  const needsCustomBack = showBack && (Boolean(onBack) || !router.canGoBack());

  const handleBack = () => {
    haptics.selectionAsync(true);
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(drawer)/(tabs)' as any);
    }
  };

  const headerTitle =
    subtitle || typeof title !== 'string'
      ? () => (
          <View style={style}>
            {typeof title === 'string' ? (
              <Text numberOfLines={1} style={[{ color: C.text, fontSize: 17, fontWeight: '700' }, titleStyle]}>
                {title}
              </Text>
            ) : (
              title
            )}
            {subtitle ? (
              <Text numberOfLines={1} style={{ color: C.textSecondary, fontSize: 12, fontWeight: '500' }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        )
      : title;

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerTitle,
        headerTitleAlign: 'left',
        headerTitleStyle: [{ color: C.text, fontSize: 20, fontWeight: '700' }, titleStyle],
        headerTintColor: C.icon,
        headerStyle: [{ backgroundColor: transparent ? 'transparent' : C.background }, style],
        headerTransparent: transparent,
        headerShadowVisible: showBorder,
        headerBackVisible: showBack && !needsCustomBack,
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
        headerLeft: needsCustomBack
          ? () =>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={12}
                onPress={handleBack}
                style={[
                  { justifyContent: 'center' },
                  transparent
                    ? { width: 56, height: 56, alignItems: 'center' }
                    : { paddingRight: 12 },
                ]}
              >
                <Icon name="ChevronLeft" size={30} color={C.icon} strokeWidth={2} />
              </Pressable>
          : undefined,
        headerRight: rightAction ? () => <View>{rightAction}</View> : undefined,
      }}
    />
  );
}

export default ScreenHeader;
