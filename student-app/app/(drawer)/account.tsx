import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Platform, useColorScheme, Image, StyleSheet, Switch } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AltArrowRight, Bill, RoundArrowUp, Settings, Bell, QuestionCircle, CheckCircle, DocumentText, Logout, TrashBinTrash, CupStar } from '@solar-icons/react-native/Bold';

import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { Text } from '@/components/ui/Text';

import RevenueCatUI from 'react-native-purchases-ui';
import { Modal } from 'react-native';

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
    rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
    rowValue: { fontSize: 16, marginRight: 8 },

    sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
});

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingsRow({
    icon: Icon, iconBg, label, value, onPress, isLast = false, isDark, destructive = false,
    hasSwitch = false, switchValue = false, onSwitch = () => {}
}: {
    icon?: any; iconBg?: string; label: string; value?: string;
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
            {Icon && iconBg && (
                <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
                    <Icon size={18} color="#fff" />
                </View>
            )}
            <Text style={[s.rowLabel, { color: destructive ? C.destructive : C.text, marginLeft: Icon ? 0 : 16, textAlign: destructive ? 'center' : 'left' }]} numberOfLines={1}>
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
                !!onPress && !destructive && <AltArrowRight size={18} color={C.textTertiary} />
            )}
        </TouchableOpacity>
    );
}

// ─── IosCard Component ───────────────────────────────────────────────────────
function GroupedCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    const C = Colors[isDark ? 'dark' : 'light'];
    return (
        <View style={[{ backgroundColor: C.card, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: isDark ? C.glassBorder : 'transparent' }]}>
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

    const { user, login, logout, theme, setTheme, hapticsEnabled } = useAuthStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteConfirmationCode, setDeleteConfirmationCode] = useState('');
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (deleteModalVisible) {
            // Generate a random 4-digit code e.g., DELETE-4921
            setDeleteConfirmationCode(`DELETE-${Math.floor(1000 + Math.random() * 9000)}`);
            setDeleteInput('');
        }
    }, [deleteModalVisible]);

    const handleDeleteAccount = async () => {
        if (deleteInput !== deleteConfirmationCode) return;
        
        setIsDeleting(true);
        try {
            await api.delete('profile');
            setDeleteModalVisible(false);
            Alert.alert("Account Deleted", "Your account has been deleted permanently.");
            logout();
            router.replace('/login');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to delete account. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setIsDeleting(false);
        }
    };

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
            {/* Top spacing */}
            <View style={{ paddingTop: insets.top + 16 }} />
            <ScrollView
                contentContainerStyle={[s.scroll, { paddingTop: 20, paddingBottom: 150 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Avatar + Name ── */}
                <View style={s.profileSection}>
                    <View style={{ marginBottom: 12 }}>
                        <View style={[s.avatarCircle, { backgroundColor: C.primary + '20', marginBottom: 0 }]}>
                            {user.avatar || user.avatar_url ? (
                                <Image source={{ uri: user.avatar || user.avatar_url }} style={s.avatarImg} />
                            ) : (
                                <Text style={[s.avatarInitial, { color: C.primary }]}>{user.name?.charAt(0)}</Text>
                            )}
                        </View>
                    </View>

                    <Text style={[s.profileName, { color: C.text }]}>{user.name}</Text>
                    <Text style={[s.profileEmail, { color: C.textSecondary }]}>{user.email}</Text>
                </View>

                {/* ── Section 1: Plan & Credits ── */}
                <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Account</Text>
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon={Bill} iconBg="#007AFF"
                        label="Subscription"

                        value={user.plan_name === 'elite' || user.is_unlimited ? 'Skeeme Max' : (user.plan_name === 'standard' ? 'Skeeme Pro' : 'Skeeme Free')}

                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={RoundArrowUp} iconBg="#FF9500"
                        label="Upgrade"

                        onPress={() => {
                            try {
                                router.push('/paywall');
                            } catch (e) {}
                        }}

                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={CupStar} iconBg="#34C759"
                        label="Refer a Friend"
                        onPress={() => router.push('/referral')}
                        isLast={true}
                        isDark={isDark}
                    />
                </GroupedCard>

                {/* ── Section 2: Preferences ── */}
                <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Preferences</Text>
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon={Settings} iconBg="#5E5CE6"
                        label="Personalization"

                        onPress={() => router.push('/preferences')}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={Bell} iconBg="#FF2D55"
                        label="Notifications"
                        hasSwitch={true}
                        switchValue={notificationsEnabled}
                        onSwitch={setNotificationsEnabled}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={Settings} iconBg="#FF9500"
                        label="Haptic Feedback"

                        hasSwitch={true}
                        switchValue={hapticsEnabled}
                        onSwitch={(val) => useAuthStore.getState().setHapticsEnabled(val)}
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
                        icon={QuestionCircle} iconBg="#8E8E93"
                        label="Report Issue"
                        onPress={() => router.push('/support')}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={CheckCircle} iconBg="#8E8E93"
                        label="Privacy Policy"
                        onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={DocumentText} iconBg="#8E8E93"
                        label="Terms of Service"
                        onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')}
                        isLast={true}
                        isDark={isDark}
                    />
                </GroupedCard>

                {/* ── Section 4: Log Out ── */}
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon={Logout} iconBg="#8E8E93"
                        label="Log Out"
                        onPress={handleSignOut}
                        isLast={true}
                        isDark={isDark}
                    />
                </GroupedCard>

                {/* ── Section 5: Danger Zone ── */}
                <Text style={[s.sectionLabel, { color: C.destructive }]}>Danger Zone</Text>
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon={TrashBinTrash} iconBg="#FF3B30"
                        label="Delete Account"
                        onPress={() => setDeleteModalVisible(true)}
                        isLast={true}
                        isDark={isDark}
                        destructive={true}
                    />
                </GroupedCard>
            </ScrollView>

            {/* Account Deletion Modal */}
            <Modal
                visible={deleteModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 24 }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 }}>Verify Deletion</Text>
                        <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 16 }}>
                            This action cannot be undone. To confirm you want to permanently delete your account, type <Text style={{ fontWeight: '800', color: C.text }}>{deleteConfirmationCode}</Text> below.
                        </Text>
                        
                        <View style={{ backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderRadius: 8, paddingHorizontal: 12, marginBottom: 24, paddingVertical: Platform.OS === 'ios' ? 12 : 4 }}>
                            <TextInput
                                placeholder={deleteConfirmationCode}
                                placeholderTextColor={C.textTertiary}
                                value={deleteInput}
                                onChangeText={setDeleteInput}
                                autoCapitalize="characters"
                                style={{ color: C.text, fontSize: 16, fontWeight: '600' }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity 
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA', alignItems: 'center' }}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={{ color: C.text, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: C.destructive, alignItems: 'center', opacity: (isDeleting || deleteInput !== deleteConfirmationCode) ? 0.5 : 1 }}
                                onPress={handleDeleteAccount}
                                disabled={isDeleting || deleteInput !== deleteConfirmationCode}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{isDeleting ? 'Deleting...' : 'Delete'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}