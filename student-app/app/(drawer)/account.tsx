import { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme, Image, StyleSheet
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { 
    Menu, Sparks, Gift, Eye, EyeClosed, 
    SmartphoneDevice, SunLight, HalfMoon, 
    ShieldCheck, Page, NavArrowRight, Check,
    NavArrowLeft
} from 'iconoir-react-native';
import { GradientButton } from '@/components/ui/GradientButton'; // This is now a solid V2 button
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router, useNavigation } from 'expo-router';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BUILT_IN_AVATARS = [
    'https://api.dicebear.com/7.x/notionists/png?seed=Felix&backgroundColor=e2e8f0',
    'https://api.dicebear.com/7.x/notionists/png?seed=Aneka&backgroundColor=fca5a5',
    'https://api.dicebear.com/7.x/notionists/png?seed=Bailey&backgroundColor=fcd34d',
    'https://api.dicebear.com/7.x/notionists/png?seed=Coco&backgroundColor=86efac',
    'https://api.dicebear.com/7.x/notionists/png?seed=Dusty&backgroundColor=93c5fd',
    'https://api.dicebear.com/7.x/notionists/png?seed=Fluffy&backgroundColor=c4b5fd',
    'https://api.dicebear.com/7.x/notionists/png?seed=Garfield&backgroundColor=fbcfe8',
    'https://api.dicebear.com/7.x/notionists/png?seed=Gizmo&backgroundColor=d8b4fe',
    'https://api.dicebear.com/7.x/notionists/png?seed=Loki&backgroundColor=cbd5e1',
    'https://api.dicebear.com/7.x/notionists/png?seed=Missy&backgroundColor=fdba74',
    'https://api.dicebear.com/7.x/notionists/png?seed=Oliver&backgroundColor=a7f3d0',
    'https://api.dicebear.com/7.x/notionists/png?seed=Peanut&backgroundColor=bae6fd',
];

