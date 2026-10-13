import { View, ScrollView, TouchableOpacity, StyleSheet, Platform, Modal, TextInput, Alert, Switch } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { useAuthStore } from '@/store/authStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors, Radius } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { 
    User as UserIcon, 
    Award, 
    Folder, 
    Clock, 
    Bookmark, 
    HelpCircle, 
    Settings, 
    ChevronRight, 
    FileText 
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// ─── Settings Row Component ───────────────────────────────────────────────────
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
                    trackColor={{ false: '#767577', true: C.primary }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : switchValue ? C.primary : '#f4f3f4'}
                />
            ) : (
                <Icon icon={ChevronRight} size={20} color={C.textTertiary} />
            )}
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20 },

    // Header
    headerWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarOuter: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },

    // Premium Banner
    premiumBanner: { borderRadius: 20, padding: 20, marginBottom: 24, overflow: 'hidden' },
    premiumTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
    premiumSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
    premiumBtn: { backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-start' },
    premiumBtnText: { fontWeight: '800', fontSize: 14 },

    // Grid Region (2-column)
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16, marginBottom: 32 },
    gridItem: { width: '48%', aspectRatio: 1.1, borderRadius: 24, padding: 16, alignItems: 'center', justifyContent: 'center' },
    gridItemFull: { width: '100%', borderRadius: 24, padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start' },
    gridTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center', marginTop: 12 },
    gridSub: { fontSize: 12, textAlign: 'center', fontWeight: '500' },

    // Settings rows
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 16 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
    rowValue: { fontSize: 16, marginRight: 8 },
});

export default function AccountScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    
    const { user } = useAuthStore();
    
    const [prefSummary, setPrefSummary] = useState('Loading...');

    const loadPrefs = async () => {
        try {
            const res = await api.get('user/profile');
            const p = res.data?.data?.user?.ai_preferences || res.data?.user?.ai_preferences;
            if (p) {
                const parts: string[] = [];
                if (p.field_of_study) parts.push(p.field_of_study);
                if (p.tone) parts.push(p.tone.charAt(0).toUpperCase() + p.tone.slice(1));
                if (p.style) parts.push(p.style.charAt(0).toUpperCase() + p.style.slice(1));
                setPrefSummary(parts.length > 0 ? parts.join(' • ') : 'Standard Skeeme Profile');
            } else {
                setPrefSummary('Default settings');
            }
        } catch {
            setPrefSummary('Default settings');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadPrefs();
        }, [])
    );

    if (!user) return null;

    const isPremium = user.plan_name === 'pro' || user.plan_name === 'max' || Boolean(user.is_premium);

    return (
        <View style={[s.container, { backgroundColor: C.background }]}>
            <ScreenHeader title="Account" />

            <ScrollView 
                contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── User Card ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} style={s.headerWrap}>
                    <View style={s.headerLeft}>
                        <View style={[s.avatarOuter, { backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : '#E5F1FF' }]}>
                            <Icon icon={UserIcon} size={26} color="primary" />
                        </View>
                        <View>
                            <Text style={[s.headerTitle, { color: C.text }]}>{user.name}</Text>
                            <Text style={{ fontSize: 13, color: C.textSecondary }}>{user.email}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Credit Balance Banner ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        style={[s.premiumBanner, { backgroundColor: isPremium ? '#F59E0B' : '#007AFF' }]}
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
                        <Icon icon={Award} size={36} color="#EF4444" style={{ marginBottom: 4 }} />
                        <Text style={[s.gridTitle, { color: '#EF4444' }]}>{user.streak?.current_streak || 0} Day</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Streak</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : C.surfaceLow }]}
                        onPress={() => router.push('/(drawer)/flashcards' as any)}
                        activeOpacity={0.7}
                    >
                        <Icon icon={Folder} size={36} color="primary" style={{ marginBottom: 4 }} />
                        <Text style={[s.gridTitle, { color: C.text }]}>Flashcards</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Decks</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : C.surfaceLow }]}
                        onPress={() => router.push('/(drawer)/history' as any)}
                        activeOpacity={0.7}
                    >
                        <Icon icon={Clock} size={36} color="primary" style={{ marginBottom: 4 }} />
                        <Text style={[s.gridTitle, { color: C.text }]}>History</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Past scans</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : C.surfaceLow }]}
                        onPress={() => router.push('/(drawer)/history/saved' as any)}
                        activeOpacity={0.7}
                    >
                        <Icon icon={Bookmark} size={36} color="#10B981" style={{ marginBottom: 4 }} />
                        <Text style={[s.gridTitle, { color: C.text }]}>Saved</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Bookmarks</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : '#E5F1FF' }]}
                        onPress={() => router.push('/(drawer)/generate' as any)}
                        activeOpacity={0.7}
                    >
                        <Icon icon={FileText} size={36} color="primary" style={{ marginBottom: 4 }} />
                        <Text style={[s.gridTitle, { color: '#007AFF' }]}>Practice</Text>
                        <Text style={[s.gridSub, { color: '#007AFF' }]}>Quizzes</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[s.gridItem, { backgroundColor: isDark ? C.card : C.surfaceLow }]}
                        onPress={() => router.push('/(drawer)/support' as any)}
                        activeOpacity={0.7}
                    >
                        <Icon icon={HelpCircle} size={36} color="#F59E0B" style={{ marginBottom: 4 }} />
                        <Text style={[s.gridTitle, { color: C.text }]}>Support</Text>
                        <Text style={[s.gridSub, { color: C.textTertiary }]}>Help & Feedback</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.gridItemFull, { backgroundColor: isDark ? C.card : C.surfaceLow }]}
                        onPress={() => router.push('/(drawer)/preferences' as any)}
                        activeOpacity={0.7}
                    >
                        <Icon icon={Settings} size={36} color={C.text} />
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
