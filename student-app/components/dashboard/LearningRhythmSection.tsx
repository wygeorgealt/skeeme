import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Clock, Flame, CalendarCheck } from 'lucide-react-native';
import { DASHBOARD_THEME } from './dashboardTokens';

interface LearningRhythmSectionProps {
    studyTimeText?: string;
    completedSessions?: number;
    weeklyPoints?: (number | { value: number })[];
    streak?: number;
}

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function LearningRhythmSection({
    studyTimeText = '2h 40m',
    completedSessions = 4,
    weeklyPoints = [1, 1, 1, 0, 0, 0, 0],
    streak = 1,
}: LearningRhythmSectionProps) {
    // Current day of week (0 = Monday, ..., 6 = Sunday)
    const todayIndex = useMemo(() => {
        const day = new Date().getDay();
        return day === 0 ? 6 : day - 1;
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Your learning rhythm</Text>
            </View>

            <View style={styles.card}>
                {/* Metrics Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCol}>
                        <View style={styles.statIconRow}>
                            <Clock size={16} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />
                            <Text style={styles.statLabel}>Study time this week</Text>
                        </View>
                        <Text style={styles.statBigValue}>{studyTimeText}</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statCol}>
                        <View style={styles.statIconRow}>
                            <Flame size={16} color="#EA580C" strokeWidth={2.2} />
                            <Text style={styles.statLabel}>Current streak</Text>
                        </View>
                        <Text style={[styles.statBigValue, { color: '#EA580C' }]}>
                            {streak} {streak === 1 ? 'day' : 'days'}
                        </Text>
                    </View>
                </View>

                {/* Weekly Activity Progress */}
                <View style={styles.activityBox}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activityTitle}>Weekly activity</Text>
                        <Text style={styles.activitySessions}>
                            {completedSessions} sessions completed
                        </Text>
                    </View>

                    <View style={styles.daysRow}>
                        {DAYS_OF_WEEK.map((day, idx) => {
                            const point = weeklyPoints[idx];
                            const numVal =
                                typeof point === 'object' && point !== null
                                    ? point.value
                                    : typeof point === 'number'
                                    ? point
                                    : 0;
                            const isCompleted = numVal > 0;
                            const isToday = idx === todayIndex;

                            return (
                                <View key={idx} style={styles.dayCol}>
                                    <View
                                        style={[
                                            styles.dayCircle,
                                            isCompleted
                                                ? styles.dayCircleActive
                                                : isToday
                                                ? styles.dayCircleToday
                                                : styles.dayCircleEmpty,
                                        ]}
                                    >
                                        {isCompleted ? (
                                            <CalendarCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
                                        ) : (
                                            <View
                                                style={[
                                                    styles.dayDot,
                                                    isToday && styles.dayDotToday,
                                                ]}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.dayLabel,
                                            isToday && styles.dayLabelToday,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 36,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 18,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.3,
    },
    card: {
        backgroundColor: DASHBOARD_THEME.card,
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        ...DASHBOARD_THEME.cardShadow,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: DASHBOARD_THEME.borderLight,
    },
    statCol: {
        flex: 1,
    },
    statIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    statLabel: {
        fontFamily: 'Allo-Medium',
        fontSize: 12,
        color: DASHBOARD_THEME.textSecondary,
    },
    statBigValue: {
        fontFamily: 'Allo-Bold',
        fontSize: 22,
        lineHeight: 28,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.3,
    },
    statDivider: {
        width: 1,
        height: 38,
        backgroundColor: DASHBOARD_THEME.borderLight,
        marginHorizontal: 16,
    },
    activityBox: {
        paddingTop: 16,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    activityTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 14,
        color: DASHBOARD_THEME.text,
    },
    activitySessions: {
        fontFamily: 'Allo-Medium',
        fontSize: 12,
        color: DASHBOARD_THEME.primary,
    },
    daysRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dayCol: {
        alignItems: 'center',
        gap: 6,
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleActive: {
        backgroundColor: DASHBOARD_THEME.primary,
    },
    dayCircleToday: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1.5,
        borderColor: DASHBOARD_THEME.primary,
    },
    dayCircleEmpty: {
        backgroundColor: '#F1F5F9',
    },
    dayDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#CBD5E1',
    },
    dayDotToday: {
        backgroundColor: DASHBOARD_THEME.primary,
    },
    dayLabel: {
        fontFamily: 'Allo-Medium',
        fontSize: 12,
        color: DASHBOARD_THEME.textSecondary,
    },
    dayLabelToday: {
        fontFamily: 'Allo-Bold',
        color: DASHBOARD_THEME.primary,
    },
});
