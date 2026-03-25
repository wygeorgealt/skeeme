import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FireFlame, Check, NavArrowRight } from 'iconoir-react-native';

const MILESTONES = [
    { days: 7, reward: 50, label: '7-Day Streak' },
    { days: 14, reward: 100, label: '14-Day Streak' },
    { days: 30, reward: 200, label: '30-Day Streak' },
    { days: 60, reward: 500, label: '60-Day Streak' },
];

export default function StreakIntroScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(7);
    }, []);

    return (
        <View style={[s.flex1, isDark ? s.bgDark : s.bgLight]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Animated.View entering={FadeInDown.duration(800).delay(100)} style={s.headerSection}>
                <View style={[s.iconBox, isDark ? s.iconBoxDark : s.iconBoxLight]}>
                    <FireFlame width={36} height={36} color="#8B5CF6" />
                </View>
                <Text style={[s.heroTitle, isDark ? s.textWhite : s.textSlate900]}>
                    Study every day.
                </Text>
                <Text style={[s.heroSubtitle, isDark ? s.textSlate400 : s.textSlate500]}>
                    Build your learning habit and unlock free bonus credits at every milestone.
                </Text>
            </Animated.View>

            {/* Milestones */}
            <View style={s.milestonesGap}>
                {MILESTONES.map((m, i) => (
                    <Animated.View key={m.days} entering={FadeInDown.duration(600).delay(300 + i * 120)}>
                        <View style={[s.milestoneCard, isDark ? s.milestoneCardDark : s.milestoneCardLight]}>
                            <View style={[s.milestoneIconBox, i === 0 ? s.bgBrandPrimary : (isDark ? s.bgSlate800 : s.bgSlate50)]}>
                                <FireFlame width={18} height={18} color={i === 0 ? '#fff' : '#8B5CF6'} />
                            </View>
                            <View style={s.flex1}>
                                <Text style={[s.milestoneLabel, isDark ? s.textWhite : s.textSlate900]}>{m.label}</Text>
                            </View>
                            <View style={[s.rewardBadge, isDark ? s.rewardBadgeDark : s.rewardBadgeLight]}>
                                <Text style={[s.rewardText, isDark ? s.textSlate400 : s.textSlate600]}>+{m.reward} credits</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Day 1 active */}
            <Animated.View entering={FadeInUp.duration(600).delay(800)}>
                <View style={[s.statusCard, isDark ? s.statusCardDark : s.statusCardLight]}>
                    <View style={s.checkCircle}>
                        <Check width={18} height={18} color="#fff" />
                    </View>
                    <View style={s.flex1}>
                        <Text style={s.statusTitle}>Day 1 Started!</Text>
                        <Text style={s.statusSubtitle}>6 more days until your first reward.</Text>
                    </View>
                </View>
            </Animated.View>

            {/* CTA */}
            <View style={s.footer}>
                <Animated.View entering={FadeInUp.duration(600).delay(1000)} style={s.btnWrapper}>
                    <TouchableOpacity
                        onPress={() => router.push('/(onboarding)/notifications')}
                        activeOpacity={0.9}
                        style={s.mainBtn}
                    >
                        <Text style={s.mainBtnText}>Secure your Streak</Text>
                        <NavArrowRight width={18} height={18} color="#fff" />
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
    iconBox: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderWidth: 1 },
    iconBoxLight: { backgroundColor: 'white', borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
    iconBoxDark: { backgroundColor: '#0f172a', borderColor: '#1e293b' },
    
    heroTitle: { fontSize: 40, fontWeight: '700', letterSpacing: -1, lineHeight: 46, marginBottom: 12 },
    heroSubtitle: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    
    milestonesGap: { gap: 16 },
    milestoneCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    milestoneCardLight: { borderColor: '#f8fafc', backgroundColor: 'white' },
    milestoneCardDark: { borderColor: '#1e293b', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
    
    milestoneIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
    bgBrandPrimary: { backgroundColor: '#8B5CF6' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate50: { backgroundColor: '#f8fafc' },
    
    milestoneLabel: { fontWeight: '700', fontSize: 15 },
    rewardBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    rewardBadgeLight: { borderColor: '#f1f5f9', backgroundColor: '#f8fafc' },
    rewardBadgeDark: { borderColor: '#334155', backgroundColor: '#0f172a' },
    rewardText: { fontWeight: '700', fontSize: 12 },
    
    statusCard: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginTop: 24, borderWidth: 2 },
    statusCardLight: { borderColor: '#0f172a', backgroundColor: '#0f172a' },
    statusCardDark: { borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#0f172a' },
    checkCircle: { backgroundColor: '#8B5CF6', width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    statusTitle: { fontWeight: '700', fontSize: 15, color: 'white' },
    statusSubtitle: { fontWeight: '500', fontSize: 13, marginTop: 2, color: '#94a3b8' },
    
    footer: { marginTop: 'auto' },
    btnWrapper: { paddingTop: 32 },
    mainBtn: { height: 56, backgroundColor: '#8B5CF6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    mainBtnText: { fontWeight: '700', fontSize: 15, marginRight: 8, color: 'white', letterSpacing: 0.5 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textSlate700: { color: '#334155' },
    textSlate600: { color: '#475569' },
    textSlate500: { color: '#64748b' },
    textSlate400: { color: '#94a3b8' },
});
