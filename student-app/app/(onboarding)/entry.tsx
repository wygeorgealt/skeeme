import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, Linking, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HookScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(1);
    }, []);

    const openLink = (url: string) => Linking.openURL(url);

    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const linkColor = '#007AFF'; // Standard Apple Blue

    return (
        <SafeAreaView style={[s.container, { backgroundColor: bgColor }]}>
            <View style={s.content}>
                
                {/* Hero Title */}
                <Animated.View entering={FadeInDown.duration(800).delay(200)} style={s.heroContainer}>
                    <Text style={[s.heroTitle, { color: textColor }]}>
                        Welcome to Skeeme
                    </Text>
                </Animated.View>

                {/* Footer terms and button */}
                <Animated.View entering={FadeInDown.duration(800).delay(400)} style={s.footer}>
                    
                    <View style={s.termsContainer}>
                        <Text style={[s.termsText, { color: subtextColor }]}>
                            By continuing, you agree to our{' '}
                            <Text style={[s.linkText, { color: linkColor }]} onPress={() => openLink('https://skeeme.com/terms')}>
                                Terms of Service
                            </Text>
                            , and confirm you have read the{' '}
                            <Text style={[s.linkText, { color: linkColor }]} onPress={() => openLink('https://skeeme.com/privacy')}>
                                Privacy Policy
                            </Text>
                            {' '}to learn how we collect, use and share your data and are at least 13 years of age.
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/(onboarding)/auth-select')}
                        activeOpacity={0.8}
                        style={s.mainBtn}
                    >
                        <Text style={s.mainBtnText}>Agree and continue</Text>
                    </TouchableOpacity>

                </Animated.View>

            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 16 },
    
    heroContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.41, textAlign: 'center' },
    
    footer: { width: '100%', alignItems: 'center' },
    
    termsContainer: { marginBottom: 32, alignItems: 'center', paddingHorizontal: 16 },
    termsText: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginBottom: 16 },
    linkText: { fontWeight: '600' },
    poweredBy: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
    
    mainBtn: { 
        width: '100%', 
        height: 56, 
        backgroundColor: '#007AFF', 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    mainBtnText: { fontWeight: '600', fontSize: 17, color: 'white', letterSpacing: -0.41 },
});
