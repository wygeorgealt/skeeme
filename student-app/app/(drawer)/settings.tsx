import { View, ScrollView, TouchableOpacity, useColorScheme, StyleSheet, Platform, Modal, TextInput, Alert, Switch } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors, Radius } from '@/constants/theme';
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react-native/Bold';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Image } from 'expo-image';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

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
                !!onPress && !destructive && <AltArrowRight size={18} color={C.textTertiary} />
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
    headerWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },

    // Settings rows
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 16 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '400' },
    rowValue: { fontSize: 16, marginRight: 8 },
    sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 16, textTransform: 'uppercase' },
});

export default function SettingsScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const insets = useSafeAreaInsets();
    
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

    const isPremium = user.plan_name === 'pro' || user.plan_name === 'standard' || user.plan_name === 'max' || user.plan_name === 'elite';

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Animated.View entering={FadeInUp.duration(500)}>
                <View style={{ paddingTop: Math.max(insets.top, 16) }} />
            </Animated.View>

            <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 10, paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
                {/* ── Header ── */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} style={s.headerWrap}>
                    <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: C.secondaryBackground }]}>
                        <AltArrowLeft size={24} color={C.text} />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: C.text }]}>Settings</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Account</Text>
                    <GroupedCard isDark={isDark}>
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-wallet-front-color.png')} iconBg="#007AFF20" label="Subscription" value={isPremium ? 'Skeeme Pro' : 'Skeeme Free'} isDark={isDark} />
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-plus-dynamic-color.png')} iconBg="#FF950020" label="Upgrade" onPress={() => router.push('/paywall')} isDark={isDark} />
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-wallet-front-color.png')} iconBg="#007AFF20" label="Buy Credits" onPress={() => router.push('/buy-credits' as any)} isDark={isDark} />
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-gift-dynamic-color.png')} iconBg="#34C75920" label="Refer a Friend" onPress={() => router.push('/(drawer)/referral' as any)} isLast={true} isDark={isDark} />
                    </GroupedCard>

                    <Text style={[s.sectionLabel, { color: C.textSecondary }]}>App Preferences</Text>
                    <GroupedCard isDark={isDark}>
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-bell-front-color.png')} iconBg="#FF2D5520" label="Notifications" hasSwitch={true} switchValue={notificationsEnabled} onSwitch={setNotificationsEnabled} isDark={isDark} />
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-flash-front-color.png')} iconBg="#FF950020" label="Haptic Feedback" hasSwitch={true} switchValue={hapticsEnabled} onSwitch={(val) => useAuthStore.getState().setHapticsEnabled(val)} isDark={isDark} />
                        <View style={{ paddingVertical: 12, paddingRight: 16 }}>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {(['light', 'dark', 'system'] as const).map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => setTheme(t)}
                                        style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: theme === t ? C.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9') }}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme === t ? '#FFF' : C.text, textTransform: 'capitalize' }}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </GroupedCard>

                    <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Support</Text>
                    <GroupedCard isDark={isDark}>
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-flag-front-color.png')} iconBg="#8E8E9320" label="Report Issue" onPress={() => router.push('/(drawer)/support' as any)} isDark={isDark} />
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-lock-front-color.png')} iconBg="#8E8E9320" label="Privacy Policy" onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')} isDark={isDark} />
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-bookmark-iso-color.png')} iconBg="#8E8E9320" label="Terms of Service" onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')} isLast={true} isDark={isDark} />
                    </GroupedCard>

                    <GroupedCard isDark={isDark}>
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-forward-front-color.png')} iconBg="#8E8E9320" label="Log Out" onPress={handleSignOut} isLast={true} isDark={isDark} />
                    </GroupedCard>

                    <Text style={[s.sectionLabel, { color: C.destructive }]}>Danger Zone</Text>
                    <GroupedCard isDark={isDark}>
                        <SettingsRow iconSource={require('@/assets/3dicons/3dicons-trash-can-front-color.png')} iconBg="#FF3B3020" label="Delete Account" onPress={() => setDeleteModalVisible(true)} isLast={true} isDark={isDark} destructive={true} />
                    </GroupedCard>
                </Animated.View>
            </ScrollView>

            {/* Account Deletion Modal */}
            <Modal visible={deleteModalVisible} animationType="fade" transparent={true} onRequestClose={() => setDeleteModalVisible(false)}>
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
