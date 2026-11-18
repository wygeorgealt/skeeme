import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import {
    KubaiNativeIcon,
    type KubaiNativeIconName,
} from '@/components/ui/KubaiNativeIcon';
import { DASHBOARD_THEME } from './dashboardTokens';

type ActivityPoint = number | { value: number };

interface LearningPlanOverviewProps {
    weeklyActivityPoints?: ActivityPoint[];
    studySessionsThisWeek?: number;
    onStreakPress: () => void;
}

interface QuickActionCardProps {
    iconName: KubaiNativeIconName;
    title: string;
    backgroundColor: string;
    iconColor: string;
    iconBackgroundColor: string;
    onPress: () => void;
}

const DAYS_SUNDAY_FIRST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function activityValue(point: ActivityPoint | undefined) {
    const value = typeof point === 'number' ? point : point?.value ?? 0;
    return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function QuickActionCard({
    iconName,
    title,
    backgroundColor,
    iconColor,
    iconBackgroundColor,
    onPress,
}: QuickActionCardProps) {
    const [pressed, setPressed] = useState(false);
    const reduceMotion = useReducedMotion();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={onPress}
            onPressIn={() => setPressed(!reduceMotion)}
            onPressOut={() => setPressed(false)}
            style={styles.quickCardPressable}
        >
            <Animated.View
                style={[
                    styles.quickCard,
                    {
                        backgroundColor,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                        transitionProperty: 'transform',
                        transitionDuration: '120ms',
                        transitionTimingFunction: 'ease-out',
                    },
                ]}
            >
                <View style={[styles.iconBadge, { backgroundColor: iconBackgroundColor }]}>
                    <KubaiNativeIcon
                        name={iconName}
                        size={20}
                        color={iconColor}
                    />
                </View>
                <Text style={styles.quickTitle}>{title}</Text>
            </Animated.View>
        </Pressable>
    );
}

