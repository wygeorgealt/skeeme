import { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/GradientButton'; // This is now a solid V2 button
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';

export default function AccountScreen() {
    const colorScheme = useColorScheme();
    const { user, updateUser, theme, setTheme } = useAuthStore();
    // NativeWind's setter is still needed for actual class changes
    const { setColorScheme } = require('nativewind').useColorScheme();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
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
        label, value, onChangeText, show, onToggle, placeholder = '••••••••', autoComplete,
    }: {
        label: string; value: string; onChangeText: (v: string) => void;
        show: boolean; onToggle: () => void; placeholder?: string; autoComplete?: string;
    }) => (
        <View className="mb-6">
            <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-3">{label}</Text>
            <View className="relative">
                <TextInput
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white pr-14 focus:border-slate-900 dark:focus:border-white"
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!show}
                    value={value}
                    onChangeText={onChangeText}
                />
                <TouchableOpacity
                    onPress={onToggle}
                    className="absolute right-4 top-0 bottom-0 justify-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-brand-dark"
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Subscription Overview */}
                <View className="px-6 py-8">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Subscription</Text>
                    <View className="bg-slate-50 dark:bg-white/5 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 flex-row items-center justify-between shadow-sm">
                        <View>
                            <Text className="text-[20px] font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                                {user.is_unlimited ? 'Unlimited Pro' : 'Free Tier'}
                            </Text>
                            {user.is_unlimited ? (
                                <Text className="text-[#2EBD85] font-bold text-[13px] uppercase tracking-widest">Active Subscription</Text>
                            ) : (
                                <Text className="text-slate-500 font-bold text-[13px] uppercase tracking-widest">{user.credits} Credits Remaining</Text>
                            )}
                            <TouchableOpacity
                                onPress={() => router.push('/upgrade')}
                                className="mt-4 bg-white dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start"
                            >
                                <Text className="text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-widest">Manage Plan</Text>
                            </TouchableOpacity>
                        </View>
                        <View className={`size-14 rounded-full items-center justify-center border-2 ${user.is_unlimited ? 'border-[#2EBD85] bg-[#2EBD85]/10' : 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800'}`}>
                            <Ionicons name="flash" size={24} color={user.is_unlimited ? "#2EBD85" : "#94a3b8"} />
                        </View>
                    </View>
                </View>

                {/* Profile Details */}
                <View className="px-6 pb-8">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Profile Info</Text>
                    <View className="bg-slate-50 dark:bg-white/5 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-3">Full Name</Text>
                        <TextInput
                            className="w-full bg-white dark:bg-brand-dark border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white mb-6 focus:border-slate-900 dark:focus:border-white"
                            placeholder="John Doe"
                            placeholderTextColor="#94a3b8"
                            value={name}
                            onChangeText={setName}
                            autoComplete="name"
                        />

                        <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-3">Email Address</Text>
                        <View className="w-full bg-slate-100 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 mb-8 opacity-60">
                            <Text className="text-[16px] font-bold text-slate-500 dark:text-slate-400">
                                {email}
                            </Text>
                        </View>

                        <GradientButton
                            onPress={handleUpdateProfile}
                            loading={isUpdatingProfile}
                            containerStyle="w-full"
                        >
                            {profileSuccess ? 'Updated Successfully' : 'Save Changes'}
                        </GradientButton>
                    </View>
                </View>

                {/* Theme Preferences */}
                <View className="px-6 pb-8">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Appearance</Text>
                    <View className="bg-slate-50 dark:bg-white/5 rounded-[24px] p-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                        {(['system', 'light', 'dark'] as const).map((t, index) => {
                            const isSelected = theme === t;
                            const icons = { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' };
                            const labels = { system: 'System Default', light: 'Light Mode', dark: 'Dark Mode' };

                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => handleThemeChange(t)}
                                    className="flex-row items-center justify-between p-4"
                                    style={index !== 2 ? { borderBottomWidth: 2, borderBottomColor: colorScheme === 'dark' ? '#1e293b' : '#e2e8f0' } : {}}
                                >
                                    <View className="flex-row items-center">
                                        <View
                                            className="size-12 rounded-xl border-2 items-center justify-center mr-4"
                                                style={[
                                                    { borderWidth: 2 },
                                                    colorScheme === 'dark'
                                                        ? { borderColor: '#ffffff', backgroundColor: '#ffffff' }
                                                        : { borderColor: '#cbd5e1', backgroundColor: '#ffffff' }
                                                ]}
                                            >
                                            <Ionicons name={icons[t] as any} size={20} color={isSelected ? (t === 'dark' ? '#121212' : 'white') : '#64748b'} />
                                        </View>
                                        <Text
                                            className="font-black tracking-tight text-[16px]"
                                            style={{ color: isSelected ? (colorScheme === 'dark' ? '#ffffff' : '#121212') : '#64748b' }}
                                        >
                                            {labels[t]}
                                        </Text>
                                    </View>
                                    <View
                                        className="size-6 rounded-full border-2 items-center justify-center"
                                        style={{ borderColor: isSelected ? (colorScheme === 'dark' ? '#ffffff' : '#121212') : (colorScheme === 'dark' ? '#475569' : '#cbd5e1') }}
                                    >
                                        {isSelected && <View className="size-3 rounded-full" style={{ backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#121212' }} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Security */}
                <View className="px-6 pb-8">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Security</Text>
                    <View className="bg-slate-50 dark:bg-white/5 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">

                        <PasswordField label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} show={showCurrentPw} onToggle={() => setShowCurrentPw(!showCurrentPw)} />
                        <PasswordField label="New Password" value={newPassword} onChangeText={setNewPassword} show={showNewPw} onToggle={() => setShowNewPw(!showNewPw)} />

                        {newPassword.length > 0 && newPassword.length < 8 && (
                            <Text className="text-red-500 text-[12px] font-bold uppercase tracking-widest -mt-4 mb-5 ml-1">
                                Must be at least 8 characters
                            </Text>
                        )}

                        <PasswordField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />

                        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                            <Text className="text-red-500 text-[12px] font-bold uppercase tracking-widest -mt-4 mb-5 ml-1">
                                Passwords do not match
                            </Text>
                        )}

                        <TouchableOpacity
                            onPress={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                            className={`w-full h-[56px] rounded-xl items-center flex-row justify-center mt-4 border-2 ${passwordSuccess ? 'bg-[#2EBD85] border-[#2EBD85]' : 'bg-white dark:bg-brand-dark border-slate-200 dark:border-slate-700'} ${isUpdatingPassword ? 'opacity-70' : ''}`}
                            activeOpacity={0.8}
                        >
                            {isUpdatingPassword ? (
                                <ActivityIndicator color="#121212" />
                            ) : passwordSuccess ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={18} color="white" />
                                    <Text className="text-white font-black ml-2 text-[15px] tracking-widest uppercase">Secured</Text>
                                </>
                            ) : (
                                <Text className="text-slate-900 dark:text-white font-black text-[15px] tracking-widest uppercase">Change Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Legal & About */}
                <View className="px-6 pb-12">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Legal & Support</Text>
                    <View className="bg-slate-50 dark:bg-white/5 rounded-[24px] p-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme-web.onrender.com/privacy')}
                            className="flex-row items-center justify-between p-4 border-b-2 border-slate-100 dark:border-slate-800"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="shield-checkmark-outline" size={20} color={colorScheme === 'dark' ? '#94a3b8' : '#64748b'} />
                                <Text className="ml-4 font-bold text-slate-900 dark:text-white">Privacy Policy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync('https://skeeme-web.onrender.com/terms')}
                            className="flex-row items-center justify-between p-4"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="document-text-outline" size={20} color={colorScheme === 'dark' ? '#94a3b8' : '#64748b'} />
                                <Text className="ml-4 font-bold text-slate-900 dark:text-white">Terms of Service</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-8 items-center">
                        <Text className="text-slate-400 dark:text-slate-600 font-bold text-[12px] uppercase tracking-widest">
                            Skeeme Version 1.3.0
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
