import { View, Text, TouchableOpacity, useColorScheme, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sparks, Google, Apple, Mail } from 'iconoir-react-native';

export default function CreateAccountScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(6);
    }, []);

    return (
        <View style={[s.flex1, isDark ? s.bgDark : s.bgLight]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Progress */}
            <View style={s.progressRow}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View 
                        key={i} 
                        style={[
                            s.progressDot, 
                            i <= 5 
                                ? (isDark ? s.bgWhite : s.bgSlate900) 
                                : (isDark ? s.bgSlate800 : s.bgSlate100)
                        ]} 
                    />
                ))}
            </View>

            <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.headerSection}>
                <View style={[s.iconBox, isDark ? s.iconBoxDark : s.iconBoxLight]}>
                    <Sparks width={28} height={28} color="#8B5CF6" />
                </View>
                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Almost there.
                </Text>
                <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                    Create an account to save your progress and unlock your personal AI tutor.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(800).delay(300)} style={s.btnContainer}>
                {/* Social Buttons */}
                <View style={s.socialGap}>
                    <TouchableOpacity
                        onPress={() => {/* TODO: Wire Google sign-in */}}
                        activeOpacity={0.9}
                        style={[s.socialBtn, isDark ? s.socialBtnDark : s.socialBtnLight]}
                    >
                        <Google width={18} height={18} color={isDark ? '#fff' : '#000'} />
                        <Text style={[s.socialBtnText, isDark ? s.textWhite : s.textSlate900]}>Continue with Google</Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            onPress={() => {/* TODO: Wire Apple sign-in */}}
                            activeOpacity={0.9}
                            style={[s.appleBtn, isDark ? s.bgWhite : s.bgSlate950]}
                        >
                            <Apple width={18} height={18} color={isDark ? '#000' : '#fff'} />
                            <Text style={[s.socialBtnText, isDark ? s.textSlate900 : s.textWhite]}>Continue with Apple</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divider */}
                <View style={s.dividerRow}>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                    <Text style={[s.dividerText, isDark ? s.textSlate600 : s.textSlate400]}>OR</Text>
                    <View style={[s.dividerLine, isDark ? s.bgSlate800 : s.bgSlate100]} />
                </View>

                {/* Email Signup */}
                <TouchableOpacity
                    onPress={() => router.push('/signup?from=onboarding')}
                    activeOpacity={0.9}
                    style={s.emailBtn}
                >
                    <Mail width={18} height={18} color="#fff" />
                    <Text style={s.emailBtnText}>Signup with Email</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1, paddingHorizontal: 24, paddingTop: 64, justifyContent: 'center' },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    
    progressRow: { flexDirection: 'row', gap: 6, marginBottom: 32 },
    progressDot: { flex: 1, height: 4, borderRadius: 99 },
    
    headerSection: { marginBottom: 40 },
    iconBox: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1 },
    iconBoxLight: { backgroundColor: 'white', borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
    iconBoxDark: { backgroundColor: '#0f172a', borderColor: '#1e293b' },
    
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    btnContainer: { gap: 16 },
    socialGap: { gap: 12 },
    socialBtn: { height: 56, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    socialBtnLight: { borderColor: '#f1f5f9', backgroundColor: 'white' },
    socialBtnDark: { borderColor: '#1e293b', backgroundColor: '#0f172a' },
    socialBtnText: { fontWeight: '700', fontSize: 15, marginLeft: 12 },
    
    appleBtn: { height: 56, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
    bgWhite: { backgroundColor: 'white' },
    bgSlate950: { backgroundColor: '#020617' },
    
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { paddingHorizontal: 20, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    bgSlate900: { backgroundColor: '#0f172a' },
    
    emailBtn: { height: 56, backgroundColor: '#8B5CF6', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    emailBtnText: { color: 'white', fontWeight: '700', fontSize: 15, marginLeft: 12, letterSpacing: 0.5 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textSlate600: { color: '#475569' },
});
