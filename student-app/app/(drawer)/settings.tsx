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

// ─── Row Component ───────────────────────────────────────────────────────────
function SettingsRow({
    icon, iconBg, iconColor, label, sublabel, value, onPress, isLast = false,
    destructive = false, hasSwitch = false, switchValue = false, onSwitch,
    isDark,
}: {
    icon: keyof typeof LucideIcons;
    iconBg: string; iconColor: string;
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
            <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
                <Icon name={icon} size={18} color={destructive ? 'destructive' : iconColor} />
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
                !!onPress && !destructive && <Icon name="ChevronRight" size={20} color="textSecondary" />
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
                {/* ── Profile Card ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(80)}>
                    <View style={[styles.profileCard, { backgroundColor: isDark ? C.card : '#FFFFFF', shadowColor: '#000' }]}>
                        {/* Background accent blob */}
                        <View style={styles.profileBlob} />
                        <View style={styles.profileRow}>
                            <View style={[styles.avatarWrap, { backgroundColor: '#007AFF20' }]}>
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
                        {/* Balance subcard */}
                        <View style={[styles.balanceCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6F3F5' }]}>
                            <View>
                                <Text style={[styles.balanceLabel, { color: C.textSecondary }]}>BALANCE</Text>
                                <Text style={[styles.balanceValue, { color: C.text }]}>{user.credits ?? 0} Credits</Text>
                            </View>
                            <Pressable
                                onPress={() => useAuthStore.getState().toggleCreditsModal(true, 'scan')}
                                style={styles.topUpBtn}
                            >
                                <Icon name="Plus" size={16} color="white" />
                                <Text style={styles.topUpText}>Top Up</Text>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Study & Exam Preferences ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                    <Section title="Study & Exam Preferences" isDark={isDark}>
                        <SettingsRow isDark={isDark} icon="GraduationCap" iconBg="#E5F1FF" iconColor="#007AFF"
                            label="Target Exams" sublabel="SAT, AP Calculus, AP Physics"
                            onPress={() => router.push('/(drawer)/exams' as any)} />
                        <SettingsRow isDark={isDark} icon="Target" iconBg="rgba(0,103,98,0.12)" iconColor="#006762"
                            label="Daily Study Goal" sublabel="20 Questions / day"
                            onPress={() => router.push('/(drawer)/daily_study_goal' as any)} />
                        <SettingsRow isDark={isDark} icon="Bell" iconBg="rgba(186,26,26,0.1)" iconColor="#BA1A1A"
                            label="Study Reminders" sublabel="Smart evening alert (7:30 PM)"
                            hasSwitch switchValue={notificationsEnabled} onSwitch={setNotificationsEnabled} isLast />
                    </Section>
                </Animated.View>

                {/* ── Personalization & Feel ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <Section title="Personalization & Feel" isDark={isDark}>
                        <SettingsRow isDark={isDark} icon="Sparkles" iconBg="rgba(76,74,202,0.12)" iconColor="#4C4ACA"
                            label="Personalize Skeemy" sublabel="AI tone, style & goals"
                            onPress={() => router.push('/(drawer)/preferences' as any)} />
                        {/* Theme Picker */}
                        <View style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : '#E3E2E7' }]}>
                            <View style={[styles.rowIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EEEDF3' }]}>
                                <Icon name="Palette" size={18} color={isDark ? '#EBEBF5' : '#48484A'} />
                            </View>
                            <View style={styles.rowText}>
                                <Text style={[styles.rowLabel, { color: C.text }]}>Appearance</Text>
                            </View>
                            <View style={[styles.themePicker, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E3E2E7' }]}>
                                {(['light', 'dark', 'system'] as const).map((t) => (
                                    <View key={t} style={[styles.themeOption, theme === t && { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}>
                                        <Pressable onPress={() => setTheme(t)} style={styles.themeOptionInner}>
                                            <Text style={{ fontSize: 12, fontWeight: '700', textTransform: 'capitalize', color: theme === t ? '#007AFF' : C.textSecondary }}>{t}</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <SettingsRow isDark={isDark} icon="Smartphone" iconBg={isDark ? 'rgba(255,255,255,0.08)' : '#EEEDF3'} iconColor={isDark ? '#EBEBF5' : '#48484A'}
                            label="Haptic Feedback" sublabel="Subtle buzz on correct solutions"
                            hasSwitch switchValue={hapticsEnabled} onSwitch={(val) => useAuthStore.getState().setHapticsEnabled(val)} isLast />
                    </Section>
                </Animated.View>

                {/* ── Subscription & Billing ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(250)}>
                    <Section title="Subscription & Billing" isDark={isDark}>
                        <View style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : '#E3E2E7' }]}>
                            <View style={[styles.rowIcon, { backgroundColor: '#007AFF' }]}>
                                <Icon name="Award" size={18} color="white" />
                            </View>
                            <View style={styles.rowText}>
                                <Text style={[styles.rowLabel, { color: C.text }]}>{isPremium ? 'Skeeme Pro (Annual)' : 'Skeeme Free'}</Text>
                                <Text style={[styles.rowSublabel, { color: C.textSecondary }]}>{isPremium ? 'Auto-renews Nov 14, 2025' : 'Upgrade to unlock all features'}</Text>
                            </View>
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>{isPremium ? 'Active' : 'Free'}</Text>
                            </View>
                        </View>
                        <SettingsRow isDark={isDark} icon="CreditCard" iconBg="#E2DFFF" iconColor="#4C4ACA"
                            label="Manage Payment & Invoices"
                            onPress={() => router.push('/paywall')} />
                        <SettingsRow isDark={isDark} icon="Gift" iconBg="rgba(52,199,89,0.12)" iconColor="#34C759"
                            label="Refer a Friend"
                            onPress={() => router.push('/(drawer)/referral' as any)} />
                        <SettingsRow isDark={isDark} icon="RotateCcw" iconBg={isDark ? 'rgba(255,255,255,0.08)' : '#EEEDF3'} iconColor={isDark ? '#EBEBF5' : '#48484A'}
                            label="Restore Apple In-App Purchases"
                            onPress={() => Alert.alert('Restore', 'No purchases to restore.')} isLast />
                    </Section>
                </Animated.View>

                {/* ── Support & Community ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                    <Section title="Support & Community" isDark={isDark}>
                        <SettingsRow isDark={isDark} icon="HelpCircle" iconBg="#E5F1FF" iconColor="#007AFF"
                            label="Help Center & Exam Tips"
                            onPress={() => router.push('/(drawer)/support' as any)} />
                        <SettingsRow isDark={isDark} icon="MessageSquare" iconBg="rgba(0,103,98,0.12)" iconColor="#006762"
                            label="Send Feedback to Skeeme Team"
                            onPress={() => router.push('/(drawer)/support' as any)} />
                        <SettingsRow isDark={isDark} icon="Lock" iconBg={isDark ? 'rgba(255,255,255,0.08)' : '#EEEDF3'} iconColor={isDark ? '#EBEBF5' : '#48484A'}
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
    scroll: { paddingHorizontal: 16, paddingTop: 8 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },

    // Profile
    profileCard: { borderRadius: 20, padding: 16, marginBottom: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, overflow: 'hidden' },
    profileBlob: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,122,255,0.05)' },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    avatarWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarInitial: { fontSize: 22, fontWeight: '800', color: '#007AFF' },
    profileName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
    profileEmail: { fontSize: 13, marginTop: 2 },
    proBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,122,255,0.1)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
    proBadgeText: { fontSize: 11, fontWeight: '700', color: '#007AFF', letterSpacing: 0.5 },
    balanceCard: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    balanceLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    balanceValue: { fontSize: 18, fontWeight: '800', marginTop: 1 },
    topUpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#007AFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
    topUpText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    // Section
    section: { marginBottom: 20 },
    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
    sectionCard: { borderRadius: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

    // Row
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 14, paddingLeft: 12 },
    rowIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
    rowText: { flex: 1, minWidth: 0 },
    rowLabel: { fontSize: 16, fontWeight: '400' },
    rowSublabel: { fontSize: 12, marginTop: 1 },
    rowValue: { fontSize: 15, marginRight: 6 },

    // Theme picker
    themePicker: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
    themeOption: { flex: 1, borderRadius: 7 },
    themeOptionInner: { paddingVertical: 5, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },

    // Active badge
    activeBadge: { backgroundColor: 'rgba(0,122,255,0.1)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
    activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#007AFF' },

    // Sign Out
    signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    signOutText: { fontSize: 16, fontWeight: '600', color: '#BA1A1A' },

    // Delete Modal
    modalCard: { borderRadius: 22, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    modalBody: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
    modalInput: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 },
    modalBtn: { paddingVertical: 13, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
