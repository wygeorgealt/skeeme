import { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Platform,
    useColorScheme,
    Image,
    StyleSheet,
    Switch,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    AltArrowRight,
    Pen,
    Bill,
    RoundArrowUp,
    Settings,
    Bell,
    QuestionCircle,
    CheckCircle,
    DocumentText,
    Logout,
    TrashBinTrash,
} from '@solar-icons/react-native/Bold';
import { Colors, Radius } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { Modal } from 'react-native';

const s = StyleSheet.create({
    scroll: { paddingHorizontal: 16 },
    profileSection: { alignItems: 'center', marginBottom: 32 },
    avatarCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarInitial: { fontSize: 36, fontWeight: '700' },
    editBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#007AFF',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    profileName: { fontSize: 24, fontWeight: '700', marginBottom: 4, letterSpacing: -0.5 },
    profileEmail: { fontSize: 15 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 16 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
    rowValue: { fontSize: 16, marginRight: 8 },
    sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
});

function SettingsRow({
    icon: Icon,
    iconBg,
    label,
    value,
    onPress,
    isLast = false,
    isDark,
    destructive = false,
    hasSwitch = false,
    switchValue = false,
    onSwitch = () => {},
}: {
    icon?: any;
    iconBg?: string;
    label: string;
    value?: string;
    onPress?: () => void;
    isLast?: boolean;
    isDark: boolean;
    destructive?: boolean;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitch?: (val: boolean) => void;
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

            <Text
                style={{
                    ...s.rowLabel,
                    color: destructive ? C.destructive : C.text,
                    marginLeft: Icon ? 0 : 16,
                    textAlign: destructive ? 'center' : 'left',
                }}
                numberOfLines={1}
            >
                {label}
            </Text>

            {value ? <Text style={{ ...s.rowValue, color: C.textSecondary }}>{value}</Text> : null}

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

function GroupedCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    const C = Colors[isDark ? 'dark' : 'light'];

    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: Radius.lg,
                overflow: 'hidden',
                marginBottom: 24,
                borderWidth: 1,
                borderColor: isDark ? C.glassBorder : 'transparent',
            }}
        >
            <View style={{ paddingLeft: 16 }}>{children}</View>
        </View>
    );
}

interface AccountModalProps {
    visible: boolean;
    onDismiss: () => void;
}

