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
        <View className={`flex-1 ${isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'}`}>
            <Stack.Screen options={{ 
                title: 'Referrals & Rewards',
                headerShown: true,
                headerStyle: { backgroundColor: isDark ? '#0f0f11' : '#fafafa' },
                headerTintColor: isDark ? '#ffffff' : '#0f172a',
                headerShadowVisible: false,
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Header Title */}
                <View className="mb-10 mt-4 px-2">
                    <Text className={`text-[36px] font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Rewards</Text>
                    <Text className="text-slate-500 font-medium text-[16px] leading-relaxed">
                        Redeem codes or invite classmates to earn learning credits for both of you.
                    </Text>
                </View>

                {/* Redeem Section */}
                <View className={`rounded-[32px] p-8 border mb-10 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <View className="bg-brand-primary/10 w-12 h-12 rounded-2xl items-center justify-center mb-6">
                        <Ionicons name="gift-outline" size={24} color="#D2B48C" />
                    </View>
                    <Text className={`text-[22px] font-bold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Redeem a Invitation</Text>
                    <Text className="text-slate-500 font-medium text-[14px] leading-relaxed mb-8">
                        Enter a friend's referral code to instantly claim 100 bonus credits.
                    </Text>
                    
                    <View className="flex-row gap-3">
                        <TextInput
                            className={`flex-1 h-[60px] px-6 rounded-2xl border font-bold text-[16px] ${isDark ? 'bg-[#0f0f11] border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                            placeholder="SK-A1B2C3"
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            autoCapitalize="characters"
                            value={code}
                            onChangeText={setCode}
                        />
                        <TouchableOpacity 
                            onPress={handleRedeem}
                            disabled={loading || !code.trim()}
                            activeOpacity={0.8}
                            className={`w-[80px] h-[60px] rounded-2xl justify-center items-center ${code.trim() && !loading ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Claim</Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Code Section */}
                <View className="mb-10">
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Your Network</Text>
                    <View className="bg-brand-primary rounded-[32px] p-10 shadow-2xl shadow-brand-primary/30">
                        <View className="items-center mb-10">
                            <Text className="text-white/60 font-bold uppercase tracking-[0.2em] text-[11px] mb-4">Referral Code</Text>
                            {loadingStats ? (
                                <ActivityIndicator color="rgba(255,255,255,0.7)" />
                            ) : (
                                <Text className="text-white font-black text-[42px] tracking-[0.2em]">{stats.code || '...'}</Text>
                            )}
                        </View>
                        
                        <View className="flex-row gap-4 border-t border-white/10 pt-10">
                            <View className="flex-1 items-center">
                                <Text className="text-white/60 font-bold uppercase tracking-[0.1em] text-[10px] mb-2 text-center">Friends Joined</Text>
                                {loadingStats ? (
                                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                                ) : (
                                    <Text className="text-white font-black text-2xl tracking-tighter">{stats.total_referred}</Text>
                                )}
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-white/60 font-bold uppercase tracking-[0.1em] text-[10px] mb-2 text-center">Rewards Earned</Text>
                                {loadingStats ? (
                                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                                ) : (
                                    <Text className="text-white font-black text-2xl tracking-tighter">{stats.credits_earned}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
