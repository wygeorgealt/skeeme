import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import {
    ChevronRight,
    Crown,
    Settings,
    Sparkles,
    Bell,
    Clock,
    LogOut,
    HelpCircle,
    BookMarked,
} from 'lucide-react-native';
import { DASHBOARD_THEME } from '@/components/dashboard/dashboardTokens';
import { useTabBarScroll } from '@/components/ui/TabBarScrollContext';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const handleScroll = useTabBarScroll('profile');

    const isPro = user?.plan_name === 'pro' || user?.plan_name === 'max' || user?.is_premium;
    const name = user?.name || 'George';
    const email = user?.email || 'george@example.com';
    const streak = user?.streak?.current_streak ?? 1;

    const handleLogout = () => {
        Alert.alert('Log out', 'Are you sure you want to log out of your account?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log out',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(onboarding)/auth-select');
                },
            },
        ]);
    };

    return (
        <View style={[styles.root, { backgroundColor: DASHBOARD_THEME.surface }]}>
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: Math.max(insets.top, 16) + 12,
                        paddingBottom: Math.max(insets.bottom + 100, 120),
                    },
                ]}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Profile Header Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        <Icon name="User" size={28} color="default" />
                    </View>
                    <Text style={styles.nameText}>{name}</Text>
                    <Text style={styles.emailText}>{email}</Text>

                    <View style={styles.badgeRow}>
                        <View style={[styles.planPill, isPro ? styles.planPillPro : styles.planPillFree]}>
                            {isPro ? (
                                <Crown size={14} color="#B45309" strokeWidth={2.2} />
                            ) : null}
                            <Text style={[styles.planPillText, isPro && styles.planPillTextPro]}>
                                {isPro ? 'Pro Member' : 'Free Plan'}
                            </Text>
                        </View>

                        <View style={styles.streakPill}>
                            <Icon name="Flame" size={14} color="#EA580C" />
                            <Text style={styles.streakPillText}>{streak} Day Streak</Text>
                        </View>
                    </View>
                </View>

                {/* Section 1: Study Goals & Preferences */}
                <Text style={styles.sectionHeader}>STUDY PREFERENCES</Text>
                <View style={styles.menuGroup}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push('/(drawer)/preferences')}
                        style={styles.menuItem}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                            <Sparkles size={18} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />
                        </View>
                        <View style={styles.menuTextCol}>
                            <Text style={styles.menuTitle}>Explanation & tone style</Text>
                            <Text style={styles.menuSub}>Customize how Skeemy explains concepts</Text>
                        </View>
                        <ChevronRight size={18} color={DASHBOARD_THEME.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push('/(drawer)/preferences')}
                        style={styles.menuItem}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#FFFBEA' }]}>
                            <Clock size={18} color="#B45309" strokeWidth={2.2} />
                        </View>
                        <View style={styles.menuTextCol}>
                            <Text style={styles.menuTitle}>Daily study goals</Text>
                            <Text style={styles.menuSub}>Set your target minutes per day</Text>
                        </View>
                        <ChevronRight size={18} color={DASHBOARD_THEME.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push('/(drawer)/preferences')}
                        style={styles.menuItem}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#FDF4FF' }]}>
                            <Bell size={18} color="#A21CAF" strokeWidth={2.2} />
                        </View>
                        <View style={styles.menuTextCol}>
                            <Text style={styles.menuTitle}>Study reminders</Text>
                            <Text style={styles.menuSub}>Daily nudges to keep your rhythm</Text>
                        </View>
                        <ChevronRight size={18} color={DASHBOARD_THEME.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Section 2: Account & Settings */}
                <Text style={styles.sectionHeader}>ACCOUNT & SETTINGS</Text>
                <View style={styles.menuGroup}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push('/(drawer)/settings')}
                        style={styles.menuItem}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#F1F5F9' }]}>
                            <Settings size={18} color={DASHBOARD_THEME.text} strokeWidth={2.2} />
                        </View>
                        <View style={styles.menuTextCol}>
                            <Text style={styles.menuTitle}>General settings</Text>
                            <Text style={styles.menuSub}>Haptics, themes, and account security</Text>
                        </View>
                        <ChevronRight size={18} color={DASHBOARD_THEME.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push('/(drawer)/support')}
                        style={styles.menuItem}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
                            <HelpCircle size={18} color="#15803D" strokeWidth={2.2} />
                        </View>
                        <View style={styles.menuTextCol}>
                            <Text style={styles.menuTitle}>Support & feedback</Text>
                            <Text style={styles.menuSub}>Get help or suggest new features</Text>
                        </View>
                        <ChevronRight size={18} color={DASHBOARD_THEME.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Section 3: Logout */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    <LogOut size={18} color="#EF4444" strokeWidth={2.2} />
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    profileCard: {
        backgroundColor: DASHBOARD_THEME.card,
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        marginBottom: 28,
        ...DASHBOARD_THEME.cardShadow,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
        marginBottom: 12,
    },
    nameText: {
        fontFamily: 'Allo-Bold',
        fontSize: 20,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.3,
    },
    emailText: {
        fontFamily: 'Allo-Regular',
        fontSize: 13.5,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 2,
        marginBottom: 14,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    planPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
    },
    planPillFree: {
        backgroundColor: '#F1F5F9',
    },
    planPillPro: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    planPillText: {
        fontFamily: 'Allo-Bold',
        fontSize: 12,
        color: DASHBOARD_THEME.textSecondary,
    },
    planPillTextPro: {
        color: '#92400E',
    },
    streakPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
    },
    streakPillText: {
        fontFamily: 'Allo-Bold',
        fontSize: 12,
        color: '#EA580C',
    },
    sectionHeader: {
        fontFamily: 'Allo-Bold',
        fontSize: 12,
        letterSpacing: 0.6,
        color: DASHBOARD_THEME.textMuted,
        marginBottom: 10,
        marginLeft: 4,
    },
    menuGroup: {
        backgroundColor: DASHBOARD_THEME.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        marginBottom: 24,
        overflow: 'hidden',
        ...DASHBOARD_THEME.cardShadow,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuTextCol: {
        flex: 1,
    },
    menuTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 15,
        color: DASHBOARD_THEME.text,
    },
    menuSub: {
        fontFamily: 'Allo-Regular',
        fontSize: 12.5,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: DASHBOARD_THEME.borderLight,
        marginLeft: 68,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 16,
        height: 50,
        marginTop: 8,
    },
    logoutText: {
        fontFamily: 'Allo-Bold',
        fontSize: 15,
        color: '#EF4444',
    },
});
