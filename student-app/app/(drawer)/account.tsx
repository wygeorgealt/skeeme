import { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme, Image
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
        <View className="mb-5">
            <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3 ml-1">{label}</Text>
            <View className="relative">
                <TextInput
                    className={`w-full h-[56px] rounded-xl px-5 text-[15px] font-bold pr-14 border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                    secureTextEntry={!show}
                    value={value}
                    onChangeText={onChangeText}
                />
                <TouchableOpacity
                    onPress={onToggle}
                    className="absolute right-4 top-0 bottom-0 justify-center w-12 items-center"
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
            className="flex-1"
        >
            <GlowBackground>
                {/* Header with drawer toggle */}
            <View style={{ paddingTop: Math.max(insets.top, 8) }} className="px-5 pb-4 flex-row items-center justify-between">
                <Text className={`text-[26px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Account</Text>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    className={`size-10 rounded-xl items-center justify-center border ${isDark ? 'bg-white/10 border-transparent' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-2"
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View className="mb-8 items-center justify-center">
                    <View className={`w-28 h-28 rounded-[32px] overflow-hidden items-center justify-center border-4 mb-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                        {user.avatar || user.avatar_url ? (
                            <Image source={{ uri: user.avatar || user.avatar_url }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Text className="text-[32px] font-black text-[#8B5CF6]">{user.name.charAt(0)}</Text>
                        )}
                    </View>
                    <Text className={`text-[28px] font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</Text>
                    <Text className="text-slate-500 font-medium">{user.email}</Text>
                </View>

                {/* Subscription Overview */}
                <View className="pb-8">
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 ml-1">Plan Details</Text>
                    <View className={`rounded-[24px] p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <View className="flex-row items-center justify-between mb-5">
                            <View className={`w-14 h-14 rounded-xl items-center justify-center ${user.is_unlimited ? 'bg-[#8B5CF6]/20' : (isDark ? 'bg-white/5' : 'bg-slate-50')}`}>
                                <Sparks width={18} height={18} color={user.is_unlimited ? "#8B5CF6" : "#94a3b8"} />
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/upgrade')}
                                className={`px-5 py-2.5 rounded-lg border ${isDark ? 'bg-white border-white' : 'bg-slate-950 border-slate-950'}`}
                            >
                                <Text className={`font-bold text-[11px] uppercase tracking-widest ${isDark ? 'text-slate-900' : 'text-white'}`}>Manage</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <Text className={`text-[22px] font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {user.is_unlimited ? 'Unlimited Pro' : 'Free Academic'}
                        </Text>
                        {user.is_unlimited ? (
                            <Text className="text-[#8B5CF6] font-bold text-[12px] uppercase tracking-[0.1em]">Full AI Access Enabled</Text>
                        ) : (
                            <Text className="text-slate-500 font-bold text-[12px] uppercase tracking-[0.1em]">{user.credits} Learning Credits Left</Text>
                        )}
                    </View>
                </View>

                {/* Referrals */}
                <View className="px-6 pb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/referral')}
                        activeOpacity={0.9}
                        className="bg-brand-primary rounded-[24px] p-6 flex-row items-center justify-between shadow-xl shadow-brand-primary/20"
                    >
                        <View className="flex-1 pr-4">
                            <Text className="text-[18px] font-bold text-white mb-2 tracking-tight">Earn Credits</Text>
                            <Text className="text-white/80 font-medium text-[13px] leading-relaxed">Invite classmates and get free unlimited access for a week.</Text>
                        </View>
                        <View className="w-14 h-14 rounded-xl items-center justify-center bg-white/20">
                            <Gift width={28} height={28} color="#ffffff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Profile Details */}
                <View className="px-6 pb-8">
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 ml-1">General Settings</Text>
                    <View className={`rounded-[24px] p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3 ml-1">Display Name</Text>
                        <TextInput
                            className={`h-[56px] px-5 rounded-xl border font-bold text-[15px] mb-6 ${isDark ? 'bg-transparent border-transparent text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                            placeholder="Your Name"
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-4 ml-1">Choose Avatar</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
                            <View className="flex-row gap-3 pr-6">
                                {BUILT_IN_AVATARS.map((url, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => setAvatarUrl(url)}
                                        activeOpacity={0.8}
                                        className={`w-16 h-16 rounded-2xl overflow-hidden border-2 items-center justify-center ${avatarUrl === url ? 'border-brand-primary shadow-lg shadow-brand-primary/20' : (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')}`}
                                    >
                                        <Image source={{ uri: url }} style={{ width: 56, height: 56 }} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={handleUpdateProfile}
                            disabled={isUpdatingProfile}
                            activeOpacity={0.8}
                            className={`h-[52px] rounded-xl items-center justify-center bg-brand-primary shadow-sm ${isUpdatingProfile ? 'opacity-60' : ''}`}
                        >
                            {isUpdatingProfile ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="font-bold text-[15px] text-white">
                                    {profileSuccess ? 'Profile Updated' : 'Save Changes'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Theme Preferences */}
                <View className="px-6 pb-8">
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 ml-1">Appearance</Text>
                    <View className={`rounded-[24px] p-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
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
                                    className={`flex-row items-center p-4 rounded-xl mb-1 ${isSelected ? (isDark ? 'bg-white/5' : 'bg-slate-50') : ''}`}
                                >
                                    <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${isSelected ? 'bg-brand-primary' : (isDark ? 'bg-white/10' : 'bg-slate-100')}`}>
                                        <Icon width={18} height={18} color={isSelected ? 'white' : '#94a3b8'} />
                                    </View>
                                    <Text className={`flex-1 font-bold text-[15px] ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                        {labels[t]}
                                    </Text>
                                    {isSelected && <Check width={18} height={18} color={isDark ? 'white' : '#0f172a'} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Security */}
                <View className="pb-8">
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 ml-1">Security</Text>
                    <View className={`rounded-[24px] p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <PasswordField label="Current" value={currentPassword} onChangeText={setCurrentPassword} show={showCurrentPw} onToggle={() => setShowCurrentPw(!showCurrentPw)} />
                        <PasswordField label="New Password" value={newPassword} onChangeText={setNewPassword} show={showNewPw} onToggle={() => setShowNewPw(!showNewPw)} />
                        <PasswordField label="Confirm" value={confirmPassword} onChangeText={setConfirmPassword} show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />

                        <TouchableOpacity
                            onPress={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                            activeOpacity={0.8}
                            className={`h-[52px] rounded-xl items-center justify-center mt-4 border ${passwordSuccess ? 'bg-emerald-500 border-emerald-500' : (isDark ? 'bg-white border-white' : 'bg-slate-900 border-slate-900')} ${isUpdatingPassword ? 'opacity-70' : ''}`}
                        >
                            {isUpdatingPassword ? (
                                <ActivityIndicator color={isDark ? '#0f0f11' : 'white'} />
                            ) : (
                                <Text className={`font-bold text-[15px] ${passwordSuccess ? 'text-white' : (isDark ? 'text-slate-900' : 'text-white')}`}>
                                    {passwordSuccess ? 'Password Secured' : 'Update Password'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Legal & About */}
                <View className="px-6 pb-12">
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 ml-1">Support & Legal</Text>
                    <View className={`rounded-[24px] p-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')}
                            className="flex-row items-center p-4 rounded-xl border-b border-slate-50 dark:border-slate-800"
                        >
                            <ShieldCheck width={18} height={18} color="#94a3b8" />
                            <Text className={`ml-4 flex-1 font-bold text-[14px] ${isDark ? 'text-white' : 'text-slate-700'}`}>Privacy Policy</Text>
                            <NavArrowRight width={16} height={16} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')}
                            className="flex-row items-center p-4 rounded-xl"
                        >
                            <Page width={18} height={18} color="#94a3b8" />
                            <Text className={`ml-4 flex-1 font-bold text-[14px] ${isDark ? 'text-white' : 'text-slate-700'}`}>Terms of Service</Text>
                            <NavArrowRight width={16} height={16} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-[0.3em] mt-8">
                        Skeeme v1.5.0
                    </Text>
                </View>
            </ScrollView>
            </GlowBackground>
        </KeyboardAvoidingView>
    );
}
