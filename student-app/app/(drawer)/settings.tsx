import { View, ScrollView, Pressable, Platform, Modal, TextInput, Alert, Switch, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import * as LucideIcons from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { haptics } from '@/lib/haptics';

// ─── Row Component ───────────────────────────────────────────────────────────
function SettingsRow({
    icon, label, sublabel, value, onPress, isLast = false,
    destructive = false, hasSwitch = false, switchValue = false, onSwitch,
    isDark,
}: {
    icon: keyof typeof LucideIcons;
    label: string; sublabel?: string; value?: string;
    onPress?: () => void; isLast?: boolean; destructive?: boolean;
    hasSwitch?: boolean; switchValue?: boolean; onSwitch?: (val: boolean) => void;
    isDark: boolean;
}) {
    const C = Colors[isDark ? 'dark' : 'light'];
    return (
        <Pressable
            onPress={hasSwitch ? undefined : onPress}
            style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : '#E3E2E7' }]}
        >
            <View style={styles.rowIcon}>
                <Icon 
                    name={icon} 
                    size={20} 
                    color={destructive ? 'destructive' : 'primary'} 
                    animated={!destructive && !hasSwitch ? 'pulse' : false} 
                />
            </View>
            <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: destructive ? '#BA1A1A' : C.text }]}>{label}</Text>
                {sublabel ? <Text style={[styles.rowSublabel, { color: C.textSecondary }]}>{sublabel}</Text> : null}
            </View>
            {value ? <Text style={[styles.rowValue, { color: C.textSecondary }]}>{value}</Text> : null}
            {hasSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitch}
                    trackColor={{ false: isDark ? '#38383A' : '#E3E2E7', true: '#007AFF' }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                />
            ) : (
                !!onPress && !destructive && <Icon name="ChevronRight" size={18} color="primary" />
            )}
        </Pressable>
    );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
    const C = Colors[isDark ? 'dark' : 'light'];
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>{title.toUpperCase()}</Text>
            <View style={[styles.sectionCard, { backgroundColor: isDark ? C.card : '#FFFFFF', shadowColor: '#000' }]}>
                {children}
            </View>
        </View>
    );
}

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const { user, logout, theme, setTheme, hapticsEnabled } = useAuthStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteConfirmationCode, setDeleteConfirmationCode] = useState('');
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (deleteModalVisible) {
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
            Alert.alert('Account Deleted', 'Your account has been deleted permanently.');
            logout();
            router.replace('/login');
        } catch {
            Alert.alert('Account not deleted', 'Please try again when you are back online.');
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

    if (!user) return (
        <View style={{ flex: 1, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.textSecondary }}>Loading settings…</Text>
        </View>
    );

    const isPremium = ['pro', 'standard', 'max', 'elite'].includes(user.plan_name ?? '');

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScreenHeader title="Settings" />

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Profile Hero Card ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(80)}>
                    <View style={[styles.profileCard, { backgroundColor: isDark ? C.card : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderWidth: 1, shadowColor: '#000' }]}>
                        {/* Background accent blob */}
                        <View style={styles.profileBlob} />
                        <View style={styles.profileRow}>
                            <View style={[styles.avatarWrap, { backgroundColor: isDark ? 'rgba(0,122,255,0.18)' : '#E5F1FF' }]}>
                                <Text style={styles.avatarInitial}>{(user.name || 'U').charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <Text style={[styles.profileName, { color: C.text }]} numberOfLines={1}>{user.name || 'Student'}</Text>
                                    {isPremium && (
                                        <View style={styles.proBadge}>
                                            <Icon name="CheckCircle2" size={11} color="primary" />
                                            <Text style={styles.proBadgeText}>PRO</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.profileEmail, { color: C.textSecondary }]} numberOfLines={1}>{user.email}</Text>
                            </View>
                        </View>

                        {/* Plan subcard */}
                        <View style={[styles.planCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F6F8FC', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderWidth: 1 }]}>
                            <View style={styles.planLeft}>
                                <View style={[styles.planIconWrap, { backgroundColor: isPremium ? (isDark ? 'rgba(0,122,255,0.2)' : '#DBEAFE') : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB') }]}>
                                    <Icon name={isPremium ? "Award" : "Zap"} size={18} color={isPremium ? "primary" : "muted"} />
                                </View>
                                <View>
                                    <Text style={[styles.planLabel, { color: C.textSecondary }]}>CURRENT PLAN</Text>
                                    <Text style={[styles.planValue, { color: C.text }]}>{isPremium ? 'Skeeme Pro' : 'Free Plan'}</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => {
                                    haptics.selectionAsync();
                                    router.push('/paywall');
                                }}
                                style={[styles.planActionBtn, { backgroundColor: isPremium ? (isDark ? 'rgba(255,255,255,0.1)' : '#E9ECEF') : '#007AFF' }]}
                            >
                                <Text style={[styles.planActionText, { color: isPremium ? C.text : '#FFFFFF' }]}>
                                    {isPremium ? 'Manage' : 'Upgrade'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Study & Exam Preferences ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                    <Section title="Study & Exam Preferences" isDark={isDark}>
                        <SettingsRow isDark={isDark} icon="GraduationCap"
                            label="Target Exams"
                            onPress={() => router.push('/(drawer)/exams' as any)} />
                        <SettingsRow isDark={isDark} icon="Bell"
                            label="Study Reminders"
                            hasSwitch switchValue={notificationsEnabled} onSwitch={setNotificationsEnabled} isLast />
                    </Section>
                </Animated.View>

                {/* ── App Preferences ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <Section title="App Preferences" isDark={isDark}>
                        {/* Theme Picker */}
                        <View style={[styles.themeRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : '#E3E2E7' }]}>
                            <View style={styles.themeRowHeader}>
                                <View style={styles.rowIcon}>
                                    <Icon name={theme === 'dark' ? 'Moon' : theme === 'light' ? 'Sun' : 'Monitor'} size={20} color="primary" />
                                </View>
                                <Text style={[styles.rowLabel, { color: C.text }]}>Appearance</Text>
                            </View>
                            <View style={[styles.themePicker, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#EFEFF4' }]}>
                                {([
                                    { key: 'light', label: 'Light', icon: 'Sun' as const },
                                    { key: 'dark', label: 'Dark', icon: 'Moon' as const },
                                    { key: 'system', label: 'System', icon: 'Monitor' as const },
                                ] as const).map(({ key, label, icon }) => {
                                    const isSelected = theme === key;
                                    return (
                                        <Pressable
                                            key={key}
                                            onPress={() => {
                                                haptics.selectionAsync();
                                                setTheme(key);
                                            }}
                                            style={[
                                                styles.themeOption,
                                                isSelected && {
                                                    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                                                    shadowColor: '#000',
                                                    shadowOpacity: 0.08,
                                                    shadowRadius: 4,
                                                    shadowOffset: { width: 0, height: 1 },
                                                    elevation: 2,
                                                },
                                            ]}
                                        >
                                            <Icon
                                                name={icon}
                                                size={15}
                                                color={isSelected ? 'primary' : 'muted'}
                                            />
                                            <Text
                                                style={[
                                                    styles.themeOptionText,
                                                    {
                                                        color: isSelected ? (isDark ? '#FFFFFF' : '#1C1C1E') : C.textSecondary,
                                                        fontWeight: isSelected ? '700' : '500',
                                                    },
                                                ]}
                                            >
                                                {label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                        <SettingsRow isDark={isDark} icon="Smartphone"
                            label="Haptic Feedback"
                            hasSwitch switchValue={hapticsEnabled} onSwitch={(val) => useAuthStore.getState().setHapticsEnabled(val)} isLast />
                    </Section>
                </Animated.View>

                {/* ── Subscription & Billing ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(250)}>
                    <Section title="Subscription & Billing" isDark={isDark}>
                        <SettingsRow isDark={isDark} icon="CreditCard"
                            label="Manage Payment & Invoices"
                            onPress={() => router.push('/paywall')} />
                        <SettingsRow isDark={isDark} icon="RotateCcw"
                            label="Restore Purchases"
                            onPress={() => Alert.alert('Restore', 'No purchases to restore.')} isLast />
                    </Section>
                </Animated.View>

                {/* ── Support & Community ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                    <Section title="Support & Community" isDark={isDark}>
                        <SettingsRow isDark={isDark} icon="MessageSquare"
                            label="Send Feedback to Skeeme Team"
                            onPress={() => router.push('/(drawer)/support' as any)} />
                        <SettingsRow isDark={isDark} icon="Lock"
                            label="Privacy Policy & Terms of Service"
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')} isLast />
                    </Section>
                </Animated.View>

                {/* ── Sign Out ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(350)}>
                    <View style={[styles.sectionCard, { backgroundColor: isDark ? C.card : '#FFFFFF', marginHorizontal: 0, marginBottom: 16, shadowColor: '#000' }]}>
                        <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
                            <Icon name="LogOut" size={20} color="destructive" />
                            <Text style={styles.signOutText}>Sign Out of Skeeme</Text>
                        </Pressable>
                    </View>
                    <View style={[styles.sectionCard, { backgroundColor: isDark ? C.card : '#FFFFFF', marginHorizontal: 0, shadowColor: '#000' }]}>
                        <Pressable onPress={() => setDeleteModalVisible(true)} style={styles.signOutBtn}>
                            <Icon name="Trash2" size={20} color="destructive" />
                            <Text style={styles.signOutText}>Delete Account</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Delete Account Modal */}
            <Modal visible={deleteModalVisible} animationType="fade" transparent onRequestClose={() => setDeleteModalVisible(false)}>
                <BlurView intensity={20} tint="dark" style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
                    <View style={[styles.modalCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                        <Text style={[styles.modalTitle, { color: C.text }]}>Verify Deletion</Text>
                        <Text style={[styles.modalBody, { color: C.textSecondary }]}>
                            This action cannot be undone. Type <Text style={{ fontWeight: '800', color: C.text }}>{deleteConfirmationCode}</Text> to confirm.
                        </Text>
                        <View style={[styles.modalInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6F3F5' }]}>
                            <TextInput
                                placeholder={deleteConfirmationCode}
                                placeholderTextColor={isDark ? '#636366' : '#8E8E93'}
                                value={deleteInput}
                                onChangeText={setDeleteInput}
                                autoCapitalize="characters"
                                style={{ color: C.text, fontSize: 15, fontWeight: '600' }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Pressable onPress={() => setDeleteModalVisible(false)} style={[styles.modalBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F5', flex: 1 }]}>
                                <Text style={{ color: C.text, fontWeight: '600' }}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDeleteAccount}
                                style={[styles.modalBtn, { backgroundColor: deleteInput === deleteConfirmationCode ? '#BA1A1A' : '#BA1A1A40', flex: 1 }]}
                                disabled={isDeleting || deleteInput !== deleteConfirmationCode}
                            >
                                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{isDeleting ? 'Deleting…' : 'Delete'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: { paddingHorizontal: 22, paddingTop: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },

    // Profile
    profileCard: { borderRadius: 20, padding: 20, marginBottom: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, overflow: 'hidden' },
    profileBlob: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,122,255,0.05)' },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    avatarWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarInitial: { fontSize: 22, fontWeight: '800', color: '#007AFF' },
    profileName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
    profileEmail: { fontSize: 13, marginTop: 2 },
    proBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,122,255,0.1)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
    proBadgeText: { fontSize: 11, fontWeight: '700', color: '#007AFF', letterSpacing: 0.5 },
    planCard: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    planIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    planLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
    planValue: { fontSize: 16, fontWeight: '800' },
    planActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
    planActionText: { fontSize: 13, fontWeight: '700' },

    // Section
    section: { marginBottom: 20 },
    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
    sectionCard: { borderRadius: 18, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

    // Row
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
    rowIcon: { alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
    rowText: { flex: 1, minWidth: 0 },
    rowLabel: { fontSize: 16, fontWeight: '400' },
    rowSublabel: { fontSize: 12, marginTop: 1 },
    rowValue: { fontSize: 15, marginRight: 6 },

    // Theme picker
    themeRow: { paddingVertical: 14, paddingHorizontal: 16 },
    themeRowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    themePicker: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 3 },
    themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 9 },
    themeOptionText: { fontSize: 13 },

    // Active badge
    activeBadge: { backgroundColor: 'rgba(0,122,255,0.1)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
    activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#007AFF' },

    // Sign Out
    signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
    signOutText: { fontSize: 16, fontWeight: '600', color: '#BA1A1A' },

    // Delete Modal
    modalCard: { borderRadius: 22, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    modalBody: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
    modalInput: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 },
    modalBtn: { paddingVertical: 13, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
