import { useCallback, useState } from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useStudent } from '@/hooks/useStudent';
import { StreakAnimation } from '@/components/StreakAnimation';
import { Text } from '@/components/ui/Text';
import { DASHBOARD_THEME } from '@/components/dashboard/dashboardTokens';
import { LearningPlanOverview } from '@/components/dashboard/LearningPlanOverview';
import { useTabBarScroll } from '@/components/ui/TabBarScrollContext';

export default function HomeDashboard() {
    const insets = useSafeAreaInsets();
    const user = useAuthStore((s) => s.user);
    const { refetch, isRefetching } = useStudent();
    const handleScroll = useTabBarScroll('index');

    const [streakModalVisible, setStreakModalVisible] = useState(false);

    const onRefresh = useCallback(() => {
        refetch().catch(() => {});
    }, [refetch]);

    const streak = user?.streak?.current_streak;

    return (
        <View style={[styles.root, { backgroundColor: DASHBOARD_THEME.surface }]}>
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: Math.max(insets.top, 16),
                        paddingBottom: Math.max(insets.bottom + 100, 120),
                    },
                ]}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={DASHBOARD_THEME.primary}
                    />
                }
            >
                <LearningPlanOverview
                    weeklyActivityPoints={user?.weekly_activity_points}
                    studySessionsThisWeek={user?.study_sessions_this_week}
                    onStreakPress={() => setStreakModalVisible(true)}
                />
            </ScrollView>

            {/* Streak Presentation Modal */}
            <Modal
                visible={streakModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setStreakModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setStreakModalVisible(false)}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {}}
                        style={styles.modalCard}
                    >
                        <StreakAnimation isDark={false} size={200} />
                        <Text style={styles.modalTitle}>
                            {streak ?? 0} {(streak ?? 0) === 1 ? 'Day' : 'Days'} Streak
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            Consistency is key. Keep building your daily study momentum with Skeemy.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => setStreakModalVisible(false)}
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>Keep it going</Text>
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
    scrollContent: {
        flexGrow: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...DASHBOARD_THEME.cardShadow,
    },
    modalTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 22,
        color: DASHBOARD_THEME.text,
        marginTop: 12,
        marginBottom: 6,
    },
    modalSubtitle: {
        fontFamily: 'Allo-Regular',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        color: DASHBOARD_THEME.text,
        marginBottom: 20,
    },
    modalButton: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        backgroundColor: DASHBOARD_THEME.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        fontFamily: 'Allo-Bold',
        fontSize: 15,
        color: '#FFFFFF',
    },
});
