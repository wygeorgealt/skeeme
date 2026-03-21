import { View, useColorScheme, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');


export function GlowBackground({ children, className = '', isRoot = false, style, useSafeArea = false }: { children: React.ReactNode; className?: string; isRoot?: boolean; style?: any; useSafeArea?: boolean }) {
    const isDark = useColorScheme() === 'dark';
    const insets = useSafeAreaInsets();

    if (!isRoot) {
        return <View style={[{ flex: 1, backgroundColor: 'transparent' }, useSafeArea && { paddingTop: insets.top }, style]} className={className}>{children}</View>;
    }

    return (
        <View style={[styles.root, { backgroundColor: isDark ? '#100921' : '#fafafa' }, useSafeArea && { paddingTop: insets.top }, style]}>
            {/* Gradient overlay */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {isDark ? (
                    <>
                        <LinearGradient
                            colors={['rgba(30, 58, 138, 0.8)', 'rgba(17, 24, 39, 0.4)', 'transparent']}
                            locations={[0, 0.35, 1]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={{ height: height * 0.6, position: 'absolute', top: -height * 0.1, left: 0, right: 0 }}
                        />
                        <LinearGradient
                            colors={['rgba(139, 92, 246, 0.35)', 'transparent']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{ width: width * 0.85, height: width * 0.85, position: 'absolute', top: -height * 0.05, right: 0 }}
                        />
                        <LinearGradient
                            colors={['rgba(56, 189, 248, 0.2)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: width * 0.7, height: width * 0.7, position: 'absolute', top: -height * 0.05, left: 0 }}
                        />
                    </>
                ) : (
                    <>
                        <LinearGradient
                            colors={['rgba(165, 180, 252, 0.3)', 'rgba(196, 181, 253, 0.15)', 'transparent']}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={{ height: height * 0.55, position: 'absolute', top: -height * 0.1, left: 0, right: 0 }}
                        />
                        <LinearGradient
                            colors={['rgba(139, 92, 246, 0.12)', 'transparent']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{ width: width * 0.7, height: width * 0.7, position: 'absolute', top: -height * 0.05, right: 0 }}
                        />
                    </>
                )}
            </View>
            
            {/* Content */}
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
