import { Text } from '@/components/ui/Text';
import { View, ScrollView, TouchableOpacity, RefreshControl, Alert, useColorScheme, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Stack, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import * as FileSystem from 'expo-file-system/legacy';
import { DangerTriangle, DocumentText, Download, Refresh, RoundArrowUp } from '@solar-icons/react-native/Bold';

import RevenueCatUI from 'react-native-purchases-ui';
import * as Sharing from 'expo-sharing';


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
        <View style={[s.skeletonCard, isDark ? s.bgDarkCard : s.bgWhiteCard]}>
            <View>
                <View style={[s.skeletonLineSmall, isDark ? s.bgSlate800 : s.bgSlate100, { marginBottom: 16 }]} />
                <View style={[s.skeletonLineMedium, isDark ? s.bgSlate800 : s.bgSlate100, { marginBottom: 16 }]} />
                <View style={[s.skeletonLineTiny, isDark ? s.bgSlate800 : s.bgSlate100]} />
            </View>
            <View style={s.itemsEnd}>
                <View style={[s.skeletonBoxSmall, isDark ? s.bgSlate800 : s.bgSlate100, { marginBottom: 20 }]} />
                <View style={[s.skeletonLineTiny, isDark ? s.bgSlate800 : s.bgSlate100, { width: 48 }]} />
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
        <View>
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
                <View style={s.loadingContainer}>
                    <Text style={s.loadingLabel}>Loading History</Text>
                    <SkeletonCard isDark={isDark} />
                    <SkeletonCard isDark={isDark} />
                </View>
            ) : error ? (
                <View style={s.errorContainer}>
                    <View style={[s.errorIconBox, isDark ? s.bgDarkCard : s.bgWhiteCard]}>
                        <DangerTriangle size={40} color="#ef4444" />
                    </View>
                    <Text style={[s.errorTitle, isDark ? s.textWhite : s.textSlate900]}>Unable to load</Text>
                    <Text style={s.errorSubtitle}>
                        We couldn't retrieve your billing history. Please check your connection.
                    </Text>
                    <TouchableOpacity 
                        onPress={() => refetch()}
                        style={s.retryBtn}
                    >
                        <Refresh size={18} color="white" />
                        <Text style={s.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={s.flex1}
                    contentContainerStyle={s.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? 'white' : '#121212'} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* FileText Header */}
                    <View style={s.pageHeader}>
                        <Text style={[s.pageTitle, isDark ? s.textWhite : s.textSlate900]}>Billing</Text>
                        <Text style={s.pageSubtitle}>
                            Manage your subscription and view past receipts.
                        </Text>
                    </View>

                    {/* Current Plan Overview */}
                    <Text style={s.sectionLabel}>Subscription Status</Text>
                    <View style={[s.planCard, isDark ? s.bgDarkCard : s.bgWhiteCard]}>
                        <View style={s.planHeaderRow}>
                            <View style={[s.planIconBox, user?.is_unlimited ? s.bgBrandSoft : (isDark ? s.bgSlate800 : s.bgSlate100)]}>
                                <RoundArrowUp size={18} color={user?.plan_name !== 'free' ? "#8B5CF6" : "#94a3b8"} />

                            </View>
                            <TouchableOpacity
                                onPress={async () => {
                                    try {
                                        router.push('/paywall');
                                    } catch (e) {}
                                }}
                                style={[s.planBadge, isDark ? s.bgWhite : s.bgSlate950]}
                            >
                                <Text style={[s.planBadgeText, isDark ? s.textSlate900 : s.textWhite]}>Plans</Text>
                            </TouchableOpacity>

                        </View>
                        <Text style={[s.planTitle, isDark ? s.textWhite : s.textSlate900]}>
                            {user?.plan_name === 'elite' ? 'Skeeme Max' : (user?.plan_name === 'standard' ? 'Skeeme Pro' : 'Skeeme Free')}
                        </Text>
                        <Text style={s.planSubtitle}>
                            {`${user?.credits ?? 0} Credits remaining`}
                        </Text>

                    </View>

                    <Text style={s.sectionLabel}>Payment History</Text>

                    {data?.data?.length === 0 ? (
                        <View style={[s.emptyContainer, isDark ? s.bgDarkCardSoft : s.bgWhite, !isDark && s.borderSlate100]}>
                            <View style={[s.emptyIconBox, isDark ? s.bgSlate800 : s.bgSlate50]}>
                                <DocumentText size={32} color={isDark ? '#cbd5e1' : '#64748b'} />
                            </View>
                            <Text style={[s.emptyTitle, isDark ? s.textWhite : s.textSlate900]}>No Invoices</Text>
                            <Text style={s.emptySubtitle}>
                                Once you start a subscription, your receipts will appear here.
                            </Text>
                        </View>
                    ) : (
                        data?.data?.map((invoice: Invoice) => (
                            <View key={invoice.id} style={[s.invoiceCard, isDark ? s.bgDarkCard : s.bgWhiteCard]}>
                                <View style={s.flex1}>
                                    <View style={s.invoiceTopRow}>
                                        <Text style={[s.invoiceAmount, isDark ? s.textWhite : s.textSlate900]}>
                                            {invoice.currency} {Number(invoice.amount).toLocaleString()}
                                        </Text>
                                        <View style={[s.statusBadge, invoice.status === 'paid' ? s.statusPaid : s.statusOther]}>
                                            <Text style={[s.statusText, invoice.status === 'paid' ? s.statusTextPaid : s.statusTextOther]}>
                                                {invoice.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={s.invoiceDate}>
                                        {new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                    <Text style={s.invoiceNumber}>#{invoice.invoice_number}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleDownload(invoice.id)}
                                    activeOpacity={0.7}
                                    style={[s.downloadBtn, isDark ? s.bgDarkCardSoft : s.bgSlate50, !isDark && s.borderSlate200]}
                                >
                                    <Download size={18} color={isDark ? 'white' : '#121212'} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    loadingContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
    loadingLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', color: '#94a3b8', marginBottom: 24, marginLeft: 4 },
    
    skeletonCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
    skeletonLineSmall: { height: 12, width: 96, borderRadius: 99 },
    skeletonLineMedium: { height: 24, width: 128, borderRadius: 99 },
    skeletonLineTiny: { height: 12, width: 80, borderRadius: 99 },
    skeletonBoxSmall: { height: 32, width: 80, borderRadius: 8 },
    
    bgDarkCard: { backgroundColor: '#13151B', borderColor: 'transparent' },
    bgDarkCardSoft: { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'transparent' },
    bgWhiteCard: { backgroundColor: 'white', borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    bgWhite: { backgroundColor: 'white' },
    bgSlate800: { backgroundColor: '#1e293b' },
    bgSlate100: { backgroundColor: '#f1f5f9' },
    bgSlate50: { backgroundColor: '#f8fafc' },
    bgSlate950: { backgroundColor: '#020617' },
    bgBrandSoft: { backgroundColor: 'rgba(139, 92, 246, 0.2)' },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    errorIconBox: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1 },
    errorTitle: { fontWeight: '700', marginBottom: 12, fontSize: 20, letterSpacing: -0.5 },
    errorSubtitle: { color: '#64748b', textAlign: 'center', marginBottom: 32, fontWeight: '500', fontSize: 14, lineHeight: 22 },
    retryBtn: { height: 52, width: '100%', maxWidth: 240, borderRadius: 20, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    retryBtnText: { color: 'white', fontWeight: '700', fontSize: 15, marginLeft: 8 },
    
    scrollContent: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 24 },
    pageHeader: { marginBottom: 32, marginTop: 8, paddingHorizontal: 8 },
    pageTitle: { fontSize: 36, fontWeight: '700', letterSpacing: -1, marginBottom: 8 },
    pageSubtitle: { color: '#64748b', fontWeight: '500', fontSize: 15 },
    
    sectionLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', color: '#94a3b8', marginBottom: 20, marginLeft: 4 },
    
    planCard: { borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 40 },
    planHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    planIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    planBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
    planBadgeText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 },
    planTitle: { fontWeight: '700', fontSize: 22, letterSpacing: -0.5, marginBottom: 4 },
    planSubtitle: { color: '#64748b', fontWeight: '700', fontSize: 13 },
    
    emptyContainer: { alignItems: 'center', paddingVertical: 80, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed' },
    emptyIconBox: { width: 64, height: 64, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontWeight: '700', fontSize: 18, letterSpacing: -0.5, marginBottom: 8 },
    emptySubtitle: { color: '#64748b', fontWeight: '500', fontSize: 13, textAlign: 'center', paddingHorizontal: 48, lineHeight: 20 },
    
    invoiceCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    invoiceTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    invoiceAmount: { fontWeight: '700', fontSize: 16, letterSpacing: -0.5, marginRight: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
    statusPaid: { borderColor: 'rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    statusOther: { borderColor: '#1e293b', backgroundColor: 'rgba(30, 41, 59, 0.2)' },
    statusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
    statusTextPaid: { color: '#10b981' },
    statusTextOther: { color: '#64748b' },
    invoiceDate: { color: '#64748b', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
    invoiceNumber: { fontSize: 10, fontWeight: '700', color: 'rgba(148, 163, 184, 0.6)', textTransform: 'uppercase', letterSpacing: 1.5 },
    
    downloadBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    borderSlate100: { borderColor: '#f1f5f9' },
    borderSlate200: { borderColor: '#e2e8f0' },
    itemsEnd: { alignItems: 'flex-end' },
});
