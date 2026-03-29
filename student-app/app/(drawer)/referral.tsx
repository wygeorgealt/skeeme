import { Text } from '@/components/ui/Text';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, useColorScheme, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { NavArrowLeft, Gift } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';

export default function ReferralScreen() {
    const { user, updateUser } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    
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
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[s.menuBtn, isDark ? s.menuBtnDark : s.menuBtnLight]}>
                    <NavArrowLeft width={24} height={24} color={isDark ? 'white' : '#1e293b'} />
                </TouchableOpacity>
                <View style={s.headerTextContainer}>
                    <Text style={[s.headerTitle, { color: C.text }]}>Rewards</Text>
                    <Text style={[s.headerSubtitle, { color: C.textSecondary }]}>Redeem codes or invite classmates to earn learning credits.</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={s.scrollView} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Redeem Section */}
                <View style={[s.sectionCard, isDark ? s.sectionCardDark : s.sectionCardLight]}>
                    <View style={s.iconBox}>
                        <Gift width={18} height={18} color={C.primary} />
                    </View>
                    <Text style={[s.sectionTitle, { color: C.text }]}>Redeem an Invitation</Text>
                    <Text style={s.sectionDesc}>
                        Enter a friend's referral code to instantly claim 100 bonus credits.
                    </Text>
                    
                    <View style={s.inputRow}>
                        <TextInput
                            style={[s.textInput, isDark ? s.textInputDark : s.textInputLight]}
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
                            style={[s.claimBtn, code.trim() && !loading ? s.claimBtnActive : (isDark ? s.claimBtnDark : s.claimBtnLight)]}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.claimBtnText}>Claim</Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Code Section */}
                <View style={s.statsSection}>
                    <Text style={s.sectionLabel}>Your Network</Text>
                    <View style={[s.codeCard, { backgroundColor: C.primary }]}>
                        <View style={s.codeHeader}>
                            <Text style={s.codeLabel}>Referral Code</Text>
                            {loadingStats ? (
                                <ActivityIndicator color="rgba(255,255,255,0.7)" />
                            ) : (
                                <Text style={s.codeValue}>{stats.code || '...'}</Text>
                            )}
                        </View>
                        
                        <View style={s.statsGrid}>
                            <View style={s.statBox}>
                                <Text style={s.statLabel}>Friends Joined</Text>
                                {loadingStats ? (
                                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                                ) : (
                                    <Text style={s.statValue}>{stats.total_referred}</Text>
                                )}
                            </View>
                            <View style={s.statBox}>
                                <Text style={s.statLabel}>Rewards Earned</Text>
                                {loadingStats ? (
                                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                                ) : (
                                    <Text style={s.statValue}>{stats.credits_earned}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTextContainer: { flex: 1, paddingHorizontal: 16, alignItems: 'center' },
    headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -1 },
    headerSubtitle: { fontWeight: '500', fontSize: 13, marginTop: 4, textAlign: 'center' },
    menuBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    menuBtnLight: { backgroundColor: '#F1F5F9' },

    scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
    
    sectionCard: { borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 32 },
    sectionCardDark: { backgroundColor: '#1C1C1E', borderColor: 'transparent' },
    sectionCardLight: { backgroundColor: 'white', borderColor: '#F1F5F9' },
    
    iconBox: { backgroundColor: 'rgba(0,122,255,0.1)', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, letterSpacing: -0.5 },
    sectionDesc: { color: '#64748b', fontWeight: '500', fontSize: 13, lineHeight: 20, marginBottom: 24 },
    
    inputRow: { flexDirection: 'row', gap: 12 },
    textInput: { flex: 1, height: 52, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, fontWeight: '700', fontSize: 15 },
    textInputDark: { backgroundColor: 'transparent', borderColor: 'transparent', color: 'white' },
    textInputLight: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9', color: '#0f172a' },
    
    claimBtn: { width: 80, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    claimBtnActive: { backgroundColor: '#007AFF' },
    claimBtnLight: { backgroundColor: '#CBD5E1' },
    claimBtnDark: { backgroundColor: '#334155' },
    claimBtnText: { color: 'white', fontWeight: '700' },

    statsSection: { marginBottom: 32 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20, marginLeft: 4 },
    
    codeCard: { borderRadius: 24, padding: 32 },
    codeHeader: { alignItems: 'center', marginBottom: 32 },
    codeLabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, fontSize: 11, marginBottom: 16 },
    codeValue: { color: 'white', fontWeight: '900', fontSize: 32, letterSpacing: 4 },
    
    statsGrid: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 40 },
    statBox: { flex: 1, alignItems: 'center' },
    statLabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, marginBottom: 8, textAlign: 'center' },
    statValue: { color: 'white', fontWeight: '900', fontSize: 20, letterSpacing: -1 },

    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
});
