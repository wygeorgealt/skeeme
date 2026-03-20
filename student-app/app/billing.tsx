import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, useColorScheme } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Stack, router } from 'expo-router';
import { WarningTriangle, Refresh, Sparks, Page, Download } from 'iconoir-react-native';
import { useCallback, useState } from 'react';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { GlowBackground } from '@/components/ui/GlowBackground';

interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    invoice_date: string;
}

function SkeletonCard({ isDark }: { isDark: boolean }) {
    return (
        <View className={`p-6 rounded-[24px] border mb-4 flex-row justify-between ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
            <View>
                <View className={`h-3 w-24 rounded-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <View className={`h-6 w-32 rounded-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <View className={`h-3 w-20 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            </View>
            <View className="items-end">
                <View className={`h-8 w-20 rounded-lg mb-5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <View className={`h-4 w-12 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            </View>
        </View>
    );
}

export default function BillingHistoryScreen() {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#fff' : '#121212';

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['billing-history'],
        queryFn: async () => {
            const response = await api.get('/billing/history');
            return response.data;
        },
    });

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleDownload = async (invoiceId: number) => {
        try {
            const token = useAuthStore.getState().token;
            const baseUrl = api.defaults.baseURL;
            const url = `${baseUrl}billing/invoices/${invoiceId}/download`;
            const fileUri = `${FileSystem.documentDirectory || ''}invoice_${invoiceId}.pdf`;

            const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/pdf',
                },
            });

            if (downloadResult.status === 200) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(downloadResult.uri);
                } else {
                    Alert.alert('Downloaded', 'Invoice saved to cache.');
                }
            } else {
                Alert.alert('Download Error', 'Could not download the invoice. Please try again.');
            }
        } catch {
            Alert.alert('Download Error', 'Failed to download invoice. Please try again.');
        }
    };

    return (
        <GlowBackground>
            <Stack.Screen
                options={{
                    title: 'Billing History',
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: isDark ? '#0f0f11' : '#fafafa' },
                    headerTintColor: isDark ? '#ffffff' : '#0f172a',
                }}
            />

            {isLoading ? (
                <View className="flex-1 px-6 pt-8">
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-6 ml-1">Loading History</Text>
                    <SkeletonCard isDark={isDark} />
                    <SkeletonCard isDark={isDark} />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center p-6">
                    <View className={`size-24 rounded-[24px] items-center justify-center mb-6 border ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <WarningTriangle width={40} height={40} color="#ef4444" />
                    </View>
                    <Text className={`font-bold mb-3 text-[20px] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Unable to load</Text>
                    <Text className="text-slate-500 text-center mb-8 font-medium text-[14px] leading-relaxed">
                        We couldn't retrieve your billing history. Please check your connection.
                    </Text>
                    <TouchableOpacity 
                        onPress={() => refetch()}
                        className="h-[52px] w-full max-w-[240px] rounded-[20px] bg-brand-primary items-center justify-center flex-row"
                    >
                        <Refresh width={18} height={18} color="white" />
                        <Text className="text-white font-bold text-[15px] ml-2">Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 pt-6"
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? 'white' : '#121212'} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Page Header */}
                    <View className="mb-8 mt-2 px-2">
                        <Text className={`text-[36px] font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Billing</Text>
                        <Text className="text-slate-500 font-medium text-[15px]">
                            Manage your subscription and view past receipts.
                        </Text>
                    </View>

                    {/* Current Plan Overview */}
                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 ml-1">Subscription Status</Text>
                    <View className={`rounded-[24px] p-6 border mb-10 ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <View className="flex-row items-center justify-between mb-6">
                            <View className={`size-12 rounded-xl items-center justify-center ${user?.is_unlimited ? 'bg-brand-primary/20' : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`}>
                                <Sparks width={18} height={18} color={user?.is_unlimited ? "#8B5CF6" : "#94a3b8"} />
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/upgrade')}
                                className={`px-5 py-2.5 rounded-lg border ${isDark ? 'bg-white border-white' : 'bg-slate-950 border-slate-950'}`}
                            >
                                <Text className={`font-bold text-[11px] uppercase tracking-widest ${isDark ? 'text-slate-900' : 'text-white'}`}>Plans</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className={`font-bold text-[22px] tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {user?.is_unlimited ? 'Unlimited Pro' : 'Free Academic'}
                        </Text>
                        <Text className="text-slate-500 font-bold text-[13px]">
                            {user?.is_unlimited ? 'Fully unlocked learning companion' : `${user?.credits ?? 0} Credits remaining`}
                        </Text>
                    </View>

                    <Text className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 ml-1">Payment History</Text>

                    {data?.data?.length === 0 ? (
                        <View className={`items-center py-20 rounded-[24px] border-2 border-dashed ${isDark ? 'bg-black/20 border-transparent' : 'bg-white border-slate-100'}`}>
                            <View className={`size-16 rounded-[28px] items-center justify-center mb-5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Page width={32} height={32} color={isDark ? '#cbd5e1' : '#64748b'} />
                            </View>
                            <Text className={`font-bold text-[18px] tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Invoices</Text>
                            <Text className="text-slate-500 font-medium text-[13px] text-center px-12 leading-relaxed">
                                Once you start a subscription or buy credits, your receipts will appear here.
                            </Text>
                        </View>
                    ) : (
                        data?.data?.map((invoice: Invoice) => (
                            <View key={invoice.id} className={`p-6 rounded-[24px] border mb-5 flex-row items-center justify-between ${isDark ? 'bg-[#13151B] border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <View className="flex-1 pr-4">
                                    <View className="flex-row items-center mb-1">
                                        <Text className={`font-bold text-[16px] tracking-tight mr-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {invoice.currency} {Number(invoice.amount).toLocaleString()}
                                        </Text>
                                        <View className={`px-2 py-0.5 rounded-lg border ${invoice.status === 'paid' ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-slate-800 bg-slate-800/20'}`}>
                                            <Text className={`text-[9px] font-bold uppercase tracking-widest ${invoice.status === 'paid' ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                {invoice.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.1em] mb-4">
                                        {new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                    <Text className="text-[10px] font-bold text-slate-400/60 uppercase tracking-widest">#{invoice.invoice_number}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleDownload(invoice.id)}
                                    activeOpacity={0.7}
                                    className={`size-12 rounded-xl items-center justify-center border ${isDark ? 'bg-black/20 border-transparent' : 'bg-slate-50 border-slate-200'}`}
                                >
                                    <Download width={18} height={18} color={isDark ? 'white' : '#121212'} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                    <View className="h-10" />
                </ScrollView>
            )}
        </GlowBackground>
    );
}