export default function AccountScreen() {
    const colorScheme = useColorScheme();
    const { user, updateUser, theme, setTheme } = useAuthStore();
    // NativeWind's setter is still needed for actual class changes
    const { setColorScheme } = useNativeWindColorScheme();

    const [name, setName] = useState(user?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || user?.avatar_url || '');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name.trim()) return Alert.alert('Required', 'Name cannot be empty.');

        setIsUpdatingProfile(true);
        setProfileSuccess(false);
        try {
            await api.patch('profile', { name: name.trim(), avatar_url: avatarUrl, avatarUrl: avatarUrl });
            updateUser({ name: name.trim(), avatar: avatarUrl, avatar_url: avatarUrl });
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (error: any) {
            let msg = 'Something went wrong.';
            const data = error.response?.data;

            if (data?.errors) {
                const firstKey = Object.keys(data.errors)[0];
                msg = data.errors[firstKey][0];
            } else if (data?.message) {
                msg = data.message;
            }

            Alert.alert('Update Failed', msg);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        if (newTheme !== 'system') {
            setColorScheme(newTheme);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return Alert.alert('Missing Fields', 'Please fill in all password fields.');
        }
        if (newPassword.length < 8) {
            return Alert.alert('Too Short', 'New password must be at least 8 characters.');
        }
        if (newPassword !== confirmPassword) {
            return Alert.alert('Mismatch', 'New password and confirmation do not match.');
        }

        setIsUpdatingPassword(true);
        setPasswordSuccess(false);
        try {
            await api.post('profile/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            let msg = 'Something went wrong.';
            const data = error.response?.data;

            if (data?.errors) {
                // Extract first validation error
                const firstKey = Object.keys(data.errors)[0];
                msg = data.errors[firstKey][0];
            } else if (data?.message) {
                msg = data.message;
            }

            Alert.alert('Update Failed', msg);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!user) return null;

    const PasswordField = ({
        label, value, onChangeText, show, onToggle, placeholder = '••••••••',
    }: {
        label: string; value: string; onChangeText: (v: string) => void;
        show: boolean; onToggle: () => void; placeholder?: string;
    }) => (
        <View style={s.inputContainer}>
            <Text style={s.inputLabel}>{label}</Text>
            <View style={{ position: 'relative' }}>
                <TextInput
                    style={[s.input, isDark ? s.inputDark : s.inputLight]}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                    secureTextEntry={!show}
                    value={value}
                    onChangeText={onChangeText}
                />
                <TouchableOpacity
                    onPress={onToggle}
                    style={s.pwToggle}
                >
                    {show ? (
                        <EyeClosed width={18} height={18} color="#94a3b8" />
                    ) : (
                        <Eye width={18} height={18} color="#94a3b8" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const isDark = colorScheme === 'dark';
    const navigation = useNavigation() as any;
    const insets = useSafeAreaInsets();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <GlowBackground>
                {/* Header with drawer toggle */}
            <View style={[s.header, { paddingTop: Math.max(insets.top, 8) }]}>
                <Text style={[s.headerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Account</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    style={[s.drawerBtn, isDark ? s.drawerBtnDark : s.drawerBtnLight]}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={[s.profileHeader, { marginTop: 20 }]}>
                    <View style={[s.avatarLarge, isDark ? s.avatarLargeDark : s.avatarLargeLight]}>
                        {user.avatar || user.avatar_url ? (
                            <Image 
                                source={{ uri: user.avatar || user.avatar_url }} 
                                style={{ width: '100%', height: '100%', borderRadius: 56 }} 
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={s.avatarInitial}>{user.name.charAt(0)}</Text>
                        )}
                    </View>
                    <Text style={[s.profileName, { color: isDark ? '#fff' : '#0f172a' }]}>{user.name}</Text>
                    <Text style={s.profileEmail}>{user.email}</Text>
                </View>

                {/* Subscription Overview */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={s.sectionLabel}>Plan Details</Text>
                    <View style={[s.card, isDark ? s.cardDark : s.cardLight]}>
                        <View style={s.cardHeader}>
                            <View style={[s.planIcon, user.is_unlimited ? s.planIconActive : (isDark ? s.planIconDark : s.planIconLight)]}>
                                <Sparks width={18} height={18} color={user.is_unlimited ? "#8B5CF6" : "#94a3b8"} />
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/upgrade')}
                                style={[s.manageBtn, isDark ? s.manageBtnDark : s.manageBtnLight]}
                            >
                                <Text style={[s.manageBtnText, { color: isDark ? '#0f172a' : '#fff' }]}>Manage</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={[s.planTitle, { color: isDark ? '#fff' : '#0f172a' }]}>
                            {user.is_unlimited ? 'Unlimited Pro' : 'Free Academic'}
                        </Text>
                        {user.is_unlimited ? (
                            <Text style={s.planSubtitleActive}>Full AI Access Enabled</Text>
                        ) : (
                            <Text style={s.planSubtitleFree}>{user.credits} Learning Credits Left</Text>
                        )}
                    </View>
                </View>

                {/* Referrals */}
                <View style={{ marginBottom: 32 }}>
                    <TouchableOpacity
                        onPress={() => router.push('/referral')}
                        activeOpacity={0.9}
                        style={s.referralCard}
                    >
                        <View style={{ flex: 1, paddingRight: 16 }}>
                            <Text style={s.referralTitle}>Earn Credits</Text>
                            <Text style={s.referralText}>Invite classmates and get free unlimited access for a week.</Text>
                        </View>
                        <View style={s.referralIconBox}>
                            <Gift width={28} height={28} color="#ffffff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Profile Details */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={s.sectionLabel}>General Settings</Text>
                    <View style={[s.card, isDark ? s.cardDark : s.cardLight]}>
                        <Text style={s.inputLabel}>Display Name</Text>
                        <TextInput
                            style={[s.input, s.inputField, isDark ? s.inputFieldDark : s.inputFieldLight]}
                            placeholder="Your Name"
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={s.inputLabel}>Choose Avatar</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.avatarScroll}>
                            <View style={s.avatarRow}>
                                {BUILT_IN_AVATARS.map((url, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => setAvatarUrl(url)}
                                        activeOpacity={0.8}
                                        style={[
                                            s.avatarItem,
                                            avatarUrl === url ? s.avatarItemActive : (isDark ? s.avatarItemDark : s.avatarItemLight)
                                        ]}
                                    >
                                        <Image 
                                            source={{ uri: url }} 
                                            style={{ width: 64, height: 64, borderRadius: 32 }} 
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={handleUpdateProfile}
                            disabled={isUpdatingProfile}
                            activeOpacity={0.8}
                            style={[s.saveBtn, isUpdatingProfile && { opacity: 0.6 }]}
                        >
                            {isUpdatingProfile ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={s.saveBtnText}>
                                    {profileSuccess ? 'Profile Updated' : 'Save Changes'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Appearance */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={s.sectionLabel}>Appearance</Text>
                    <View style={[s.listContainer, isDark ? s.cardDark : s.cardLight]}>
                        {(['system', 'light', 'dark'] as const).map((t) => {
                            const isSelected = theme === t;
                            const icons = { system: SmartphoneDevice, light: SunLight, dark: HalfMoon };
                            const labels = { system: 'System', light: 'Light', dark: 'Dark' };
                            const Icon = icons[t];

                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => handleThemeChange(t)}
                                    activeOpacity={0.7}
                                    style={[s.listItem, isSelected && (isDark ? s.listItemActiveDark : s.listItemActiveLight)]}
                                >
                                    <View style={[s.listItemIcon, isSelected ? s.listItemIconActive : (isDark ? s.listItemIconDark : s.listItemIconLight)]}>
                                        <Icon width={18} height={18} color={isSelected ? 'white' : '#94a3b8'} />
                                    </View>
                                    <Text style={[s.listItemText, isSelected ? (isDark ? s.textWhite : s.textSlate900) : s.textSlate500]}>
                                        {labels[t]}
                                    </Text>
                                    {isSelected && <Check width={18} height={18} color={isDark ? 'white' : '#0f172a'} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Security */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={s.sectionLabel}>Security</Text>
                    <View style={[s.card, isDark ? s.cardDark : s.cardLight]}>
                        <PasswordField label="Current" value={currentPassword} onChangeText={setCurrentPassword} show={showCurrentPw} onToggle={() => setShowCurrentPw(!showCurrentPw)} />
                        <PasswordField label="New Password" value={newPassword} onChangeText={setNewPassword} show={showNewPw} onToggle={() => setShowNewPw(!showNewPw)} />
                        <PasswordField label="Confirm" value={confirmPassword} onChangeText={setConfirmPassword} show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />

                        <TouchableOpacity
                            onPress={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                            activeOpacity={0.8}
                            style={[
                                s.passwordBtn,
                                passwordSuccess ? s.passwordBtnSuccess : (isDark ? s.passwordBtnDark : s.passwordBtnLight),
                                isUpdatingPassword && { opacity: 0.7 }
                            ]}
                        >
                            {isUpdatingPassword ? (
                                <ActivityIndicator color={isDark ? '#0f0f11' : 'white'} />
                            ) : (
                                <Text style={[s.passwordBtnText, passwordSuccess ? s.textWhite : (isDark ? s.textSlate900 : s.textWhite)]}>
                                    {passwordSuccess ? 'Password Secured' : 'Update Password'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Legal & About */}
                <View style={{ marginBottom: 48 }}>
                    <Text style={s.sectionLabel}>Support & Legal</Text>
                    <View style={[s.listContainer, isDark ? s.cardDark : s.cardLight]}>
                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')}
                            style={[s.legalItem, { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
                        >
                            <ShieldCheck width={18} height={18} color="#94a3b8" />
                            <Text style={[s.legalText, { color: isDark ? '#fff' : '#334155' }]}>Privacy Policy</Text>
                            <NavArrowRight width={16} height={16} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')}
                            style={s.legalItem}
                        >
                            <Page width={18} height={18} color="#94a3b8" />
                            <Text style={[s.legalText, { color: isDark ? '#fff' : '#334155' }]}>Terms of Service</Text>
                            <NavArrowRight width={16} height={16} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <Text style={s.versionText}>
                        Skeeme v1.5.0
                    </Text>
                </View>
            </ScrollView>
            </GlowBackground>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
    drawerBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    drawerBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'transparent' },
    drawerBtnLight: { backgroundColor: '#fff', borderColor: '#E2E8F0' },

    profileHeader: { marginBottom: 32, alignItems: 'center', justifyContent: 'center' },
    avatarLarge: { width: 112, height: 112, borderRadius: 56, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 4, marginBottom: 16 },
    avatarLargeDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    avatarLargeLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
    avatarInitial: { fontSize: 32, fontWeight: '900', color: '#8B5CF6' },
    profileName: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 4 },
    profileEmail: { color: '#64748b', fontWeight: '500' },

    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },
    card: { borderRadius: 24, padding: 24, borderWidth: 1 },
    cardDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    cardLight: { backgroundColor: '#fff', borderColor: '#F1F5F9' },
    
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    planIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    planIconActive: { backgroundColor: 'rgba(139,92,246,0.2)' },
    planIconDark: { backgroundColor: 'rgba(255,255,255,0.05)' },
    planIconLight: { backgroundColor: '#F8FAFC' },
    manageBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
    manageBtnDark: { backgroundColor: '#fff', borderColor: '#fff' },
    manageBtnLight: { backgroundColor: '#020617', borderColor: '#020617' },
    manageBtnText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
    planTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4, letterSpacing: -0.5 },
    planSubtitleActive: { color: '#8B5CF6', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    planSubtitleFree: { color: '#64748b', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },

    referralCard: { backgroundColor: '#8B5CF6', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center' },
    referralTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8, letterSpacing: -0.3 },
    referralText: { color: 'rgba(255,255,255,0.8)', fontWeight: '500', fontSize: 13, lineHeight: 20 },
    referralIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },

    inputLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    inputContainer: { marginBottom: 20 },
    input: { width: '100%', height: 56, borderRadius: 12, paddingHorizontal: 20, fontSize: 15, fontWeight: '700', borderWidth: 1 },
    inputDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' },
    inputLight: { backgroundColor: '#fff', borderColor: '#F1F5F9', color: '#0f172a' },
    inputField: { fontWeight: '700', fontSize: 15, marginBottom: 24 },
    inputFieldDark: { backgroundColor: 'transparent', borderColor: 'transparent', color: '#fff' },
    inputFieldLight: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9', color: '#0f172a' },

    avatarScroll: { marginBottom: 32 },
    avatarRow: { flexDirection: 'row', gap: 12, paddingRight: 24 },
    avatarItem: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    avatarItemActive: { borderColor: '#8B5CF6' },
    avatarItemDark: { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
    avatarItemLight: { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },

    saveBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6' },
    saveBtnText: { fontWeight: '700', fontSize: 15, color: '#fff' },

    listContainer: { borderRadius: 24, padding: 12, borderWidth: 1 },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 4 },
    listItemActiveDark: { backgroundColor: 'rgba(255,255,255,0.05)' },
    listItemActiveLight: { backgroundColor: '#F8FAFC' },
    listItemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    listItemIconActive: { backgroundColor: '#8B5CF6' },
    listItemIconDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    listItemIconLight: { backgroundColor: '#F1F5F9' },
    listItemText: { flex: 1, fontWeight: '700', fontSize: 15 },

    textWhite: { color: '#fff' },
    textSlate900: { color: '#0f172a' },
    textSlate500: { color: '#64748b' },

    passwordBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderWidth: 1 },
    passwordBtnSuccess: { backgroundColor: '#10b981', borderColor: '#10b981' },
    passwordBtnDark: { backgroundColor: '#fff', borderColor: '#fff' },
    passwordBtnLight: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    passwordBtnText: { fontWeight: '700', fontSize: 15 },
    pwToggle: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center', width: 48, alignItems: 'center' },

    legalItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16 },
    legalText: { marginLeft: 16, flex: 1, fontWeight: '700', fontSize: 14 },
    versionText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 3, marginTop: 32 },
});