export default function AccountModal({ visible, onDismiss }: AccountModalProps) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();

    const { user, logout, theme, setTheme, hapticsEnabled, setHapticsEnabled } = useAuthStore();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteConfirmationCode, setDeleteConfirmationCode] = useState('');
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const bottomInset = insets.bottom ?? 0;

    useEffect(() => {
        if (!deleteModalVisible) return;
        setDeleteConfirmationCode(`DELETE-${Math.floor(1000 + Math.random() * 9000)}`);
        setDeleteInput('');
    }, [deleteModalVisible]);

    const handleDeleteAccount = async () => {
        if (deleteInput !== deleteConfirmationCode) return;
        setIsDeleting(true);
        try {
            await api.delete('profile');
            setDeleteModalVisible(false);
            Alert.alert('Account Deleted', 'Your account has been deleted permanently.');
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
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.post('logout');
                    } catch {}
                    logout();
                    router.replace('/login');
                },
            },
        ]);
    };

    if (!user) return null;

    const firstChar = user.name?.trim()?.charAt(0) ?? '';

    return (
        <>
            <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 24,
                    }}
                >
                    <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 24, width: '100%' }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 12 }}>Delete Account</Text>
                        <Text style={{ fontSize: 15, color: C.textSecondary, marginBottom: 20, lineHeight: 22 }}>
                            This action cannot be undone. To confirm, type{' '}
                            <Text style={{ fontWeight: '700' }}>{deleteConfirmationCode}</Text> below.
                        </Text>
                        <TextInput
                            placeholder={deleteConfirmationCode}
                            placeholderTextColor={C.textTertiary}
                            value={deleteInput}
                            onChangeText={setDeleteInput}
                            style={{
                                borderWidth: 1,
                                borderColor: C.separator,
                                borderRadius: 12,
                                padding: 12,
                                color: C.text,
                                marginBottom: 20,
                                fontFamily: 'Outfit-Regular',
                            }}
                        />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: C.text, fontSize: 16, fontWeight: '700' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDeleteAccount}
                                disabled={deleteInput !== deleteConfirmationCode || isDeleting}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    backgroundColor: '#EF4444',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{isDeleting ? 'Deleting...' : 'Delete'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {visible && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        top: 0,
                        justifyContent: 'flex-end',
                        zIndex: 999,
                    }}
                >
                    <TouchableOpacity activeOpacity={1} onPress={onDismiss} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />

                    <View
                        style={{
                            backgroundColor: C.background,
                            borderTopLeftRadius: 28,
                            borderTopRightRadius: 28,
                            paddingHorizontal: 0,
                            paddingTop: 16,
                            paddingBottom: Math.max(bottomInset, 16),
                            maxHeight: '85%',
                        }}
                    >
                        <View
                            style={{
                                width: 40,
                                height: 4,
                                backgroundColor: isDark ? '#475569' : '#CBD5E1',
                                borderRadius: 2,
                                alignSelf: 'center',
                                marginBottom: 16,
                            }}
                        />

                        <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 8, paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 16, marginBottom: 16 }}>
                                <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Text style={{ fontSize: 28, fontWeight: '600', color: C.text }}>×</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={s.profileSection}>
                                <View style={[s.avatarCircle, { backgroundColor: C.primaryLight ?? '#F3E8FF' }]}>
                                    {user.avatar || user.avatar_url ? (
                                        <Image source={{ uri: user.avatar || user.avatar_url }} style={s.avatarImg} />
                                    ) : (
                                        <Text style={[s.avatarInitial, { color: C.primary }]}>{firstChar || ' '}</Text>
                                    )}
                                </View>
                                <View style={[s.editBadge, { borderColor: C.background }]}>
                                    <Pen size={14} color="#FFF" />
                                </View>

                                <Text style={[s.profileName, { color: C.text }]}>{user.name}</Text>
                                <Text style={[s.profileEmail, { color: C.textSecondary }]}>{user.email}</Text>
                            </View>

                            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Account</Text>
                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={Bill}
                                    iconBg="#007AFF"
                                    label="Subscription"
                                    value={user.plan_name === 'elite' || user.is_unlimited ? 'Skeeme Max' : user.plan_name === 'standard' ? 'Skeeme Pro' : 'Skeeme Free'}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={RoundArrowUp}
                                    iconBg="#FF9500"
                                    label="Upgrade"
                                    onPress={() => {
                                        try {
                                            onDismiss();
                                            router.push('/paywall');
                                        } catch {}
                                    }}
                                    isLast
                                    isDark={isDark}
                                />
                            </GroupedCard>

                            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Preferences</Text>
                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={Settings}
                                    iconBg="#5E5CE6"
                                    label="Personalization"
                                    onPress={() => {
                                        onDismiss();
                                        router.push('/preferences');
                                    }}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={Bell}
                                    iconBg="#FF2D55"
                                    label="Notifications"
                                    hasSwitch
                                    switchValue={notificationsEnabled}
                                    onSwitch={setNotificationsEnabled}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={Settings}
                                    iconBg="#FF9500"
                                    label="Haptic Feedback"
                                    hasSwitch
                                    switchValue={hapticsEnabled}
                                    onSwitch={(v) => {
                                        // keep zustand async setter, but ignore returned promise
                                        void setHapticsEnabled(v);
                                    }}
                                    isDark={isDark}

                                />

                                <View style={{ paddingVertical: 12, paddingRight: 16 }}>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {(['light', 'dark', 'system'] as const).map((t) => (
                                            <TouchableOpacity
                                                key={t}
                                                onPress={() => setTheme(t)}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 8,
                                                    borderRadius: 8,
                                                    alignItems: 'center',
                                                    backgroundColor:
                                                        theme === t
                                                            ? C.primary
                                                            : isDark
                                                            ? 'rgba(255,255,255,0.05)'
                                                            : '#F1F5F9',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: '700',
                                                        color: theme === t ? '#FFF' : C.text,
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {t}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </GroupedCard>

                            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Support</Text>
                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={QuestionCircle}
                                    iconBg="#8E8E93"
                                    label="Report Issue"
                                    onPress={() => {
                                        onDismiss();
                                        router.push('/support');
                                    }}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={CheckCircle}
                                    iconBg="#8E8E93"
                                    label="Privacy Policy"
                                    onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={DocumentText}
                                    iconBg="#8E8E93"
                                    label="Terms of Service"
                                    onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')}
                                    isDark={isDark}
                                />
                                <SettingsRow
                                    icon={Logout}
                                    iconBg="#34C759"
                                    label="Sign Out"
                                    onPress={handleSignOut}
                                    isLast
                                    isDark={isDark}
                                />
                            </GroupedCard>

                            <GroupedCard isDark={isDark}>
                                <SettingsRow
                                    icon={TrashBinTrash}
                                    iconBg="#EF4444"
                                    label="Delete Account"
                                    onPress={() => setDeleteModalVisible(true)}
                                    destructive
                                    isLast
                                    isDark={isDark}
                                />
                            </GroupedCard>
                        </ScrollView>
                    </View>
                </View>
            )}
        </>
    );
}

