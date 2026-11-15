import { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Glass } from '@/components/ui/Glass';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import { StreakAnimation } from '@/components/StreakAnimation';
import { Text } from '@/components/ui/Text';

export default function HomeDashboard() {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const router = useRouter();

    const user = useAuthStore((s) => s.user);

    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [streakPresentationVisible, setStreakPresentationVisible] = useState(false);

    // Animations
    const headerOpacity = useSharedValue(0);
    const headerY = useSharedValue(14);

    useEffect(() => {
        headerOpacity.value = withTiming(1, { duration: 400 });
        headerY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    }, [headerOpacity, headerY]);

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const streak = user?.streak?.current_streak ?? 0;

    return (
        <View style={[styles.root, { backgroundColor: isDark ? '#0F1115' : '#FFFFFF' }]}>
            {/* Top Navigation Bar */}
            <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
                {/* Profile Pill with Dropdown Trigger */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.profileBtn}
                    onPress={() => {
                        haptics.selectionAsync();
                        setProfileMenuVisible(!profileMenuVisible);
                    }}
                >
                    <View style={styles.avatarCircle}>
                        <Icon name="User" size={18} color="default" />
                    </View>
                    <Text style={[styles.profileGreeting, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        Hello, <Text style={styles.profileNameBold}>{firstName}!</Text>
                    </Text>
                    <Icon
                        name={profileMenuVisible ? 'ChevronUp' : 'ChevronDown'}
                        size={18}
                        color="secondary"
                    />
                </TouchableOpacity>

                {/* Current streak */}
                <View style={styles.badgeRow}>
                    {/* Streak Badge */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            haptics.selectionAsync();
                            setStreakPresentationVisible(true);
                        }}
                        style={[
                            styles.badgePill,
                            {
                                backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : '#FFF7ED',
                                borderColor: isDark ? 'rgba(255, 149, 0, 0.3)' : '#FDBA74',
                            },
                        ]}
                    >
                        <Icon name="Flame" size={17} color="#EA580C" />
                        <Text style={[styles.badgeText, { color: '#EA580C' }]}>{streak}</Text>
                    </TouchableOpacity>

                </View>
            </View>

            {/* Profile Menu Dropdown Modal */}
            {profileMenuVisible && (
                <Modal transparent animationType="fade" visible={profileMenuVisible}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setProfileMenuVisible(false)}
                    >
                        <Glass
                            fallbackColor={isDark ? '#1C1C1E' : '#FFFFFF'}
                            fallbackStyle={[
                                styles.dropdownFallback,
                                { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                            ]}
                            style={[
                                styles.dropdownMenu,
                                {
                                    top: Math.max(insets.top, 12) + 52,
                                },
                            ]}
                        >
                            <View style={styles.dropdownHeader}>
                                <Text style={styles.planBadgeText}>
                                    {user?.plan_name === 'pro' || user?.plan_name === 'max' ? 'Pro Member' : 'Free Plan'}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    router.push('/(drawer)/preferences' as any);
                                }}
                            >
                                <View style={styles.menuIconWrap}>
                                    <Icon name="Smile" size={20} color="default" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#1C1C1E' }]}>
                                        Personalization
                                    </Text>
                                </View>
                                <Icon name="ChevronRight" size={16} color="secondary" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    router.push('/(drawer)/settings' as any);
                                }}
                            >
                                <View style={styles.menuIconWrap}>
                                    <Icon name="Settings" size={20} color="default" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#1C1C1E' }]}>
                                        Settings
                                    </Text>
                                </View>
                                <Icon name="ChevronRight" size={16} color="secondary" />
                            </TouchableOpacity>
                        </Glass>
                    </TouchableOpacity>
                </Modal>
            )}

            <View style={styles.content}>
                <Animated.View style={[styles.heroSection, headerAnimatedStyle]}>
                    <Text style={[styles.heroHeading, { color: isDark ? '#FFFFFF' : '#1B1B1D' }]}>
                        Need help{'\n'}
                        <Text style={styles.heroHeadingLight}>studying</Text> today?
                    </Text>
                </Animated.View>
            </View>
            <Modal
                visible={streakPresentationVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setStreakPresentationVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setStreakPresentationVisible(false)}
                    style={styles.streakModalOverlay}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {}}
                        style={[
                            styles.streakModalCard,
                            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                        ]}
                    >
                        <StreakAnimation isDark={isDark} size={210} />
                        <Text style={[styles.streakModalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                            {streak} {streak === 1 ? 'Day' : 'Days'} Streak
                        </Text>
                        <Text style={[styles.streakModalSubtitle, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                            Keep showing up every day to keep it going.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setStreakPresentationVisible(false)}
                            style={styles.streakModalButton}
                        >
                            <Text style={styles.streakModalButtonText}>Keep it going</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    topBar: {
        paddingHorizontal: 18,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
    },
    profileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarCircle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileGreeting: {
        fontSize: 16,
        fontWeight: '500',
    },
    profileNameBold: {
        fontWeight: '700',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        gap: 4,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    streakModalOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.48)',
    },
    streakModalCard: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        borderRadius: 28,
        padding: 24,
    },
    streakModalTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    streakModalSubtitle: {
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    streakModalButton: {
        width: '100%',
        minHeight: 54,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
    },
    streakModalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    dropdownMenu: {
        position: 'absolute',
        left: 18,
        width: 250,
        borderRadius: 20,
        padding: 10,
        gap: 8,
    },
    dropdownFallback: {
        borderWidth: 1,
        borderRadius: 20,
    },
    dropdownHeader: {
        paddingHorizontal: 10,
        paddingTop: 4,
        paddingBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        marginBottom: 2,
    },
    planBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#007AFF',
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 12,
    },
    menuIconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTextWrap: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 18,
    },
    heroSection: {
        paddingTop: 16,
        paddingBottom: 32,
    },
    heroHeading: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.6,
        lineHeight: 38,
    },
    heroHeadingLight: {
        fontWeight: '400',
        color: '#8E8E93',
    },
});
