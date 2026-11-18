import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { DASHBOARD_THEME } from './dashboardTokens';

interface DashboardHeaderProps {
    userName?: string;
    avatarUrl?: string;
    streak?: number;
    onStreakPress?: () => void;
}

export function DashboardHeader({
    userName = 'Student',
    streak = 0,
    onStreakPress,
}: DashboardHeaderProps) {
    const router = useRouter();

    const { greetingPrefix, dateString } = useMemo(() => {
        const now = new Date();
        const hour = now.getHours();

        let prefix = 'Good morning! ☀️';
        if (hour >= 12 && hour < 17) {
            prefix = 'Good afternoon!';
        } else if (hour >= 17 || hour < 5) {
            prefix = 'Good evening! 🌙';
        }

        const dateFormatted = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        }).format(now);

        return {
            greetingPrefix: prefix,
            dateString: dateFormatted,
        };
    }, []);

    const firstName = userName ? userName.trim().split(' ')[0] : 'there';

    return (
        <View style={styles.container}>
            <View style={styles.leftCol}>
                <Text style={styles.greeting}>
                    {greetingPrefix.replace(/[☀️🌙]/g, '').trim()}, {firstName} 👋
                </Text>
                <Text style={styles.dateText}>{dateString}</Text>
            </View>

            <View style={styles.rightCol}>
                {/* Streak Badge */}
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={onStreakPress}
                    style={styles.streakBadge}
                    accessibilityRole="button"
                    accessibilityLabel={`Current study streak: ${streak} days`}
                >
                    <Icon name="Flame" size={17} color="#EA580C" />
                    <Text style={styles.streakText}>{streak}</Text>
                </TouchableOpacity>

                {/* Profile Shortcut */}
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => router.push('/(drawer)/(tabs)/profile')}
                    style={styles.profileButton}
                    accessibilityRole="button"
                    accessibilityLabel="Open profile"
                >
                    <View style={styles.avatarWrap}>
                        <Icon name="User" size={18} color="default" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },
    leftCol: {
        flex: 1,
        paddingRight: 12,
    },
    greeting: {
        fontFamily: 'Allo-Bold',
        fontSize: 22,
        lineHeight: 28,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.3,
    },
    dateText: {
        fontFamily: 'Allo-Medium',
        fontSize: 13.5,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 2,
    },
    rightCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#FFF7ED',
        borderColor: '#FDBA74',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    streakText: {
        fontFamily: 'Allo-Bold',
        fontSize: 14,
        color: '#EA580C',
    },
    profileButton: {
        padding: 2,
    },
    avatarWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EEF2F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.border,
    },
});
