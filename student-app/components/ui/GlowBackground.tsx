import { View, useColorScheme, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export function GlowBackground({ children, className = '', isRoot = false, style, useSafeArea = false }: { children: React.ReactNode; className?: string; isRoot?: boolean; style?: any; useSafeArea?: boolean }) {
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    // Emulate the bright radial silver glow from the mockup
    const darkGradient = [
        'rgba(255, 255, 255, 0.25)', // Bright silver origin
        'rgba(20, 20, 24, 0.6)',     // Quick fade into dark
        '#000000',                   // Solid black background
        '#000000'
    ] as const;
    const lightGradient = [
        '#E0EFFE', // Soft airy blue at the top
        '#EEF4FD', // Fading into blue-tinted white
        '#FFFFFF', // Solid white base
        '#FFFFFF'
    ] as const;

    return (
        <View style={[styles.root, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }, useSafeArea && { paddingTop: insets.top }, style]}>
            <LinearGradient
                colors={isDark ? darkGradient : lightGradient}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                locations={[0, 0.3, 0.7, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Background Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    content: {
        flex: 1,
        zIndex: 10,
    },
});
