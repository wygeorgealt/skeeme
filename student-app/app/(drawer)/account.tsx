import { useState } from 'react';
import {
    View, ScrollView, TouchableOpacity, Alert,
    Platform, useColorScheme, Image, StyleSheet, Switch
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { Text } from '@/components/ui/Text';

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    scroll: { paddingHorizontal: 16 },
    
    profileSection: { alignItems: 'center', marginBottom: 32 },
    avatarCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%' },
    avatarInitial: { fontSize: 36, fontWeight: '700' },
    profileName: { fontSize: 24, fontWeight: '700', marginBottom: 4, letterSpacing: -0.5 },
    profileEmail: { fontSize: 15 },

    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 16 },
    rowIcon: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
    rowValue: { fontSize: 16, marginRight: 8 },

    sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
});

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingsRow({
    icon, iconBg, label, value, onPress, isLast = false, isDark, destructive = false,
    hasSwitch = false, switchValue = false, onSwitch = () => {}
}: {
    icon?: string; iconBg?: string; label: string; value?: string;
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
            {icon && iconBg && (
                <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon as any} size={18} color="#fff" />
                </View>
            )}
            <Text style={[s.rowLabel, { color: destructive ? C.destructive : C.text, marginLeft: icon ? 0 : 16, textAlign: destructive ? 'center' : 'left' }]} numberOfLines={1}>
                {label}
            </Text>
            {value ? <Text style={[s.rowValue, { color: C.textSecondary }]}>{value}</Text> : null}
            {hasSwitch ? (
                <Switch value={switchValue} onValueChange={onSwitch} />
            ) : (
                !!onPress && !destructive && <Ionicons name="chevron-forward" size={16} color={C.textTertiary} />
            )}
        </TouchableOpacity>
    );
}

// ─── IosCard Component ───────────────────────────────────────────────────────
function GroupedCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    const C = Colors[isDark ? 'dark' : 'light'];
    return (
        <View style={[{ backgroundColor: C.card, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: 24 }]}>
            <View style={{ paddingLeft: 16 }}>
                {children}
            </View>
        </View>
    );
}

export default function AccountScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    const { user, logout, theme, setTheme } = useAuthStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out', style: 'destructive', onPress: async () => {
                    try { await api.post('logout'); } catch {}
                    logout();
                    router.replace('/login');
                }
            }
        ]);
    };

    if (!user) return null;

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView
                contentContainerStyle={[s.scroll, { paddingTop: insets.top + 40, paddingBottom: 150 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Avatar + Name ── */}
                <View style={s.profileSection}>
                    <View style={[s.avatarCircle, { backgroundColor: C.primary + '20' }]}>
                        {user.avatar || user.avatar_url ? (
                            <Image source={{ uri: user.avatar || user.avatar_url }} style={s.avatarImg} />
                        ) : (
                            <Text style={[s.avatarInitial, { color: C.primary }]}>{user.name?.charAt(0)}</Text>
                        )}
                    </View>
                    <Text style={[s.profileName, { color: C.text }]}>{user.name}</Text>
                    <Text style={[s.profileEmail, { color: C.textSecondary }]}>{user.email}</Text>
                </View>

                {/* ── Section 1: Plan & Credits ── */}
                <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Account</Text>
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon="sparkles" iconBg="#007AFF"
                        label="Current Plan"
                        value={user.is_unlimited ? 'Unlimited Pro' : 'Free Academic'}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon="diamond" iconBg="#34C759"
                        label="Credits Remaining"
                        value={user.is_unlimited ? '∞' : `${user.credits}`}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon="arrow-up-circle" iconBg="#FF9500"
                        label="Upgrade Plan"
                        onPress={() => router.push('/upgrade')}
                        isLast={true}
                        isDark={isDark}
                    />
                </GroupedCard>

                {/* ── Section 2: Preferences ── */}
                <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Preferences</Text>
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon="color-wand" iconBg="#5E5CE6"
                        label="AI Preferences"
                        onPress={() => router.push('/preferences')}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon="notifications" iconBg="#FF2D55"
                        label="Notifications"
                        hasSwitch={true}
                        switchValue={notificationsEnabled}
                        onSwitch={setNotificationsEnabled}
                        isDark={isDark}
                    />
                    <View style={{ paddingVertical: 12, paddingRight: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {(['light', 'dark', 'system'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTheme(t)}
                                    style={{
                                        flex: 1, paddingVertical: 8, borderRadius: 8,
                                        alignItems: 'center', backgroundColor: theme === t ? C.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9')
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme === t ? '#FFF' : C.text, textTransform: 'capitalize' }}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </GroupedCard>

                {/* ── Section 3: Support ── */}
                <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Support</Text>
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon="help-circle" iconBg="#8E8E93"
                        label="Help & FAQ"
                        onPress={() => router.push('/support')}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon="shield-checkmark" iconBg="#8E8E93"
                        label="Privacy Policy"
                        onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon="document-text" iconBg="#8E8E93"
                        label="Terms of Service"
                        onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')}
                        isLast={true}
                        isDark={isDark}
                    />
                </GroupedCard>

                {/* ── Section 4: Log Out ── */}
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        label="Log Out"
                        onPress={handleSignOut}
                        isLast={true}
                        isDark={isDark}
                        destructive={true}
                    />
                </GroupedCard>
            </ScrollView>
        </View>
    );
}
