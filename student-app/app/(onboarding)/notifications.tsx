import { View, Text, TouchableOpacity, useColorScheme, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Bell, Trophy, FireFlame, BatteryWarning } from 'iconoir-react-native';
import * as Notifications from 'expo-notifications';

const REASONS = [
    { icon: Trophy, text: 'Approaching a credit reward milestone' },
    { icon: FireFlame, text: 'Streak about to reset' },
    { icon: BatteryWarning, text: 'Credits running low' },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, completeOnboarding } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(8);
    }, []);

    const handleEnable = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (__DEV__) console.log('[Onboarding] Notification permission:', status);
        } catch (e) {
            if (__DEV__) console.error('[Onboarding] Failed to request notifications', e);
        }
        await completeOnboarding();
        router.replace('/(drawer)');
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(drawer)');
    };

    return (
        <View style={[s.flex1, isDark ? s.bgDark : s.bgLight]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.headerSection}>
                <View style={[s.iconBox, isDark ? s.iconBoxDark : s.iconBoxLight]}>
                    <Bell width={28} height={28} color="#8B5CF6" />
                </View>
                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Stay on track.
                </Text>
                <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                    Skeeme can remind you before your streak resets or when your AI context is ready.
                </Text>
            </Animated.View>

            {/* Notification reasons */}
            <View style={s.reasonsGap}>
                {REASONS.map((reason, i) => (
                    <Animated.View key={i} entering={FadeInDown.duration(600).delay(300 + i * 150)}>
                        <View style={[s.reasonCard, isDark ? s.reasonCardDark : s.reasonCardLight]}>
                             <View style={[s.reasonIconBox, isDark ? s.bgSlate800 : s.bgSlate50]}>
                                <reason.icon width={18} height={18} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <Text style={[s.reasonText, isDark ? s.textSlate200 : s.textSlate700]}>{reason.text}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Buttons */}
            <View style={s.footer}>
                <Animated.View entering={FadeInUp.duration(600).delay(800)} style={s.btnGap}>
                    <TouchableOpacity
                        onPress={handleEnable}
                        activeOpacity={0.9}
                        style={s.mainBtn}
                    >
                        <Text style={s.mainBtnText}>Enable Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSkip}
                        activeOpacity={0.7}
                        style={s.skipBtn}
                    >
                        <Text style={[s.skipBtnText, isDark ? s.textSlate500 : s.textSlate400]}>Maybe later</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24 },
    bgDark: { backgroundColor: '#0f0f11' },
    bgLight: { backgroundColor: '#fafafa' },
    
    headerSection: { marginBottom: 40 },
    iconBox: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1 },
    iconBoxLight: { backgroundColor: 'white', borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
    iconBoxDark: { backgroundColor: '#0f172a', borderColor: '#1e293b' },
    
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    reasonsGap: { gap: 16 },
    reasonCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    reasonCardLight: { borderColor: '#f8fafc', backgroundColor: 'white' },
    reasonCardDark: { borderColor: '#1e293b', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
    
    reasonIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate50: { backgroundColor: '#f8fafc' },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate700: { color: '#334155' },
    textSlate500: { color: '#64748b' },
    textSlate400: { color: '#94a3b8' },
    textSlate200: { color: '#e2e8f0' },
    
    reasonText: { flex: 1, fontWeight: '700', fontSize: 15 },
    
    footer: { marginTop: 'auto', paddingTop: 32 },
    btnGap: { gap: 16 },
    mainBtn: { height: 56, backgroundColor: '#8B5CF6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    mainBtnText: { fontWeight: '700', fontSize: 15, color: 'white', letterSpacing: 0.5 },
    
    skipBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
    skipBtnText: { fontWeight: '700', fontSize: 14 },
});
