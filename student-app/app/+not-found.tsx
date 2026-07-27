import { Text } from '@/components/ui/Text';
import { View, useColorScheme, StyleSheet } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { Stack, router } from 'expo-router';
import Compass from '@/assets/icons/pikaicons/map.svg';
import Home from '@/assets/icons/pikaicons/home-simple.svg';

export default function NotFoundScreen() {
    return (
        <View style={s.container}>
            <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />

            <View style={s.iconBox}>
                <Compass width={40} height={40} color="#6366f1" />
            </View>

            <Text style={s.title}>404</Text>
            <Text style={s.subtitle}>
                This page doesn&apos;t exist. You may have followed a broken link.
            </Text>

            <AnimatedButton
                title="Go Home"
                onPress={() => router.replace('/(drawer)')}
                type="capsule"
                backgroundColor="#4f46e5"
                shadowColor="#4338ca"
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    iconBox: { width: 64, height: 64, backgroundColor: '#1e293b', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: 'white', marginBottom: 8 },
    subtitle: { color: '#94a3b8', fontWeight: '500', textAlign: 'center', fontSize: 16, marginBottom: 24 },
    button: { backgroundColor: '#4f46e5', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: '900', fontSize: 16, marginLeft: 8 },
});
