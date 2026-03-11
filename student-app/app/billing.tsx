import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, useColorScheme, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    invoice_date: string;
}

// Skeleton loading placeholder
function SkeletonCard() {
    return (
        <View className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 mb-4 flex-row justify-between">
            <View>
                <View className="bg-slate-200 dark:bg-slate-800 h-3 w-24 rounded-full mb-3" />
                <View className="bg-slate-200 dark:bg-slate-800 h-5 w-32 rounded-full mb-3" />
                <View className="bg-slate-200 dark:bg-slate-800 h-3 w-20 rounded-full" />
            </View>
            <View className="items-end">
                <View className="bg-slate-200 dark:bg-slate-800 h-6 w-16 rounded-full mb-4" />
                <View className="bg-slate-200 dark:bg-slate-800 h-4 w-16 rounded-full" />
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
        <View className="flex-1 bg-white dark:bg-brand-dark">
            <Stack.Screen
                options={{
                    title: 'Billing History',
                    headerShown: true,
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: bgColor },
                    headerTintColor: tintColor,
                }}
            />

            {isLoading ? (
                <View className="flex-1 px-6 pt-6">
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-6">Past Invoices</Text>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center p-6">
                    <View className="size-24 bg-red-500/10 rounded-[24px] items-center justify-center mb-6">
                        <Ionicons name="cloud-offline" size={40} color="#ef4444" />
                    </View>
                    <Text className="text-red-500 font-black mb-2 text-[22px] tracking-tight">Connection Error</Text>
                    <Text className="text-slate-500 text-center mb-8 font-bold text-[14px]">
                        Could not load billing history. Check your connection and try again.
                    </Text>
                    <View className="w-full max-w-[200px]">
                        <GradientButton onPress={() => refetch()} icon={<Ionicons name="refresh" size={20} color={isDark ? '#121212' : 'white'} />}>
                            Retry
                        </GradientButton>
                    </View>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-6 pt-6"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? 'white' : '#121212'} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Current Plan Overview */}
                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Your Subscription</Text>
                    <View className="bg-slate-50 dark:bg-slate-900 rounded-[28px] p-6 border-2 border-slate-200 dark:border-slate-800 mb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="size-14 rounded-full bg-indigo-600 items-center justify-center">
                                <Ionicons name="sparkles" size={24} color="white" />
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/upgrade')}
                                className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                            >
                                <Text className="text-slate-900 dark:text-white font-black text-[12px] uppercase">Manage Plans</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter mb-1">
                            {user?.is_unlimited ? 'Unlimited Pro' : 'Free Tier'}
                        </Text>
                        <Text className="text-slate-500 font-bold text-[14px]">
                            {user?.is_unlimited ? 'Fully unlocked experience' : `${user?.credits ?? 0} Credits remaining`}
                        </Text>
                    </View>

                    <Text className="text-[12px] uppercase tracking-widest font-black text-slate-400 mb-4">Past Invoices</Text>

                    {data?.data?.length === 0 ? (
                        <View className="items-center py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50 dark:bg-slate-900/50 mt-4">
                            <View className="size-24 bg-white dark:bg-slate-800 rounded-[24px] border-2 border-slate-200 dark:border-slate-700 items-center justify-center mb-6">
                                <Ionicons name="receipt" size={40} color={isDark ? 'white' : '#121212'} />
                            </View>
                            <Text className="text-slate-900 dark:text-white font-black text-[22px] tracking-tight mb-2">No Invoices Yet</Text>
                            <Text className="text-slate-500 font-bold text-[14px] text-center px-8 leading-relaxed">
                                Your billing history will appear here once you make a payment.
                            </Text>
                        </View>
                    ) : (
                        data?.data?.map((invoice: Invoice) => (
                            <View key={invoice.id} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 mb-4 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{invoice.invoice_number}</Text>
                                    <Text className="text-[20px] font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                                        {invoice.currency} {Number(invoice.amount).toFixed(2)}
                                    </Text>
                                    <Text className="text-slate-500 font-bold text-[12px] uppercase tracking-widest">
                                        {new Date(invoice.invoice_date).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View className="items-end">
                                    <View className={`px-4 py-1.5 rounded-xl border-2 ${invoice.status === 'paid' ? 'border-[#2EBD85] bg-[#2EBD85]/10' :
                                        invoice.status === 'pending' ? 'border-[#FCD34D] bg-[#FCD34D]/10' :
                                            'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                                        }`}>
                                        <Text className={`text-[11px] uppercase tracking-widest font-black ${invoice.status === 'paid' ? 'text-[#2EBD85]' :
                                            invoice.status === 'pending' ? 'text-[#eab308]' :
                                                'text-slate-500'
                                            }`}>
                                            {invoice.status}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleDownload(invoice.id)}
                                        className="mt-4 flex-row items-center border-b-2 border-slate-900 dark:border-white pb-0.5"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-slate-900 dark:text-white font-black text-[12px] uppercase tracking-widest mr-1">Receipt</Text>
                                        <Ionicons name="download" size={14} color={isDark ? 'white' : '#121212'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-10" />
                </ScrollView>
            )}
        </View>
    );
}