export function LearningPlanOverview({
    weeklyActivityPoints,
    studySessionsThisWeek,
    onStreakPress,
}: LearningPlanOverviewProps) {
    const router = useRouter();
    const todayIndex = new Date().getDay();
    const hasActivityData = Boolean(weeklyActivityPoints?.length);

    const weeklyActivity = useMemo(() => {
        const mondayFirst = Array.from({ length: 7 }, (_, index) =>
            activityValue(weeklyActivityPoints?.[index]),
        );

        return [mondayFirst[6], ...mondayFirst.slice(0, 6)];
    }, [weeklyActivityPoints]);

    const activeDays = weeklyActivity.filter((value) => value > 0).length;
    const maxActivity = Math.max(...weeklyActivity, 1);
    const progress = hasActivityData ? (activeDays / 7) * 100 : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open profile"
                    onPress={() => router.push('/(drawer)/(tabs)/profile')}
                    style={styles.profileButton}
                >
                    <KubaiNativeIcon
                        name="options"
                        size={24}
                        color={DASHBOARD_THEME.text}
                    />
                </Pressable>
            </View>

            <View style={styles.quickActions}>
                <QuickActionCard
                    iconName="notes"
                    title="My Notes"
                    backgroundColor="#EAF1FA"
                    iconColor={DASHBOARD_THEME.primary}
                    iconBackgroundColor="#FFFFFF"
                    onPress={() =>
                        router.push({
                            pathname: '/(drawer)/(tabs)/library',
                            params: { filter: 'notes' },
                        })
                    }
                />

                <QuickActionCard
                    iconName="quiz"
                    title="My Quizzes"
                    backgroundColor="#FFF4B8"
                    iconColor={DASHBOARD_THEME.text}
                    iconBackgroundColor={DASHBOARD_THEME.accent}
                    onPress={() =>
                        router.push({
                            pathname: '/(drawer)/(tabs)/library',
                            params: { filter: 'quizzes' },
                        })
                    }
                />

                <QuickActionCard
                    iconName="streak"
                    title="My Streaks"
                    backgroundColor="#FFFFFF"
                    iconColor={DASHBOARD_THEME.primary}
                    iconBackgroundColor={DASHBOARD_THEME.accent}
                    onPress={onStreakPress}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly progress</Text>
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <View>
                            <Text style={styles.progressEyebrow}>Active study days</Text>
                            <Text style={styles.progressValue}>
                                {hasActivityData ? `${activeDays} of 7` : '—'}
                            </Text>
                        </View>
                        <View style={styles.progressIcon}>
                            <KubaiNativeIcon
                                name="activeDays"
                                size={25}
                                color={DASHBOARD_THEME.primary}
                            />
                        </View>
                    </View>

                    <View
                        accessibilityRole="progressbar"
                        accessibilityLabel="Active study days this week"
                        accessibilityValue={{
                            min: 0,
                            max: 7,
                            now: hasActivityData ? activeDays : 0,
                        }}
                        style={styles.progressTrack}
                    >
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        {hasActivityData && activeDays > 0 ? (
                            <View
                                style={[
                                    styles.progressMarker,
                                    { left: `${Math.min(progress, 97)}%` },
                                ]}
                            />
                        ) : null}
                    </View>

                    <Text style={styles.supportingText}>
                        {hasActivityData
                            ? `${activeDays} ${activeDays === 1 ? 'day' : 'days'} with study activity`
                            : 'Your activity will appear here after your first study session.'}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.activityHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Learning activity</Text>
                        <Text style={styles.supportingText}>
                            {studySessionsThisWeek === undefined
                                ? 'Your study week at a glance'
                                : `${studySessionsThisWeek} study ${
                                      studySessionsThisWeek === 1 ? 'session' : 'sessions'
                                  } this week`}
                        </Text>
                    </View>
                    <View style={styles.activityIcon}>
                        <KubaiNativeIcon
                            name="streak"
                            size={21}
                            color={DASHBOARD_THEME.text}
                        />
                    </View>
                </View>

                <View style={styles.activityCard}>
                    <View style={styles.chart}>
                        {weeklyActivity.map((value, index) => {
                            const barHeight = value > 0 ? Math.max((value / maxActivity) * 100, 8) : 0;

                            return (
                                <View key={DAYS_SUNDAY_FIRST[index]} style={styles.dayColumn}>
                                    <View style={styles.barTrack}>
                                        {barHeight > 0 ? (
                                            <View
                                                style={[
                                                    styles.activityBar,
                                                    {
                                                        height: `${barHeight}%`,
                                                        backgroundColor:
                                                            index === todayIndex
                                                                ? DASHBOARD_THEME.accent
                                                                : DASHBOARD_THEME.primary,
                                                    },
                                                ]}
                                            />
                                        ) : null}
                                    </View>
                                    <Text
                                        style={[
                                            styles.dayLabel,
                                            index === todayIndex && styles.todayLabel,
                                        ]}
                                    >
                                        {DAYS_SUNDAY_FIRST[index]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    {!hasActivityData ? (
                        <Text style={styles.emptyHint}>
                            Complete a study session to see your activity here.
                        </Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    pageTitle: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Bold',
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: -0.5,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderCurve: 'continuous',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...DASHBOARD_THEME.cardShadow,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 10,
    },
    quickCardPressable: {
        flex: 1,
        minWidth: 0,
    },
    quickCard: {
        flex: 1,
        minHeight: 112,
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 20,
        borderCurve: 'continuous',
        ...DASHBOARD_THEME.cardShadow,
    },
    iconBadge: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickTitle: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Bold',
        fontSize: 14,
        lineHeight: 18,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Bold',
        fontSize: 20,
        lineHeight: 25,
        letterSpacing: -0.25,
    },
    progressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderCurve: 'continuous',
        padding: 20,
        gap: 16,
        ...DASHBOARD_THEME.cardShadow,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressEyebrow: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Medium',
        fontSize: 14,
        lineHeight: 18,
    },
    progressValue: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Bold',
        fontSize: 34,
        lineHeight: 40,
        fontVariant: ['tabular-nums'],
        marginTop: 4,
    },
    progressIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderCurve: 'continuous',
        backgroundColor: DASHBOARD_THEME.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressTrack: {
        height: 10,
        borderRadius: 5,
        backgroundColor: DASHBOARD_THEME.surface,
        justifyContent: 'center',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
        backgroundColor: DASHBOARD_THEME.primary,
    },
    progressMarker: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: DASHBOARD_THEME.accent,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        marginLeft: -9,
    },
    supportingText: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Medium',
        fontSize: 13,
        lineHeight: 18,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderCurve: 'continuous',
        backgroundColor: DASHBOARD_THEME.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderCurve: 'continuous',
        padding: 18,
        ...DASHBOARD_THEME.cardShadow,
    },
    chart: {
        height: 152,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    dayColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    barTrack: {
        width: '100%',
        maxWidth: 32,
        height: 116,
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: DASHBOARD_THEME.surface,
        overflow: 'hidden',
    },
    activityBar: {
        width: '100%',
        borderRadius: 16,
        borderCurve: 'continuous',
    },
    dayLabel: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Medium',
        fontSize: 11,
        lineHeight: 15,
    },
    todayLabel: {
        fontFamily: 'Allo-Bold',
    },
    emptyHint: {
        color: DASHBOARD_THEME.text,
        fontFamily: 'Allo-Medium',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 12,
        textAlign: 'center',
    },
});
