import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, Linking } from 'react-native';
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

    const openLink = (url: string) => Linking.openURL(url);

    return (
        <GlowBackground useSafeArea>
            <Animated.View entering={FadeInDown.duration(800).delay(200)} style={s.heroContainer}>
                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Welcome to Skeeme
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(800).delay(600)} style={s.footer}>
                <View style={s.termsContainer}>
                    <Text style={[s.termsText, isDark ? s.textSlate400 : s.textSlate500]}>
                        By continuing, you agree to our{' '}
                        <Text style={s.linkText} onPress={() => openLink('https://skeeme.com/terms')}>
                            Terms of Service
                        </Text>
                        , and confirm you have read the{' '}
                        <Text style={s.linkText} onPress={() => openLink('https://skeeme.com/privacy')}>
                            Privacy Policy
                        </Text>
                        {' '}to learn how we collect, use and share your data and are at least 13 years of age.
                    </Text>
                    <Text style={[s.poweredBy, isDark ? s.textSlate500 : s.textSlate400]}>
                        Skeeme AI's responses are powered by artificial intelligence and may sometimes be inaccurate.
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/welcome')}
                    activeOpacity={0.9}
                    style={s.mainBtn}
                >
                    <Text style={s.mainBtnText}>Agree and continue</Text>
                </TouchableOpacity>
            </Animated.View>
        </GlowBackground>
    );
}

const s = StyleSheet.create({
    heroContainer: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontSize: 44, fontWeight: '900', letterSpacing: -1, textAlign: 'center', lineHeight: 50 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    
    footer: { width: '100%', paddingHorizontal: 24, paddingBottom: 40 },
    
    termsContainer: { marginBottom: 32, alignItems: 'center' },
    termsText: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 16 },
    linkText: { fontWeight: '700', color: '#8B5CF6' },
    poweredBy: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
    
    mainBtn: { height: 56, backgroundColor: '#8B5CF6', borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    mainBtnText: { fontWeight: '800', fontSize: 16, color: 'white', letterSpacing: 0.5 },
});
