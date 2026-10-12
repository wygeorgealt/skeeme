import { StyleSheet, useColorScheme, View } from 'react-native';
import type { GlassSurfaceProps } from './types';

/** Native grouped surface. The legacy name keeps existing screens compatible. */
export function GlassSurface({ children, style, padding = 18 }: GlassSurfaceProps) {
    const isDark = useColorScheme() === 'dark';
    return <View style={[styles.surface, isDark ? styles.dark : styles.light, { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    surface: { overflow: 'hidden', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
    light: { backgroundColor: '#FFFFFF', borderColor: 'rgba(60, 60, 67, 0.12)' },
    dark: { backgroundColor: '#1C1C1E', borderColor: 'rgba(84, 84, 88, 0.50)' },
});
