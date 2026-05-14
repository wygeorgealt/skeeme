import { Text } from '@/components/ui/Text';
import { View, ScrollView, TouchableOpacity, useColorScheme, Platform, StyleSheet } from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { ShareCard } from '@/components/ui/ShareCard';
import { AltArrowLeft, Stars } from '@solar-icons/react-native/Bold';
import { StreakAnimation } from '@/components/StreakAnimation';
import { Colors, Radius } from '@/constants/theme';
import { Animated as RNAnimated } from 'react-native';

export default function StreakScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    // Milestones
    const current = user?.streak?.current_streak || 0;
    const longest = user?.streak?.longest_streak || 0;
    const viewShotRef = useRef<any>(null);
    const fadeAnim = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        RNAnimated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const shareStreak = async () => {
        try {
            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, {
                        dialogTitle: 'Share your Skeeme Streak',
                        mimeType: 'image/jpeg',
                    });
                }
            }
        } catch (error) {
            if (__DEV__) console.error('Sharing failed', error);
        }
    };
    
    const milestones = [
        { title: '7 Day Streak', target: 7, reward: '50 Credits' },
        { title: '14 Day Streak', target: 14, reward: '100 Credits' },
        { title: '30 Day Streak', target: 30, reward: '200 Credits' },
        { title: '60 Day Streak', target: 60, reward: '500 Credits' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Stack.Screen options={{ headerShown: false }} />
            <ShareCard type="streak" data={{ current_streak: current }} viewShotRef={viewShotRef} />

            {/* Header */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 12) }]}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[s.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                    <AltArrowLeft size={24} color={C.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text }]}>Momentum</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={s.scrollView} 
                contentContainerStyle={{ paddingBottom: 120 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Center Animation Hero */}
                <RNAnimated.View style={[s.hero, { opacity: fadeAnim }]}>
                    <StreakAnimation streakCount={current} size={220} isDark={isDark} />
                </RNAnimated.View>

                {/* Stats Container */}
                <View style={s.statsContainer}>
                    <View style={[s.statCard, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                        <Text style={[s.statLabel, { color: C.textTertiary }]}>PERSONAL BEST</Text>
                        <View style={s.statValueRow}>
                            <Text style={[s.statValue, { color: C.text }]}>{longest}</Text>
                            <Text style={[s.statUnit, { color: C.textTertiary }]}>Days</Text>
                        </View>
                    </View>
                    
                    {(current > 0 || longest > 0) && (
                        <TouchableOpacity
                            onPress={shareStreak}
                            activeOpacity={0.85}
                            style={[s.shareAction, { backgroundColor: C.primary }]}
                        >
                            <Stars size={18} color="#FFF" />
                            <Text style={s.shareActionText}>Share</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Milestones Section */}
                <Text style={[s.sectionLabel, { color: C.textSecondary }]}>ACHIEVEMENTS</Text>
                <View style={[s.groupedCard, { backgroundColor: C.card, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                    {milestones.map((m, i) => {
                        const progress = Math.min(100, (current / m.target) * 100);
                        const isUnlocked = current >= m.target;
                        const isLast = i === milestones.length - 1;
                        
                        return (
                            <View key={i} style={[s.milestoneRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
                                <View style={s.milestoneInfo}>
                                    <View>
                                        <Text style={[s.milestoneTitle, { color: C.text }]}>{m.title}</Text>
                                        <Text style={[s.milestoneReward, { color: C.primary }]}>{m.reward}</Text>
                                    </View>
                                    <Text style={[s.milestoneProgressText, { color: C.textTertiary }]}>{current} / {m.target}</Text>
                                </View>
                                <View style={[s.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                                    <View 
                                        style={[
                                            s.progressBarFill, 
                                            { backgroundColor: isUnlocked ? '#34C759' : C.primary, width: `${progress}%` }
                                        ]} 
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

    scrollView: { flex: 1, paddingHorizontal: 20 },
    hero: { alignItems: 'center', marginVertical: 20, marginBottom: 10 },
    
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 32, alignItems: 'center' },
    statCard: { flex: 1, borderRadius: 24, padding: 20, borderWidth: 1 },
    statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
    statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
    statValue: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
    statUnit: { fontSize: 12, fontWeight: '700', marginLeft: 4 },

    shareAction: { height: 72, paddingHorizontal: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 4 },
    shareActionText: { color: '#FFF', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

    sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase' },
    groupedCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1 },
    
    milestoneRow: { padding: 20 },
    milestoneInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    milestoneTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
    milestoneReward: { fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
    milestoneProgressText: { fontWeight: '700', fontSize: 11, marginTop: 4 },
    
    progressBarBg: { height: 8, borderRadius: 10, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 10 },
});