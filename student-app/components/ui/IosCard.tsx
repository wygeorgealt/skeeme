import React from 'react';
import { View, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface IosCardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    /** Padding preset — 'none' | 'sm' | 'md' | 'lg' */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Override border radius */
    radius?: number;
    /** Render as a secondary/grouped card (slightly different bg in light mode) */
    secondary?: boolean;
}

export function IosCard({
    children,
    style,
    padding = 'md',
    radius = Radius.lg,
    secondary = false,
}: IosCardProps) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const bg = secondary ? C.cardSecondary : C.card;

    return (
        <View
            style={[
                styles.base,
                {
                    backgroundColor: bg,
                    borderRadius: radius,
                    padding: padding === 'none' ? 0 : padding === 'sm' ? Spacing.sm : padding === 'lg' ? Spacing.lg : Spacing.md,
                    // Light-mode soft shadow
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0 : 0.06,
                    shadowRadius: 8,
                    elevation: isDark ? 0 : 2,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        width: '100%',
        overflow: 'hidden',
    },
});
