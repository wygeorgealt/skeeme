import { useState } from 'react';
import {
    View, ScrollView, TouchableOpacity, Alert, TextInput,
    Platform, useColorScheme, Image, StyleSheet, Switch
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
    EditPencil, 
    Sparkles, 
    Rhombus, 
    ArrowUpCircle, 
    MagicWand, 
    Bell, 
    HelpCircle, 
    ShieldCheck, 
    DocumentText,
    NavArrowRight
} from 'iconoir-react-native';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { Modal } from 'react-native';

const PREDEFINED_AVATARS = [
    'https://api.dicebear.com/7.x/notionists/png?seed=Felix&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Aneka&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Mimi&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Oreo&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Nala&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Milo&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Lily&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Leo&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Bella&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Loki&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Chloe&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Simba&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Max&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Jack&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Zoe&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Charlie&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Oscar&backgroundColor=f8fafc',
    'https://api.dicebear.com/7.x/notionists/png?seed=Lucy&backgroundColor=f8fafc',
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    scroll: { paddingHorizontal: 16 },
    
    profileSection: { alignItems: 'center', marginBottom: 32 },
    avatarCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%' },
    avatarInitial: { fontSize: 36, fontWeight: '700' },
    editBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#007AFF', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
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
    icon?: React.ElementType; iconBg?: string; label: string; value?: string;
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
                    <Icon width={18} height={18} color="#fff" strokeWidth={2.5} />
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
                !!onPress && !destructive && <NavArrowRight width={18} height={18} color={C.textTertiary} strokeWidth={2} />
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

    const { user, login, logout, theme, setTheme } = useAuthStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [updatingAvatar, setUpdatingAvatar] = useState(false);

    const handleAvatarSelect = async (url: string) => {
        if (!user) return;
        setUpdatingAvatar(true);
        try {
            await api.patch('profile', { avatar_url: url });
            login({ ...user, avatar: url, avatar_url: url }, useAuthStore.getState().token!);
            setAvatarModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update avatar.');
        } finally {
            setUpdatingAvatar(false);
        }
    };

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete('profile', { data: { password: deletePassword } });
            setDeleteModalVisible(false);
            Alert.alert("Account Deleted", "Your account has been deleted permanently.");
            logout();
            router.replace('/login');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to delete account. Please check your password.';
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
            <ScrollView
                contentContainerStyle={[s.scroll, { paddingTop: insets.top + 40, paddingBottom: 150 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Avatar + Name ── */}
                <View style={s.profileSection}>
                    <TouchableOpacity onPress={() => setAvatarModalVisible(true)} activeOpacity={0.8} style={{ marginBottom: 12 }}>
                        <View style={[s.avatarCircle, { backgroundColor: C.primary + '20', marginBottom: 0 }]}>
                            {user.avatar || user.avatar_url ? (
                                <Image source={{ uri: user.avatar || user.avatar_url }} style={s.avatarImg} />
                            ) : (
                                <Text style={[s.avatarInitial, { color: C.primary }]}>{user.name?.charAt(0)}</Text>
                            )}
                        </View>
                        <View style={[s.editBadge, { borderColor: C.background }]}>
                            <EditPencil width={14} height={14} color="#FFF" strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                    <Text style={[s.profileName, { color: C.text }]}>{user.name}</Text>
                    <Text style={[s.profileEmail, { color: C.textSecondary }]}>{user.email}</Text>
                </View>

                {/* ── Section 1: Plan & Credits ── */}
                <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Account</Text>
                <GroupedCard isDark={isDark}>
                    <SettingsRow
                        icon={Sparkles} iconBg="#007AFF"
                        label="Current Plan"
                        value={user.is_unlimited ? 'Unlimited Pro' : 'Free Academic'}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={Rhombus} iconBg="#34C759"
                        label="Credits Remaining"
                        value={user.is_unlimited ? '∞' : `${user.credits}`}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={ArrowUpCircle} iconBg="#FF9500"
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
                        icon={MagicWand} iconBg="#5E5CE6"
                        label="AI Preferences"
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
                        icon={HelpCircle} iconBg="#8E8E93"
                        label="Help & FAQ"
                        onPress={() => router.push('/support')}
                        isDark={isDark}
                    />
                    <SettingsRow
                        icon={ShieldCheck} iconBg="#8E8E93"
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
                        label="Delete Account"
                        onPress={() => {
                            Alert.alert("Permanent Action", "Are you sure you want to permanently delete your account?", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete Account", style: "destructive", onPress: () => setDeleteModalVisible(true) }
                            ]);
                        }}
                        isLast={true}
                        isDark={isDark}
                        destructive={true}
                    />
                </GroupedCard>
            </ScrollView>

            {/* Avatar Picker Modal */}
            <Modal
                visible={avatarModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setAvatarModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: isDark ? 'transparent' : '#F2F2F7' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: C.background }}>
                        <Text style={{ fontSize: 17, fontWeight: '600', color: C.text }}>Choose Avatar</Text>
                        <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                            <Text style={{ fontSize: 17, color: C.primary, fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                            {PREDEFINED_AVATARS.map((url, i) => (
                                <TouchableOpacity 
                                    key={i} 
                                    onPress={() => handleAvatarSelect(url)}
                                    disabled={updatingAvatar}
                                    style={{ 
                                        width: 80, height: 80, borderRadius: 40,
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E5EA',
                                        overflow: 'hidden',
                                        borderWidth: (user.avatar === url || user.avatar_url === url) ? 3 : 0,
                                        borderColor: C.primary
                                    }}
                                >
                                    <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </Modal>

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
                        <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24 }}>
                            If you used an email/password to sign up, please enter your password to confirm. If you used Google or Apple, leave this blank and tap Delete.
                        </Text>
                        
                        <View style={{ backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderRadius: 8, paddingHorizontal: 12, marginBottom: 24, paddingVertical: Platform.OS === 'ios' ? 12 : 4 }}>
                            <TextInput
                                placeholder="Account Password (optional for Google/Apple users)"
                                placeholderTextColor={C.textTertiary}
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                                secureTextEntry
                                style={{ color: C.text, fontSize: 16 }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity 
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA', alignItems: 'center' }}
                                onPress={() => { setDeleteModalVisible(false); setDeletePassword(''); }}
                            >
                                <Text style={{ color: C.text, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: C.destructive, alignItems: 'center', opacity: isDeleting ? 0.7 : 1 }}
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
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
