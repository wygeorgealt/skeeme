import { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/GradientButton'; // This is now a solid V2 button
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export default function AccountScreen() {
    const colorScheme = useColorScheme();
    const { user, updateUser, theme, setTheme } = useAuthStore();
    // NativeWind's setter is still needed for actual class changes
    const { setColorScheme } = useNativeWindColorScheme();

    const [name, setName] = useState(user?.name || '');

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
            await api.patch('profile', { name: name.trim() });
            updateUser({ name: name.trim() });
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
        <View className="mb-6">
            <Text className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-3 ml-1">{label}</Text>
            <View className="relative">
                <TextInput
                    className={`w-full h-[64px] rounded-2xl px-6 text-[16px] font-bold pr-14 border ${isDark ? 'bg-[#161618] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}
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
                    <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const isDark = colorScheme === 'dark';

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View className="px-8 mb-10 items-center justify-center">
                    <View className={`w-24 h-24 rounded-[32px] items-center justify-center border-2 mb-4 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text className="text-[32px] font-black text-brand-primary">{user.name.charAt(0)}</Text>
                    </View>
                    <Text className={`text-[28px] font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</Text>
                    <Text className="text-slate-500 font-medium">{user.email}</Text>
                </View>

                {/* Subscription Overview */}
                <View className="px-8 pb-10">
                    <Text className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-5 ml-1">Plan Details</Text>
                    <View className={`rounded-[32px] p-8 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <View className="flex-row items-center justify-between mb-6">
                            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${user.is_unlimited ? 'bg-[#D2B48C]/20' : (isDark ? 'bg-slate-800' : 'bg-slate-50')}`}>
                                <Ionicons name="sparkles" size={24} color={user.is_unlimited ? "#D2B48C" : "#94a3b8"} />
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/upgrade')}
                                className={`px-5 py-2.5 rounded-xl border ${isDark ? 'bg-white border-white' : 'bg-slate-950 border-slate-950'}`}
                            >
                                <Text className={`font-bold text-[11px] uppercase tracking-widest ${isDark ? 'text-slate-900' : 'text-white'}`}>Manage</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <Text className={`text-[22px] font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {user.is_unlimited ? 'Unlimited Pro' : 'Free Academic'}
                        </Text>
                        {user.is_unlimited ? (
                            <Text className="text-[#D2B48C] font-bold text-[13px] uppercase tracking-[0.1em]">Full AI Access Enabled</Text>
                        ) : (
                            <Text className="text-slate-500 font-bold text-[13px] uppercase tracking-[0.1em]">{user.credits} Learning Credits Left</Text>
                        )}
                    </View>
                </View>

                {/* Referrals */}
                <View className="px-8 pb-10">
                    <TouchableOpacity
                        onPress={() => router.push('/referral')}
                        activeOpacity={0.9}
                        className="bg-brand-primary rounded-[32px] p-8 flex-row items-center justify-between shadow-xl shadow-brand-primary/20"
                    >
                        <View className="flex-1 pr-4">
                            <Text className="text-[20px] font-bold text-white mb-2 tracking-tight">Earn Credits</Text>
                            <Text className="text-white/80 font-medium text-[14px] leading-relaxed">Invite classmates and get free unlimited access for a week.</Text>
                        </View>
                        <View className="w-14 h-14 rounded-2xl items-center justify-center bg-white/20">
                            <Ionicons name="gift-outline" size={28} color="#ffffff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Profile Details */}
                <View className="px-8 pb-10">
                    <Text className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-5 ml-1">General Settings</Text>
                    <View className={`rounded-[32px] p-8 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-3 ml-1">Display Name</Text>
                        <TextInput
                            className={`h-[64px] px-6 rounded-2xl border font-bold text-[16px] mb-8 ${isDark ? 'bg-[#0f0f11] border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                            placeholder="Your Name"
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            value={name}
                            onChangeText={setName}
                        />

                        <TouchableOpacity
                            onPress={handleUpdateProfile}
                            disabled={isUpdatingProfile}
                            activeOpacity={0.8}
                            className={`h-[60px] rounded-2xl items-center justify-center bg-brand-primary shadow-sm ${isUpdatingProfile ? 'opacity-60' : ''}`}
                        >
                            {isUpdatingProfile ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="font-bold text-[16px] text-white">
                                    {profileSuccess ? 'Profile Updated' : 'Save Changes'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Theme Preferences */}
                <View className="px-8 pb-10">
                    <Text className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-5 ml-1">Appearance</Text>
                    <View className={`rounded-[32px] p-3 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        {(['system', 'light', 'dark'] as const).map((t, index) => {
                            const isSelected = theme === t;
                            const icons = { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' };
                            const labels = { system: 'System', light: 'Light', dark: 'Dark' };

                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => handleThemeChange(t)}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-5 rounded-2xl mb-1 ${isSelected ? (isDark ? 'bg-white/5' : 'bg-slate-50') : ''}`}
                                >
                                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isSelected ? 'bg-brand-primary' : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`}>
                                        <Ionicons name={icons[t] as any} size={18} color={isSelected ? 'white' : '#94a3b8'} />
                                    </View>
                                    <Text className={`flex-1 font-bold text-[16px] ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                        {labels[t]}
                                    </Text>
                                    {isSelected && <Ionicons name="checkmark" size={20} color={isDark ? 'white' : '#0f172a'} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Security */}
                <View className="px-8 pb-10">
                    <Text className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-5 ml-1">Security</Text>
                    <View className={`rounded-[32px] p-8 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <PasswordField label="Current" value={currentPassword} onChangeText={setCurrentPassword} show={showCurrentPw} onToggle={() => setShowCurrentPw(!showCurrentPw)} />
                        <PasswordField label="New Password" value={newPassword} onChangeText={setNewPassword} show={showNewPw} onToggle={() => setShowNewPw(!showNewPw)} />
                        <PasswordField label="Confirm" value={confirmPassword} onChangeText={setConfirmPassword} show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />

                        <TouchableOpacity
                            onPress={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                            activeOpacity={0.8}
                            className={`h-[60px] rounded-2xl items-center justify-center mt-4 border ${passwordSuccess ? 'bg-emerald-500 border-emerald-500' : (isDark ? 'bg-white border-white' : 'bg-slate-900 border-slate-900')} ${isUpdatingPassword ? 'opacity-70' : ''}`}
                        >
                            {isUpdatingPassword ? (
                                <ActivityIndicator color={isDark ? '#0f0f11' : 'white'} />
                            ) : (
                                <Text className={`font-bold text-[16px] ${passwordSuccess ? 'text-white' : (isDark ? 'text-slate-900' : 'text-white')}`}>
                                    {passwordSuccess ? 'Password Secured' : 'Update Password'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Legal & About */}
                <View className="px-8 pb-12">
                    <Text className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-5 ml-1">Support & Legal</Text>
                    <View className={`rounded-[32px] p-3 border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/privacy')}
                            className="flex-row items-center p-5 rounded-2xl border-b border-slate-50 dark:border-slate-800"
                        >
                            <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" />
                            <Text className={`ml-4 flex-1 font-bold text-[15px] ${isDark ? 'text-white' : 'text-slate-700'}`}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme.com/terms')}
                            className="flex-row items-center p-5 rounded-2xl"
                        >
                            <Ionicons name="document-text-outline" size={20} color="#94a3b8" />
                            <Text className={`ml-4 flex-1 font-bold text-[15px] ${isDark ? 'text-white' : 'text-slate-700'}`}>Terms of Service</Text>
                            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-[0.3em] mt-10">
                        Skeeme v1.5.0
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
