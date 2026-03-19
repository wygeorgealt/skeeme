import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ReferralScreen() {
    const { user, updateUser } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#ffffff' : '#121212';
    
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ code: '', total_referred: 0, credits_earned: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    
    useEffect(() => {
        Promise.all([
            api.get('referral/my-code').then(res => setStats(prev => ({ ...prev, code: res.data.code }))).catch(() => {}),
            api.get('referral/stats').then(res => setStats(prev => ({ ...prev, total_referred: res.data.total_referred || 0, credits_earned: res.data.credits_earned || 0 }))).catch(() => {})
        ]).finally(() => setLoadingStats(false));
    }, []);

    const handleRedeem = async () => {
        if (!code.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('referral/redeem', { code: code.trim().toUpperCase() });
            Alert.alert('Success!', res.data.message || '100 Credits added to your account!');
            setCode('');
            // Refresh user credits
            const userRes = await api.get('me');
            if (userRes.data) updateUser(userRes.data);
            
            // Refresh stats
            const statsRes = await api.get('referral/stats');
            if(statsRes.data) setStats(prev => ({...prev, total_referred: statsRes.data.total_referred, credits_earned: statsRes.data.credits_earned}));
            
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Invalid or expired referral code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-brand-dark">
            <Stack.Screen options={{ 
                title: 'Referrals & Rewards',
                headerShown: true,
                headerStyle: { backgroundColor: bgColor },
                headerTintColor: tintColor,
                headerShadowVisible: false,
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Redeem Section */}
                <View className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 mb-8">
                    <View className="bg-brand-primary/10 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="gift" size={24} color="#D2B48C" />
                    </View>
                    <Text className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Redeem a Code</Text>
                    <Text className="text-slate-500 dark:text-slate-400 font-medium text-[13px] leading-relaxed mb-6">
                        Were you invited by a friend? Enter their referral code below to instantly claim 100 bonus credits for both of you. You can only do this once.
                    </Text>
                    
                    <View className="flex-row gap-3">
                        <TextInput
                            className="flex-1 bg-white dark:bg-brand-dark border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold"
                            placeholder="e.g. SK-A1B2C3"
                            placeholderTextColor="#94a3b8"
                            autoCapitalize="characters"
                            value={code}
                            onChangeText={setCode}
                        />
                        <TouchableOpacity 
                            onPress={handleRedeem}
                            disabled={loading || !code.trim()}
                            className={`px-5 rounded-xl justify-center items-center ${code.trim() && !loading ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black">Claim</Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Code Section */}
                <Text className="text-lg font-black text-slate-900 dark:text-white mb-4 tracking-tight">Invite Friends</Text>
                <View className="bg-brand-primary rounded-[24px] p-6 shadow-xl shadow-brand-primary/20">
                    <Text className="text-white/80 font-bold uppercase tracking-widest text-[11px] mb-2">Your Referral Code</Text>
                    {loadingStats ? (
                        <ActivityIndicator className="mb-6 h-9 items-start" color="rgba(255,255,255,0.7)" />
                    ) : (
                        <Text className="text-white font-black text-3xl tracking-widest mb-6">{stats.code || '...'}</Text>
                    )}
                    
                    <View className="flex-row gap-4 border-t border-white/20 pt-5">
                        <View className="flex-1">
                            <Text className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-1">Friends Joined</Text>
                            {loadingStats ? (
                                <ActivityIndicator size="small" className="h-8 items-start justify-center" color="rgba(255,255,255,0.7)" />
                            ) : (
                                <Text className="text-white font-black text-2xl tracking-tighter">{stats.total_referred}</Text>
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-1">Credits Earned</Text>
                            {loadingStats ? (
                                <ActivityIndicator size="small" className="h-8 items-start justify-center" color="rgba(255,255,255,0.7)" />
                            ) : (
                                <Text className="text-white font-black text-2xl tracking-tighter">{stats.credits_earned}</Text>
                            )}
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
