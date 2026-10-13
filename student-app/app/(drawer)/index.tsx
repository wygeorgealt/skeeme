import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Modal,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
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
import {
    DailyActivityTask,
    getDailyActivities,
    toggleTaskCompletion,
    calculateDailyGoalProgress,
} from '@/lib/dailyActivitiesService';

const { width } = Dimensions.get('window');

export default function HomeDashboard() {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const router = useRouter();
    const scrollViewRef = React.useRef<ScrollView>(null);

    const user = useAuthStore((s) => s.user);
    const toggleCreditsModal = useAuthStore((s) => s.toggleCreditsModal);

    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [dailyTasks, setDailyTasks] = useState<DailyActivityTask[]>([]);

    // Queries for live data from Brimble API
    const { data: userExams = [] } = useQuery({
        queryKey: ['user-exams'],
        queryFn: async () => {
            try {
                const res = await api.get('user-exams');
                return (res.data || []) as any[];
            } catch {
                return [];
            }
        },
        staleTime: 60 * 1000,
    });

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

    // Generate dynamic daily tasks based on user prefs, exams, and history
    useEffect(() => {
        getDailyActivities({
            user,
            exams: userExams,
            flashcardDecks,
            quizSessions,
        })
            .then(setDailyTasks)
            .catch(() => {});
    }, [user, userExams, flashcardDecks, quizSessions]);

    const handleToggleTask = async (taskId: string) => {
        haptics.selectionAsync();
        const updatedStatus = await toggleTaskCompletion(taskId);
        setDailyTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, completed: updatedStatus } : t))
        );
    };

    // Daily progress calculations from dynamic tasks
    const goalProgress = calculateDailyGoalProgress(dailyTasks);
    const progressPct = goalProgress.percentage;

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
                        <Icon name="User" size={18} color="primary" />
                    </View>
                    <Text style={[styles.profileGreeting, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        Hello, <Text style={styles.profileNameBold}>{firstName}!</Text>
                    </Text>
                    <Icon
                        name={profileMenuVisible ? 'ChevronUp' : 'ChevronDown'}
                        size={20}
                        color="primary"
                    />
                </TouchableOpacity>

                {/* Right Badges: Streak & Credits */}
                <View style={styles.badgeRow}>
                    {/* Streak Badge */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            haptics.selectionAsync();
                            scrollViewRef.current?.scrollTo({ y: 320, animated: true });
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
                        <Icon name="Zap" size={17} color="primary" />
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
                                <View style={styles.menuIconWrap}>
                                    <Icon name="Smile" size={20} color="primary" animated="pulse" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#1C1C1E' }]}>
                                        Personalization
                                    </Text>
                                </View>
                                <Icon name="ChevronRight" size={16} color="primary" />
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
                                    <Icon name="Settings" size={20} color="primary" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#1C1C1E' }]}>
                                        Settings
                                    </Text>
                                </View>
                                <Icon name="ChevronRight" size={16} color="primary" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {/* Main Scrollable Content */}
            <ScrollView
                ref={scrollViewRef}
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
                        onPress={() => {
                            haptics.selectionAsync();
                            scrollViewRef.current?.scrollTo({ y: 320, animated: true });
                        }}
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
                                    <Icon name="Target" size={20} color="primary" animated="pulse" />
                                </View>
                                <View>
                                    <Text style={[styles.dailyGoalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                                        Daily Goal
                                    </Text>
                                    <Text style={styles.dailyGoalSub}>
                                        {goalProgress.isGoalMet
                                            ? 'Daily goal completed! Streak active 🔥'
                                            : `${goalProgress.totalCount - goalProgress.completedCount} more tasks to reach daily goal`}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.dailyGoalCountPill}>
                                <Text style={styles.dailyGoalCountCurrent}>{goalProgress.completedCount}</Text>
                                <Text style={styles.dailyGoalCountTotal}>/ {goalProgress.totalCount}</Text>
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
                                <Icon name="Award" size={26} color="white" animated="pulse" />
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
                            <View style={styles.tileIconCircle}>
                                <Icon name="HelpCircle" size={28} color="primary" animated="pulse" />
                            </View>
                            <Text style={[styles.tileTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>Quiz</Text>
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
                                router.push('/(drawer)/flashcards/create' as any);
                            }}
                        >
                            <View style={styles.tileIconCircle}>
                                <Icon name="Layers" size={28} color="primary" animated="pulse" />
                            </View>
                            <Text style={[styles.tileTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                                Flashcards
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
                            <View style={styles.tileIconCircle}>
                                <Icon name="Clock" size={28} color="primary" animated="pulse" />
                            </View>
                            <Text style={[styles.tileTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>History</Text>
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
                            {dailyTasks.map((task) => (
                                <TouchableOpacity
                                    key={task.id}
                                    activeOpacity={0.85}
                                    style={[
                                        styles.taskCard,
                                        {
                                            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                            borderColor: task.completed
                                                ? (isDark ? 'rgba(52, 199, 89, 0.35)' : 'rgba(52, 199, 89, 0.45)')
                                                : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                        },
                                    ]}
                                    onPress={() => {
                                        haptics.impactAsync();
                                        router.push(task.route as any);
                                    }}
                                >
                                    <View style={styles.taskCardLeft}>
                                        <View style={styles.taskIconCircle}>
                                            <Icon
                                                name={task.icon as any}
                                                size={22}
                                                color={task.completed ? 'success' : 'primary'}
                                                animated={!task.completed ? 'pulse' : false}
                                            />
                                        </View>
                                        <View style={styles.taskTextWrap}>
                                            <Text
                                                style={[
                                                    styles.taskTitle,
                                                    {
                                                        color: isDark ? '#FFFFFF' : '#1C1C1E',
                                                        textDecorationLine: task.completed ? 'line-through' : 'none',
                                                        opacity: task.completed ? 0.65 : 1,
                                                    },
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {task.title}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => handleToggleTask(task.id)}
                                        style={styles.arrowPill}
                                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                    >
                                        <Icon
                                            name={task.completed ? 'CheckCircle2' : 'ArrowUpRight'}
                                            size={20}
                                            color={task.completed ? 'success' : 'primary'}
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
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
    dropdownMenu: {
        position: 'absolute',
        left: 18,
        width: 250,
        borderRadius: 20,
        borderWidth: 1,
        padding: 10,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 28,
        elevation: 16,
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
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    tileIconCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    tileTitle: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
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
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
