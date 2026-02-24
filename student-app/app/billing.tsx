import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';

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
        <View className="bg-white p-6 rounded-3xl border border-slate-100 mb-4 shadow-sm shadow-slate-200">
            <View className="bg-slate-100 h-3 w-24 rounded-full mb-3" />
            <View className="bg-slate-100 h-5 w-32 rounded-full mb-3" />
            <View className="bg-slate-100 h-3 w-20 rounded-full" />
        </View>
    );
}

export default function BillingHistoryScreen() {
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
            const baseUrl = api.defaults.baseURL;
            const url = `${baseUrl}/billing/invoices/${invoiceId}/download`;
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Download Error', 'Unable to open the download link on this device.');
            }
        } catch {
            Alert.alert('Download Error', 'Failed to download invoice. Please try again.');
        }
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <Stack.Screen
                options={{
                    title: 'Billing History',
                    headerShown: true,
                    headerBackTitle: 'Back',
                    headerStyle: { backgroundColor: '#010100' },
                    headerTintColor: '#fff',
                }}
            />

            {isLoading ? (
                <View className="flex-1 px-6 pt-6">
                    <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Past Invoices</Text>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center p-6">
                    <View className="size-16 bg-red-50 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="cloud-offline-outline" size={32} color="#ef4444" />
                    </View>
                    <Text className="text-red-500 font-bold mb-2 text-lg">Connection Error</Text>
                    <Text className="text-slate-500 text-center mb-6">
                        Could not load billing history. Check your connection and try again.
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        className="bg-slate-900 px-6 py-3 rounded-xl flex-row items-center"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="refresh" size={16} color="white" />
                        <Text className="text-white font-bold ml-2">Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-6 pt-6"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
                >
                    <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Past Invoices</Text>

                    {data?.data?.length === 0 ? (
                        <View className="items-center py-14">
                            <View className="size-16 bg-slate-200 rounded-2xl items-center justify-center mb-4">
                                <Ionicons name="receipt" size={32} color="#94a3b8" />
                            </View>
                            <Text className="text-slate-700 font-bold text-lg">No Invoices Yet</Text>
                            <Text className="text-slate-500 text-center mt-2 px-6">
                                Your billing history will appear here once you make a payment.
                            </Text>
                        </View>
                    ) : (
                        data?.data?.map((invoice: Invoice) => (
                            <View key={invoice.id} className="bg-white p-6 rounded-3xl border border-slate-100 mb-4 flex-row items-center justify-between shadow-sm shadow-slate-200">
                                <View>
                                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{invoice.invoice_number}</Text>
                                    <Text className="text-lg font-black text-slate-900 mb-2">
                                        {invoice.currency} {Number(invoice.amount).toFixed(2)}
                                    </Text>
                                    <Text className="text-slate-500 font-medium text-sm">
                                        {new Date(invoice.invoice_date).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View className="items-end">
                                    <View className={`px-3 py-1 rounded-full border ${invoice.status === 'paid' ? 'bg-emerald-50 border-emerald-100' :
                                        invoice.status === 'pending' ? 'bg-amber-50 border-amber-100' :
                                            'bg-slate-50 border-slate-200'
                                        }`}>
                                        <Text className={`text-[10px] uppercase tracking-widest font-black ${invoice.status === 'paid' ? 'text-emerald-700' :
                                            invoice.status === 'pending' ? 'text-amber-700' :
                                                'text-slate-500'
                                            }`}>
                                            {invoice.status}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleDownload(invoice.id)}
                                        className="mt-4 flex-row items-center"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-indigo-600 font-bold text-xs mr-1">Download</Text>
                                        <Ionicons name="download" size={14} color="#4f46e5" />
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
