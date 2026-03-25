import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlowBackground } from '@/components/ui/GlowBackground';

export default function HookScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(1);
    }, []);

    return (
        <GlowBackground useSafeArea>
            <Animated.View entering={FadeInDown.duration(800).delay(200)} style={s.heroContainer}>
                <View style={[s.iconBox, isDark ? s.iconBoxDark : s.iconBoxLight]}>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={s.iconImage}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Study with{'\n'}Skeeme.
                </Text>
                <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                    The world's most powerful AI tutor, personalized exactly for you.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(800).delay(600)} style={s.footer}>
                <TouchableOpacity
                    onPress={() => router.push('/(onboarding)/education')}
                    activeOpacity={0.9}
                    style={s.mainBtn}
                >
                    <Text style={s.mainBtnText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/login')}
                    style={s.loginLink}
                    activeOpacity={0.7}
                >
                    <Text style={[s.loginLinkText, isDark ? s.textSlate400 : s.textSlate500]}>
                        Already have an account? <Text style={s.textBrandPrimary}>Log in</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    heroContainer: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', marginTop: -80 },
    iconBox: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderWidth: 1 },
    iconBoxLight: { backgroundColor: 'white', borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
    iconBoxDark: { backgroundColor: '#0f172a', borderColor: '#1e293b' },
    iconImage: { width: 64, height: 64, opacity: 0.9 },
    
    heroTitle: { fontSize: 44, fontWeight: '700', letterSpacing: -1, textAlign: 'center', lineHeight: 50, marginBottom: 20 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textBrandPrimary: { color: '#8B5CF6' },
    
    footer: { width: '100%', paddingHorizontal: 24, paddingBottom: 64 },
    mainBtn: { height: 56, backgroundColor: '#8B5CF6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    mainBtnText: { fontWeight: '700', fontSize: 15, color: 'white', letterSpacing: 0.5 },
    
    loginLink: { height: 48, alignItems: 'center', justifyContent: 'center' },
    loginLinkText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
