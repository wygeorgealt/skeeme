import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, useColorScheme, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { getDashboardStats } from '../services/api';
import { theme } from '../constants/theme';

const StatCard = ({ title, value, icon, gradient, isDark }) => (
    <View style={[styles.cardContainer, { width: Dimensions.get('window').width / 2 - 24 }]}>
        <LinearGradient
            colors={gradient}
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        />
        <View style={[styles.cardBody, isDark ? styles.cardBodyDark : styles.cardBodyLight]}>
            <View style={[styles.iconContainer, isDark ? styles.iconContainerDark : styles.iconContainerLight]}>
                <FontAwesome name={icon} color={isDark ? '#e4e4e7' : '#52525b'} size={18} />
            </View>
            <Text style={[styles.statValue, isDark ? styles.textDark : styles.textLight]}>{value}</Text>
            <Text style={[styles.statTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>{title}</Text>
        </View>
    </View>
);

export default function DashboardScreen() {
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    if (!stats) return null;

    return (
        <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#000'} />}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>Overview</Text>
                    <Text style={[styles.headerSubtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                        Here's what's happening today.
                    </Text>
                </View>

                <View style={styles.grid}>
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon="users"
                        gradient={theme.colors.gradients.primary}
                        isDark={isDark}
                    />
                    <StatCard
                        title="Active Students"
                        value={stats.active_students}
                        icon="graduation-cap"
                        gradient={theme.colors.gradients.success}
                        isDark={isDark}
                    />
                    <StatCard
                        title="Total Exams"
                        value={stats.total_exams}
                        icon="file-text"
                        gradient={theme.colors.gradients.info}
                        isDark={isDark}
                    />
                    <StatCard
                        title="Exams Today"
                        value={stats.exams_taken_today}
                        icon="clock-o"
                        gradient={theme.colors.gradients.warning}
                        isDark={isDark}
                    />
                </View>

                <View style={[styles.sectionCard, isDark ? styles.cardBodyDark : styles.cardBodyLight]}>
                    <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>Recent Signups</Text>
                    <View style={styles.divider} />
                    {stats.recent_signups.map((user, i) => (
                        <View key={i} style={styles.userRow}>
                            <View style={styles.userIcon}>
                                <Text style={styles.userInitials}>{user.name.substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, isDark ? styles.textDark : styles.textLight]}>{user.name}</Text>
                                <Text style={[styles.userEmail, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>{user.email}</Text>
                            </View>
                            <View style={styles.dateInfo}>
                                <Text style={[styles.userTime, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: { backgroundColor: '#f4f4f5' },
    containerDark: { backgroundColor: '#18181b' },
    scrollContent: { padding: 16 },

    header: { marginBottom: 24, marginTop: 10 },
    headerTitle: { fontWeight: '700', fontSize: 24, marginBottom: 4 },
    headerSubtitle: { fontSize: 14 },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradientHeader: { height: 4, width: '100%' },
    cardBody: {
        padding: 16,
        paddingTop: 12,
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    cardBodyLight: { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#e4e4e7' },
    cardBodyDark: { backgroundColor: 'rgba(39,39,42,0.6)', borderColor: 'rgba(255,255,255,0.1)' },

    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconContainerLight: { backgroundColor: '#e4e4e7' },
    iconContainerDark: { backgroundColor: '#3f3f46' },

    statValue: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
    statTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    sectionCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
    divider: { height: 1, backgroundColor: 'rgba(128,128,128,0.2)', marginBottom: 16 },

    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    userIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userInitials: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    userInfo: { flex: 1 },
    userName: { fontSize: 14, fontWeight: '600' },
    userEmail: { fontSize: 12 },
    dateInfo: { alignItems: 'flex-end' },
    userTime: { fontSize: 12 },

    textLight: { color: theme.colors.textPrimaryLight },
    textDark: { color: theme.colors.textPrimaryDark },
    textSecondaryLight: { color: theme.colors.textSecondaryLight },
    textSecondaryDark: { color: theme.colors.textSecondaryDark },
});
