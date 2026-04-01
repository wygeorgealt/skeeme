import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, Platform, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Google, Apple } from 'iconoir-react-native';

export default function CreateAccountScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(6);
    }, []);

    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const btnGoogleBg = isDark ? '#1C1C1E' : '#F2F2F7';
    const btnAppleBg = isDark ? '#FFFFFF' : '#000000';
    const btnAppleText = isDark ? '#000000' : '#FFFFFF';

    return (
        <SafeAreaView style={[s.container, { backgroundColor: bgColor }]}>
            <ScrollView contentContainerStyle={s.content} bounces={false}>
                
                <View style={s.topSpacer} />

                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={s.headerSection}>
                    <Text style={[s.heroTitle, { color: textColor }]}>
                        Create Account
                    </Text>
                    <Text style={[s.heroSubtitle, { color: subtextColor }]}>
                        Save your progress and dive straight into smarter learning.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(300)} style={s.actionSection}>
                    
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            onPress={() => {/* TODO: Wire Apple sign-in */}}
                            activeOpacity={0.8}
                            style={[s.socialBtn, { backgroundColor: btnAppleBg }]}
                        >
                            <Apple width={20} height={20} color={btnAppleText} />
                            <Text style={[s.socialBtnText, { color: btnAppleText }]}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => {/* TODO: Wire Google sign-in */}}
                        activeOpacity={0.8}
                        style={[s.socialBtn, { backgroundColor: btnGoogleBg }]}
                    >
                        <Google width={20} height={20} color={textColor} />
                        <Text style={[s.socialBtnText, { color: textColor }]}>Continue with Google</Text>
                    </TouchableOpacity>

                    <View style={s.dividerRow}>
                        <View style={[s.dividerLine, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />
                        <Text style={[s.dividerText, { color: subtextColor }]}>OR</Text>
                        <View style={[s.dividerLine, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/signup?from=onboarding')}
                        activeOpacity={0.8}
                        style={s.emailBtn}
                    >
                        <Text style={s.emailBtnText}>Sign Up with Email</Text>
                    </TouchableOpacity>

                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingBottom: 40 },
    topSpacer: { flex: 1, maxHeight: 60 },
    
    headerSection: { alignItems: 'center', marginBottom: 48 },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.41, marginBottom: 16, textAlign: 'center' },
    heroSubtitle: { fontSize: 17, fontWeight: '400', lineHeight: 22, textAlign: 'center', paddingHorizontal: 16 },
    
    actionSection: { width: '100%', gap: 16 },
    
    socialBtn: { height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    socialBtnText: { fontWeight: '600', fontSize: 17, marginLeft: 12, letterSpacing: -0.41 },
    
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { paddingHorizontal: 16, fontWeight: '500', fontSize: 13 },
    
    emailBtn: { height: 50, backgroundColor: '#007AFF', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    emailBtnText: { color: 'white', fontWeight: '600', fontSize: 17, letterSpacing: -0.41 },
});
