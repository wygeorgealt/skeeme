import { View, ScrollView, TouchableOpacity, useColorScheme, StyleSheet, Platform, Modal, TextInput, Alert, Switch } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '@/store/authStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors, Radius } from '@/constants/theme';
import AltArrowRight from '@/assets/icons/pikaicons/arrow-right.svg';
import Letter from '@/assets/icons/pikaicons/envelope-default.svg';
import UserIcon from '@/assets/icons/pikaicons/user-default.svg';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import Settings01 from '@/assets/icons/pikaicons/settings-01.svg';
import AwardMedal from '@/assets/icons/pikaicons/award-medal.svg';
import FolderDefault from '@/assets/icons/pikaicons/folder-default.svg';
import ClockDefault from '@/assets/icons/pikaicons/clock-default.svg';
import BookmarkDefault from '@/assets/icons/pikaicons/bookmark-default.svg';
import File02Default from '@/assets/icons/pikaicons/file-02-default.svg';
import Troubleshoot from '@/assets/icons/pikaicons/troubleshoot.svg';

// ─── Settings Row Component ─────────────────────────────────────────────────────────────
function SettingsRow({
    iconSource, iconBg, label, value, onPress, isLast = false, isDark, destructive = false,
    hasSwitch = false, switchValue = false, onSwitch = () => {}
}: {
    iconSource?: any; iconBg?: string; label: string; value?: string;
    onPress?: () => void; isLast?: boolean; isDark: boolean; destructive?: boolean;
    hasSwitch?: boolean; switchValue?: boolean; onSwitch?: (val: boolean) => void;
}) {
    const C = Colors[isDark ? 'dark' : 'light'];
    return (
        <TouchableOpacity
            onPress={hasSwitch ? undefined : onPress}
            activeOpacity={hasSwitch ? 1 : 0.7}
            style={[s.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}
        >
            {iconSource && iconBg && (
                <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
                    <Image source={iconSource} style={{ width: 22, height: 22 }} contentFit="contain" />
                </View>
            )}
            <Text style={[s.rowLabel, { color: destructive ? C.destructive : C.text, marginLeft: iconSource ? 0 : 16, textAlign: (destructive && !iconSource) ? 'center' : 'left' }]} numberOfLines={1}>
                {label}
            </Text>
            {value ? <Text style={[s.rowValue, { color: C.textSecondary }]}>{value}</Text> : null}
            {hasSwitch ? (
                <Switch 
                    value={switchValue} 
                    onValueChange={onSwitch}
                    trackColor={{ false: '#767577', true: '#34C759' }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#f4f3f4'}
                />
            ) : (
                !!onPress && !destructive && <AltArrowRight width={18} height={18} color={C.textTertiary} />
            )}
        </TouchableOpacity>
    );
}

// ─── GroupedCard Component ───────────────────────────────────────────────────────
function GroupedCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    const C = Colors[isDark ? 'dark' : 'light'];
    return (
        <View style={[{ backgroundColor: C.card, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={{ paddingLeft: 16 }}>
                {children}
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    scroll: { paddingHorizontal: 20 },
    
    // Header
    headerWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarOuter: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    avatarImg: { width: '100%', height: '100%' },
    headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBtn: { padding: 6 },

    // Premium Banner
    premiumBanner: { borderRadius: 20, padding: 20, marginBottom: 24, overflow: 'hidden' },
    premiumTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
    premiumSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
    premiumBtn: { backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-start' },
    premiumBtnText: { fontWeight: '800', fontSize: 14 },

    // Grid Region (2-column)
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16, marginBottom: 32 },
    gridItem: { width: '48%', aspectRatio: 1.1, borderRadius: 24, padding: 16, alignItems: 'center', justifyContent: 'center' },
    gridItemFull: { width: '100%', borderRadius: 24, padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start' },
    gridIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    gridTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center', marginTop: 12 },
    gridSub: { fontSize: 12, textAlign: 'center', fontWeight: '500' },

    // Settings rows
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 16 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
    rowValue: { fontSize: 16, marginRight: 8 },
    sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 16, textTransform: 'uppercase' },
});

export default function AccountScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    
    const { user, login, logout, theme, setTheme, hapticsEnabled } = useAuthStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    
    // Settings and Log Out have been moved to settings.tsx
    
    if (!user) return null;

    const isPremium = user.plan_name === 'pro' || user.plan_name === 'standard' || user.plan_name === 'max' || user.plan_name === 'elite';
    
    const prefs = user.ai_preferences;
    const toneStr = prefs?.tone ? prefs.tone.charAt(0).toUpperCase() + prefs.tone.slice(1) : 'Supportive';
    const goalStr = prefs?.academic_goal === 'exam' ? 'Exam Prep' : (prefs?.academic_goal === 'cheat' ? 'Cheat Sheet' : 'Deep Dive');
    const prefSummary = `${toneStr} • ${goalStr}`;

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Animated.View entering={FadeInUp.duration(500)}>
                <View style={{ paddingTop: Math.max(insets.top, 16) }} />
            </Animated.View>

            <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 10, paddingBottom: 150 }]} showsVerticalScrollIndicator={false}>
                {/* ── Header ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} style={s.headerWrap}>
                    <View style={s.headerLeft}>
                        <View style={[s.avatarOuter, { backgroundColor: C.primary + '20' }]}>
                            <UserIcon width={28} height={28} color={C.primary} />
                        </View>
                        <View>
                            <Text style={[s.headerTitle, { color: C.text }]}>{user.name}</Text>
                        </View>
                    </View>

                    <View style={s.headerRight}>
                        <TouchableOpacity
                            onPress={() => router.push('/(drawer)/settings' as any)}
                            style={[s.iconBtn, {alignItems: 'center', justifyContent: 'center'}]}
                            activeOpacity={0.7}
                        >
                            <Settings01 width={24} height={24} color={C.text} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* ── Credit Balance Banner ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        style={[s.premiumBanner, { backgroundColor: isPremium ? '#FF9500' : '#007AFF' }]}
                        onPress={() => router.push(isPremium ? '/paywall' : '/buy-credits' as any)}
                    >
                        <Text style={s.premiumTitle}>
                            {isPremium ? 'Skeeme Pro Active' : `${user.credits ?? 0} Credits Available`}
                        </Text>
                        <Text style={s.premiumSubtitle}>
                            {isPremium ? 'Enjoying unlimited access.' : 'Tap to get more credits for scans and quizzes'}
                        </Text>
                        {!isPremium && (
                            <View style={s.premiumBtn}>
                                <Text style={[s.premiumBtnText, { color: '#007AFF' }]}>Top Up</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Grid Region ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(300)} style={s.gridContainer}>
                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : '#FFF0F0' }]}
                        activeOpacity={0.7}
                    >
                        <AwardMedal width={40} height={40} color="#FF3B30" style={{marginBottom: 8}} />
                        <Text style={[s.gridTitle, { color: '#FF3B30' }]}>{user.streak?.current_streak || 0} Day</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Streak</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : '#F8F9FA' }]}
                        onPress={() => router.push('/(drawer)/flashcards' as any)}
                        activeOpacity={0.7}
                    >
                        <FolderDefault width={40} height={40} color={C.primary} style={{marginBottom: 8}} />
                        <Text style={[s.gridTitle, { color: C.text }]}>Flashcards</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Decks</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : '#F8F9FA' }]}
                        onPress={() => router.push('/(drawer)/history' as any)}
                        activeOpacity={0.7}
                    >
                        <ClockDefault width={40} height={40} color={C.primary} style={{marginBottom: 8}} />
                        <Text style={[s.gridTitle, { color: C.text }]}>History</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Past scans</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : '#F8F9FA' }]}
                        onPress={() => router.push('/(drawer)/history/saved' as any)}
                        activeOpacity={0.7}
                    >
                        <BookmarkDefault width={40} height={40} color="#34C759" style={{marginBottom: 8}} />
                        <Text style={[s.gridTitle, { color: C.text }]}>Saved</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Bookmarks</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : '#F0F5FF' }]}
                        onPress={() => router.push('/(drawer)/generate' as any)}
                        activeOpacity={0.7}
                    >
                        <File02Default width={40} height={40} color="#007AFF" style={{marginBottom: 8}} />
                        <Text style={[s.gridTitle, { color: '#007AFF' }]}>Practice</Text>
                        <Text style={[s.gridSub, { color: '#007AFF' }]}>Quizzes</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : '#F8F9FA' }]}
                        onPress={() => router.push('/(drawer)/support' as any)}
                        activeOpacity={0.7}
                    >
                        <Troubleshoot width={40} height={40} color="#FF9500" style={{marginBottom: 8}} />
                        <Text style={[s.gridTitle, { color: C.text }]}>Support</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Help & Feedback</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItemFull, { backgroundColor: isDark ? C.card : '#F8F9FA' }]}
                        onPress={() => router.push('/(drawer)/preferences' as any)}
                        activeOpacity={0.7}
                    >
                        <Settings01 width={40} height={40} color={C.text} />
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={[s.gridTitle, { color: C.text, textAlign: 'left', marginTop: 0 }]}>Personalize</Text>
                            <Text style={[s.gridSub, { color: C.textTertiary, textAlign: 'left', lineHeight: 18 }]} numberOfLines={3}>{prefSummary}</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}