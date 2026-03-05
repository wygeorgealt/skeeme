import { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/GradientButton'; // This is now a solid V2 button
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useColorScheme as useTailwindColorScheme } from 'nativewind';

export default function AccountScreen() {
    const { user, updateUser, theme, setTheme } = useAuthStore();
    const { setColorScheme } = useTailwindColorScheme();

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
        if (!email.trim()) return Alert.alert('Required', 'Email cannot be empty.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return Alert.alert('Invalid Email', 'Please enter a valid email address.');
        }

        setIsUpdatingProfile(true);
        setProfileSuccess(false);
        try {
            await api.patch('/profile', { name: name.trim(), email: email.trim().toLowerCase() });
            updateUser({ name: name.trim(), email: email.trim().toLowerCase() });
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (error: any) {
            Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong.');
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
            await api.post('/profile/password', {
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
            Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong.');
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
                    <View className="bg-slate-50 dark:bg-slate-900 rounded-[24px] p-6 border-2 border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
                        <View>
                            <Text className="text-[20px] font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                                {user.is_unlimited ? 'Unlimited Pro' : 'Free Tier'}
                            </Text>
                            {user.is_unlimited ? (
                                <Text className="text-[#2EBD85] font-bold text-[13px] uppercase tracking-widest">Active Subscription</Text>
                            ) : (
                                <Text className="text-slate-500 font-bold text-[13px] uppercase tracking-widest">{user.credits} Credits Remaining</Text>
                            )}
                        </View>
                        <View className={`size-14 rounded-full items-center justify-center border-2 ${user.is_unlimited ? 'border-[#2EBD85] bg-[#2EBD85]/10' : 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800'}`}>
                            <Ionicons name="flash" size={24} color={user.is_unlimited ? "#2EBD85" : "#94a3b8"} />
                        </View>
                    </View>
                </View>

                {/* Profile Details */}
                <View className="px-6 pb-8">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Profile Info</Text>
                    <View className="bg-slate-50 dark:bg-slate-900 rounded-[24px] p-6 border-2 border-slate-200 dark:border-slate-800">
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
                        <TextInput
                            className="w-full bg-white dark:bg-brand-dark border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[16px] font-bold text-slate-900 dark:text-white mb-8 focus:border-slate-900 dark:focus:border-white"
                            placeholder="john@example.com"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            value={email}
                            onChangeText={setEmail}
                        />

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
                    <View className="bg-slate-50 dark:bg-slate-900 rounded-[24px] p-2 border-2 border-slate-200 dark:border-slate-800">
                        {(['system', 'light', 'dark'] as const).map((t, index) => {
                            const isSelected = theme === t;
                            const icons = { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' };
                            const labels = { system: 'System Default', light: 'Light Mode', dark: 'Dark Mode' };

                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => handleThemeChange(t)}
                                    className={`flex-row items-center justify-between p-4 ${index !== 2 ? 'border-b-2 border-slate-200 dark:border-slate-800' : ''}`}
                                >
                                    <View className="flex-row items-center">
                                        <View className={`size-12 rounded-xl border-2 items-center justify-center mr-4 ${isSelected ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-brand-dark'}`}>
                                            <Ionicons name={icons[t] as any} size={20} color={isSelected ? (t === 'dark' ? '#0f172a' : 'white') : '#64748b'} />
                                        </View>
                                        <Text className={`font-black tracking-tight text-[16px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                            {labels[t]}
                                        </Text>
                                    </View>
                                    <View className={`size-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-slate-900 dark:border-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {isSelected && <View className="size-3 bg-slate-900 dark:bg-white rounded-full" />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Security */}
                <View className="px-6 pb-12">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Security</Text>
                    <View className="bg-slate-50 dark:bg-slate-900 rounded-[24px] p-6 border-2 border-slate-200 dark:border-slate-800">

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
                                <ActivityIndicator color="#0f172a" />
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
