import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Platform,
    Modal,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { appStorage } from '@/lib/storage';

const { width } = Dimensions.get('window');

export default function HomeDashboard() {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();

    const user = useAuthStore((s) => s.user);
    const toggleCreditsModal = useAuthStore((s) => s.toggleCreditsModal);

    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [dailyGoalTarget, setDailyGoalTarget] = useState(20);

    // Queries for live data from Brimble API
    const { data: quizSessions = [] } = useQuery({
        queryKey: ['quiz-history'],
        queryFn: async () => {
            try {
                const res = await api.get('quizzes/history');
                return (res.data?.data || []) as any[];
            } catch {
                return [];
            }
        },
        staleTime: 60 * 1000,
    });

    const { data: flashcardDecks = [] } = useQuery({
        queryKey: ['flashcard-history'],
        queryFn: async () => {
            try {
                const res = await api.get('flashcards/decks');
                return (res.data?.data || []) as any[];
            } catch {
                return [];
            }
        },
        staleTime: 60 * 1000,
    });

    // Load saved daily goal target
    useEffect(() => {
        appStorage.getItem('skeeme_daily_goal').then((val: string | null) => {
            if (val) {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed) && parsed > 0) setDailyGoalTarget(parsed);
            }
        }).catch(() => {});
    }, []);

    // Daily progress calculations
    const todayStr = new Date().toDateString();
    const completedToday = quizSessions
        .filter((q: any) => new Date(q.created_at).toDateString() === todayStr)
        .reduce((acc: number, q: any) => acc + (q.total_questions || 0), 0);
    const target = dailyGoalTarget || 20;
    const progressPct = Math.min(100, Math.round((completedToday / target) * 100));

    const totalCardsCount = flashcardDecks.reduce((acc: number, d: any) => acc + (d.flashcards_count || 0), 0);
    const recentDeck = flashcardDecks.length > 0 ? flashcardDecks[0] : null;

    // Animations
    const headerOpacity = useSharedValue(0);
    const headerY = useSharedValue(14);
    const contentOpacity = useSharedValue(0);
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        headerOpacity.value = withTiming(1, { duration: 400 });
        headerY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
        contentOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));
        progressWidth.value = withDelay(
            300,
            withTiming(Math.max(5, progressPct), { duration: 800, easing: Easing.out(Easing.cubic) })
        );
    }, [progressPct]);

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const credits = user?.credits ?? 0;
    const streak = user?.streak?.current_streak ?? 0;

    return (
        <View style={[styles.root, { backgroundColor: isDark ? '#0F1115' : '#F2F2F7' }]}>
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
                        <Ionicons name="person" size={18} color="#007AFF" />
                    </View>
                    <Text style={[styles.profileGreeting, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        Hello, <Text style={styles.profileNameBold}>{firstName}!</Text>
                    </Text>
                    <MaterialIcons
                        name={profileMenuVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={20}
                        color="#007AFF"
                    />
                </TouchableOpacity>

                {/* Right Badges: Streak & Credits */}
                <View style={styles.badgeRow}>
                    {/* Streak Badge */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            haptics.selectionAsync();
                            router.push('/(drawer)/daily_study_goal' as any);
                        }}
                        style={[
                            styles.badgePill,
                            {
                                backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : '#FFF7ED',
                                borderColor: isDark ? 'rgba(255, 149, 0, 0.3)' : '#FDBA74',
                            },
                        ]}
                    >
                        <MaterialIcons name="local-fire-department" size={17} color="#EA580C" />
                        <Text style={[styles.badgeText, { color: '#EA580C' }]}>{streak}</Text>
                    </TouchableOpacity>

                    {/* Credits Badge */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            haptics.selectionAsync();
                            toggleCreditsModal(true, 'scan');
                        }}
                        style={[
                            styles.badgePill,
                            {
                                backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : '#EFF6FF',
                                borderColor: isDark ? 'rgba(0, 122, 255, 0.3)' : '#93C5FD',
                            },
                        ]}
                    >
                        <MaterialIcons name="bolt" size={17} color="#007AFF" />
                        <Text style={[styles.badgeText, { color: '#007AFF' }]}>{credits}</Text>
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
                        <View
                            style={[
                                styles.dropdownMenu,
                                {
                                    top: Math.max(insets.top, 12) + 52,
                                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
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
                                <View style={[styles.menuIconWrap, { backgroundColor: '#EEF2FF' }]}>
                                    <Ionicons name="sparkles" size={18} color="#4F46E5" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#1C1C1E' }]}>
                                        Personalization
                                    </Text>
                                    <Text style={styles.menuSubtitle}>AI style & study goals</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    router.push('/(drawer)/settings' as any);
                                }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: '#F0FDFA' }]}>
                                    <Ionicons name="settings-sharp" size={18} color="#0D9488" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#1C1C1E' }]}>
                                        Settings
                                    </Text>
                                    <Text style={styles.menuSubtitle}>Account & notifications</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, styles.buyCreditsItem]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setProfileMenuVisible(false);
                                    toggleCreditsModal(true, 'scan');
                                }}
                            >
                                <View style={[styles.menuIconWrap, { backgroundColor: '#007AFF' }]}>
                                    <MaterialIcons name="bolt" size={18} color="#FFFFFF" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={[styles.menuTitle, { color: '#007AFF', fontWeight: '700' }]}>
                                            Buy Credits
                                        </Text>
                                        <View style={styles.instantTag}>
                                            <Text style={styles.instantTagText}>+100 AI</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.menuSubtitle, { color: 'rgba(0, 122, 255, 0.8)' }]}>
                                        Instant AI tutor top-up
                                    </Text>
                                </View>
                                <Ionicons name="add-circle" size={18} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {/* Main Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom, 20) + 90 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Greeting */}
                <Animated.View style={[styles.heroSection, headerAnimatedStyle]}>
                    <Text style={[styles.heroHeading, { color: isDark ? '#FFFFFF' : '#1B1B1D' }]}>
                        Need help{'\n'}
                        <Text style={styles.heroHeadingLight}>studying</Text> today?
                    </Text>
                </Animated.View>

                <Animated.View style={[contentAnimatedStyle, { marginTop: 20 }]}>
                    {/* Daily Goal Card */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push('/(drawer)/daily_study_goal' as any)}
                        style={[
                            styles.dailyGoalCard,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                    >
                        <View style={styles.dailyGoalHeader}>
                            <View style={styles.dailyGoalLeft}>
                                <View style={styles.targetIconWrap}>
                                    <Ionicons name="disc" size={20} color="#007AFF" />
                                </View>
                                <View>
                                    <Text style={[styles.dailyGoalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                                        Daily Goal
                                    </Text>
                                    <Text style={styles.dailyGoalSub}>
                                        {completedToday >= target
                                            ? 'Goal reached! Streak active 🔥'
                                            : `${target - completedToday} more to reach daily goal`}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.dailyGoalCountPill}>
                                <Text style={styles.dailyGoalCountCurrent}>{completedToday}</Text>
                                <Text style={styles.dailyGoalCountTotal}>/ {target}</Text>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
                        </View>
                    </TouchableOpacity>

                    {/* Pro Banner */}
                    <LinearGradient
                        colors={['#007AFF', '#38BDF8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.proBanner}
                    >
                        <View style={styles.proBannerContent}>
                            <View style={styles.crownCircle}>
                                <MaterialIcons name="workspace-premium" size={26} color="#FFFFFF" />
                            </View>
                            <View style={styles.proBannerTextWrap}>
                                <Text style={styles.proBannerTitle}>Unlock Skeeme Pro</Text>
                                <Text style={styles.proBannerSubtitle}>
                                    Upgrade your learning with unlimited access to premium perks & instant AI tutor.
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.88}
                            style={styles.proUpgradeBtn}
                            onPress={() => {
                                haptics.selectionAsync();
                                router.push('/(drawer)/account');
                            }}
                        >
                            <Text style={styles.proUpgradeBtnText}>+ Upgrade to Pro</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Quick Actions 3-Column Grid */}
                    <View style={styles.actionsGrid}>
                        {/* Quiz */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.actionTile,
                                {
                                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                },
                            ]}
                            onPress={() => {
                                haptics.impactAsync();
                                router.push('/(drawer)/generate');
                            }}
                        >
                            <View style={[styles.tileIconCircle, { backgroundColor: '#EFF6FF' }]}>
                                <MaterialIcons name="quiz" size={24} color="#007AFF" />
                            </View>
                            <Text style={[styles.tileTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>Quiz</Text>
                            <Text style={styles.tileSubtitle}>Timed drills</Text>
                        </TouchableOpacity>

                        {/* Flashcards */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.actionTile,
                                {
                                    backgroundColor: isDark ? '#152136' : '#EFF6FF',
                                    borderColor: isDark ? 'rgba(0, 122, 255, 0.4)' : '#BFDBFE',
                                },
                            ]}
                            onPress={() => {
                                haptics.impactAsync();
                                router.push('/(drawer)/history' as any);
                            }}
                        >
                            <View
                                style={[
                                    styles.tileIconCircle,
                                    { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', elevation: 2 },
                                ]}
                            >
                                <MaterialIcons name="style" size={24} color="#007AFF" />
                            </View>
                            <Text style={[styles.tileTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                                Flashcards
                            </Text>
                            <Text style={[styles.tileSubtitle, { color: '#007AFF', fontWeight: '700' }]}>
                                {flashcardDecks.length > 0 ? `${totalCardsCount} Cards` : 'New Deck'}
                            </Text>
                        </TouchableOpacity>

                        {/* History */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.actionTile,
                                {
                                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                },
                            ]}
                            onPress={() => {
                                haptics.impactAsync();
                                router.push('/(drawer)/history');
                            }}
                        >
                            <View style={[styles.tileIconCircle, { backgroundColor: '#EEF2FF' }]}>
                                <MaterialIcons name="history" size={24} color="#4F46E5" />
                            </View>
                            <Text style={[styles.tileTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>History</Text>
                            <Text style={styles.tileSubtitle}>Past sessions</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Today's Tasks Section */}
                    <View style={styles.tasksSection}>
                        <View style={styles.tasksSectionHeader}>
                            <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                                Today's Tasks
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/(drawer)/history')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.tasksList}>
                            {/* Task 1 */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.taskCard,
                                    {
                                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                    },
                                ]}
                                onPress={() => {
                                    if (recentDeck) {
                                        router.push(`/(drawer)/flashcards/${recentDeck.id}` as any);
                                    } else {
                                        router.push('/(drawer)/flashcards/create' as any);
                                    }
                                }}
                            >
                                <View style={styles.taskCardLeft}>
                                    <View style={[styles.taskIconCircle, { backgroundColor: '#EFF6FF' }]}>
                                        <Ionicons name="play" size={20} color="#007AFF" />
                                    </View>
                                    <View style={styles.taskTextWrap}>
                                        <Text
                                            style={[styles.taskTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}
                                            numberOfLines={1}
                                        >
                                            {recentDeck ? `Study "${recentDeck.title}"` : 'Create Your First Flashcard Deck'}
                                        </Text>
                                        <Text style={styles.taskDesc}>
                                            {recentDeck ? `${recentDeck.flashcards_count} cards ready for review` : 'Master key terms with AI spaced repetition'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.arrowPill, { borderColor: isDark ? '#333' : '#E5E5EA' }]}>
                                    <MaterialIcons name="north-east" size={16} color="#8E8E93" />
                                </View>
                            </TouchableOpacity>

                            {/* Task 2 */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.taskCard,
                                    {
                                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                    },
                                ]}
                                onPress={() => router.push('/(drawer)/generate')}
                            >
                                <View style={styles.taskCardLeft}>
                                    <View style={[styles.taskIconCircle, { backgroundColor: '#F0FDFA' }]}>
                                        <MaterialIcons name="auto-awesome" size={20} color="#0D9488" />
                                    </View>
                                    <View style={styles.taskTextWrap}>
                                        <Text
                                            style={[styles.taskTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}
                                        >
                                            Take a Quick Test For Next Quiz
                                        </Text>
                                        <Text style={styles.taskDesc}>Formula cheatsheets & key shortcuts</Text>
                                    </View>
                                </View>
                                <View style={[styles.arrowPill, { borderColor: isDark ? '#333' : '#E5E5EA' }]}>
                                    <MaterialIcons name="north-east" size={16} color="#8E8E93" />
                                </View>
                            </TouchableOpacity>

                            {/* Task 3: Camera Scanner */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.taskCard,
                                    {
                                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                    },
                                ]}
                                onPress={() => router.push('/(drawer)/scan' as any)}
                            >
                                <View style={styles.taskCardLeft}>
                                    <View style={[styles.taskIconCircle, { backgroundColor: '#FEF3C7' }]}>
                                        <MaterialIcons name="document-scanner" size={20} color="#D97706" />
                                    </View>
                                    <View style={styles.taskTextWrap}>
                                        <Text
                                            style={[styles.taskTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}
                                        >
                                            Snap an Unsolved Question
                                        </Text>
                                        <Text style={styles.taskDesc}>Instant step-by-step AI answers</Text>
                                    </View>
                                </View>
                                <View style={[styles.arrowPill, { borderColor: isDark ? '#333' : '#E5E5EA' }]}>
                                    <MaterialIcons name="north-east" size={16} color="#8E8E93" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(0, 122, 255, 0.25)',
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
    dropdownMenu: {
        position: 'absolute',
        left: 18,
        width: 270,
        borderRadius: 20,
        borderWidth: 1,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 28,
        elevation: 16,
    },
    dropdownHeader: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        marginBottom: 4,
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
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 14,
        gap: 10,
    },
    buyCreditsItem: {
        backgroundColor: 'rgba(0, 122, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.2)',
        marginTop: 4,
    },
    menuIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
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
    menuSubtitle: {
        fontSize: 11,
        color: '#8E8E93',
        marginTop: 2,
    },
    instantTag: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    instantTagText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#EA580C',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 18,
    },
    heroSection: {
        paddingTop: 16,
        paddingBottom: 28,
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
    dailyGoalCard: {
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        marginTop: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    dailyGoalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dailyGoalLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    targetIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dailyGoalTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    dailyGoalSub: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    dailyGoalCountPill: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.25)',
        gap: 2,
    },
    dailyGoalCountCurrent: {
        fontSize: 13,
        fontWeight: '700',
        color: '#007AFF',
    },
    dailyGoalCountTotal: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(0, 122, 255, 0.7)',
    },
    progressBarTrack: {
        width: '100%',
        height: 8,
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 999,
    },
    proBanner: {
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 5,
    },
    proBannerContent: {
        flexDirection: 'row',
        gap: 12,
    },
    crownCircle: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    proBannerTextWrap: {
        flex: 1,
    },
    proBannerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    proBannerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.92)',
        marginTop: 4,
        lineHeight: 17,
    },
    proUpgradeBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    proUpgradeBtnText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '700',
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    actionTile: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    tileIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    tileTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    tileSubtitle: {
        fontSize: 11,
        color: '#8E8E93',
        marginTop: 2,
    },
    tasksSection: {
        marginTop: 4,
    },
    tasksSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
    },
    tasksList: {
        gap: 10,
    },
    taskCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    taskCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    taskIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskTextWrap: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 18,
    },
    taskDesc: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    arrowPill: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
