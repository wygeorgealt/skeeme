import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { router, useNavigation } from 'expo-router';
import { Menu, Gift } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { GlowBackground } from '@/components/ui/GlowBackground';

export default function ReferralScreen() {
    const { user, updateUser } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation() as any;
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
        <GlowBackground useSafeArea>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with drawer toggle */}
            <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                    <Text className={`text-[26px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Rewards</Text>
                    <Text className="text-slate-500 font-medium text-[13px] mt-1">Redeem codes or invite classmates to earn learning credits.</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    activeOpacity={0.7}
                    className={`size-10 rounded-xl items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                >
                    <Menu width={20} height={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Redeem Section */}
                <View className={`rounded-[24px] p-6 border mb-8 ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <View className="bg-brand-primary/10 w-12 h-12 rounded-xl items-center justify-center mb-5">
                        <Gift width={18} height={18} color="#8B5CF6" />
                    </View>
                    <Text className={`text-[22px] font-bold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Redeem an Invitation</Text>
                    <Text className="text-slate-500 font-medium text-[13px] leading-relaxed mb-6">
                        Enter a friend's referral code to instantly claim 100 bonus credits.
                    </Text>
                    
                    <View className="flex-row gap-3">
                        <TextInput
                            className={`flex-1 h-[52px] px-5 rounded-xl border font-bold text-[15px] ${isDark ? 'bg-transparent border-transparent text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
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
                            className={`w-[80px] h-[52px] rounded-xl justify-center items-center ${code.trim() && !loading ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Claim</Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Code Section */}
                <View className="mb-8">
                    <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5 ml-1">Your Network</Text>
                    <View className="bg-brand-primary rounded-[24px] p-8 shadow-2xl shadow-brand-primary/30">
                        <View className="items-center mb-8">
                            <Text className="text-white/60 font-bold uppercase tracking-widest text-[11px] mb-4">Referral Code</Text>
                            {loadingStats ? (
                                <ActivityIndicator color="rgba(255,255,255,0.7)" />
                            ) : (
                                <Text className="text-white font-black text-[32px] tracking-widest">{stats.code || '...'}</Text>
                            )}
                        </View>
                        
                        <View className="flex-row gap-4 border-t border-white/10 pt-10">
                            <View className="flex-1 items-center">
                                <Text className="text-white/60 font-bold uppercase tracking-[0.1em] text-[10px] mb-2 text-center">Friends Joined</Text>
                                {loadingStats ? (
                                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                                ) : (
                                    <Text className="text-white font-black text-xl tracking-tighter">{stats.total_referred}</Text>
                                )}
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-white/60 font-bold uppercase tracking-[0.1em] text-[10px] mb-2 text-center">Rewards Earned</Text>
                                {loadingStats ? (
                                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                                ) : (
                                    <Text className="text-white font-black text-xl tracking-tighter">{stats.credits_earned}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </GlowBackground>
    );
}
