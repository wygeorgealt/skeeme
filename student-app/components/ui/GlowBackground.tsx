import { View, useColorScheme, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');


export function GlowBackground({ children, className = '', isRoot = false, style, useSafeArea = false }: { children: React.ReactNode; className?: string; isRoot?: boolean; style?: any; useSafeArea?: boolean }) {
    const isDark = useColorScheme() === 'dark';
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.root, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }, useSafeArea && { paddingTop: insets.top }, style]}>
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
