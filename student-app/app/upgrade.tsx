import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, useColorScheme, Alert, ActivityIndicator, StyleSheet, Modal, SafeAreaView, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { api } from '@/lib/api';
import { WebView } from 'react-native-webview';
import { PlanType, CurrencyType } from '@/types';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type BillingCycle = 'monthly' | 'yearly';

export default function UpgradeScreen() {
    const { user, pricingConfig, fetchPricingConfig } = useAuthStore();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const SOLID_BG = isDark ? '#0F172A' : '#FFFFFF';
    const insets = useSafeAreaInsets();

    const [activePlan, setActivePlan] = useState<Exclude<PlanType, 'free'>>('standard');
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchasingPack, setPurchasingPack] = useState<number | null>(null);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [paymentRef, setPaymentRef] = useState<string | null>(null);
    const [paymentType, setPaymentType] = useState<'subscription' | 'credits' | null>(null);

    useEffect(() => {
        fetchPricingConfig();
    }, []);

    const currencySymbol = user?.pricing?.currency || '$';
    const currency: CurrencyType = user?.pricing?.currency === '₦' ? 'ngn' : 'usd';

    if (!pricingConfig) {
        return (
            <View style={[s.loadingContainer, { backgroundColor: C.background }]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const PLANS = [
        {
            id: 'standard',
            name: 'Standard',
            tag: 'Popular',
            priceMonthly: pricingConfig[currency]?.standard?.monthly,
            priceYearly: pricingConfig[currency]?.standard?.yearly,
            credits: pricingConfig[currency]?.standard?.credits,
            hasTrial: false,
        },
        {
            id: 'elite',
            name: 'Elite',
            tag: '3-Day Free Trial',
            priceMonthly: pricingConfig[currency]?.elite?.monthly,
            priceYearly: pricingConfig[currency]?.elite?.yearly,
            credits: pricingConfig[currency]?.elite?.credits,
            hasTrial: true,
        }
    ];

    const currentPricing = pricingConfig[currency]?.[activePlan] || {};
    const displayPrice = billingCycle === 'monthly' ? currentPricing.monthly : currentPricing.yearly;
    const isTrialEligible = activePlan === 'elite' && billingCycle === 'monthly';

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            const res = await api.post('subscriptions/checkout', {
                plan: activePlan,
                cycle: billingCycle,
                is_trial: isTrialEligible,
            });
            if (res.data?.authorization_url && res.data?.reference) {
                setPaymentRef(res.data.reference);
                setPaymentType('subscription');
                setCheckoutUrl(res.data.authorization_url);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Checkout Failed";
            Alert.alert("Error", msg);
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleCreditPurchase = async (pack: any) => {
        setPurchasingPack(pack.amount);
        try {
            const res = await api.post('credits/checkout', { amount: pack.amount });
            if (res.data?.authorization_url && res.data?.reference) {
                setPaymentRef(res.data.reference);
                setPaymentType('credits');
                setCheckoutUrl(res.data.authorization_url);
            }
        } catch (error: any) {
            Alert.alert("Error", "Could not initialize credit purchase");
        } finally {
            setPurchasingPack(null);
        }
    };

    const verifyPayment = async (reference: string, type: 'subscription' | 'credits') => {
        setIsPurchasing(true);
        try {
            const endpoint = type === 'subscription' ? `subscriptions/verify/${reference}` : `credits/verify/${reference}`;
            const res = await api.get(endpoint);
            if (res.data?.status === 'success') {
                await useAuthStore.getState().checkAuth();
                Alert.alert("Success", "Welcome to Skeeme!");
                router.replace('/(drawer)');
            }
        } catch (error) {
            Alert.alert("Payment Check", "We are still waiting for confirmation from Paystack.");
        } finally {
            setIsPurchasing(false);
            setPaymentRef(null);
            setPaymentType(null);
        }
    };

    const COMPARISON = [
        { label: 'AI Model Speed', free: 'Standard', plus: activePlan === 'elite' ? 'Ultra-Fast' : 'Fast' },
        { label: 'Monthly Credits', free: '500', plus: (currentPricing.credits || 0).toLocaleString() },
        { label: 'Weekly Refill', free: '150', plus: (currentPricing.weekly || 0).toLocaleString() },
        { label: 'Scan & Solve', free: 'Limited', plus: 'Priority' },
        { label: 'Study Streak Freeze', free: 'No', plus: activePlan === 'elite' ? 'Yes (Unlimited)' : 'Yes (2/mo)' },
    ];

    return (
        <View style={[s.container, { backgroundColor: SOLID_BG }]}>
            <StatusBar style="light" />
            
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Premium Header */}
                <LinearGradient colors={['#007AFF', '#0A84FF']} style={[s.premiumHeader, { paddingTop: insets.top + 20 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
                        <IconSymbol name="xmark" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={s.plusBadge}>
                        <Text style={s.plusBadgeText}>Upgrade</Text>
                    </View>
                    <Text style={s.headerTitle}>Get the most out of Skeeme</Text>
                    <Text style={s.headerSubtitle}>Supercharge your learning with AI-powered study tools</Text>
                    
                    {/* Floating icons for high-fidelity look */}
                    <View style={s.sparklesLeft}><IconSymbol name="sparkles" size={20} color="rgba(255,255,255,0.4)" /></View>
                    <View style={s.sparklesRight}><IconSymbol name="star.fill" size={24} color="rgba(255,255,255,0.4)" /></View>
                </LinearGradient>

                <View style={s.content}>
                    {/* Billing Toggle */}
                    <View style={[s.billingToggle, { backgroundColor: C.cardSecondary }]}>
                        <TouchableOpacity 
                            onPress={() => setBillingCycle('monthly')}
                            style={[s.toggleBtn, billingCycle === 'monthly' && s.toggleBtnActive]}
                        >
                            <Text style={[s.toggleText, { color: billingCycle === 'monthly' ? '#FFF' : C.textSecondary }]}>Monthly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setBillingCycle('yearly')}
                            style={[s.toggleBtn, billingCycle === 'yearly' && { backgroundColor: '#007AFF' }]}
                        >
                            <View style={s.row}>
                                <Text style={[s.toggleText, { color: billingCycle === 'yearly' ? '#FFF' : C.textSecondary }]}>Yearly</Text>
                                <View style={s.saveTag}>
                                    <Text style={s.saveTagText}>-40%</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Plan Cards */}
                    <View style={s.plansContainer}>
                        {PLANS.map((plan) => {
                            const isSelected = activePlan === plan.id;
                            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                            return (
                                <TouchableOpacity 
                                    key={plan.id}
                                    activeOpacity={0.9}
                                    onPress={() => setActivePlan(plan.id as any)}
                                    style={[s.planCard, { backgroundColor: C.card, borderColor: isSelected ? '#007AFF' : C.separator }]}
                                >
                                    {plan.tag && (
                                        <View style={[s.planTag, { backgroundColor: isSelected ? '#007AFF' : '#8E8E93' }]}>
                                            <Text style={s.planTagText}>{plan.tag}</Text>
                                        </View>
                                    )}
                                    <Text style={[s.planName, { color: C.text }]}>Skeeme {plan.name}</Text>
                                    <Text style={[s.planPrice, { color: C.text }]}>
                                        {currencySymbol}{price?.toLocaleString()}
                                        <Text style={[s.planPeriod, { color: C.textTertiary }]}>{billingCycle === 'monthly' ? '/mo' : '/yr'}</Text>
                                    </Text>
                                    <View style={s.planCreditsRow}>
                                        <IconSymbol name="diamond.fill" size={14} color="#007AFF" />
                                        <Text style={s.planCreditsText}>{plan.credits?.toLocaleString()} Credits Monthly</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Comparison Table */}
                    <Text style={[s.sectionTitle, { color: C.text }]}>Benefits Comparison</Text>
                    <View style={[s.table, { backgroundColor: C.card, borderColor: C.separator }]}>
                        <View style={s.tableHeader}>
                            <View style={s.tableCol} />
                            <View style={s.tableCol}><Text style={s.tableHeaderText}>Free</Text></View>
                            <View style={s.tableCol}><Text style={[s.tableHeaderText, { color: '#007AFF' }]}>{activePlan.toUpperCase()}</Text></View>
                        </View>
                        {COMPARISON.map((row, i) => (
                            <View key={i} style={[s.tableRow, { borderTopColor: C.separator }]}>
                                <View style={s.tableColMain}><Text style={[s.rowLabel, { color: C.textSecondary }]}>{row.label}</Text></View>
                                <View style={s.tableCol}><Text style={[s.rowValue, { color: C.textTertiary }]}>{row.free}</Text></View>
                                <View style={s.tableCol}><Text style={[s.rowValue, { color: C.text, fontWeight: '700' }]}>{row.plus}</Text></View>
                            </View>
                        ))}
                    </View>

                    {/* Credit Packs */}
                    <Text style={[s.sectionTitle, { color: C.text }]}>Need More Credits?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.packsContent}>
                        {(pricingConfig.credit_packs?.[currency] || []).map((pack: any) => (
                            <TouchableOpacity
                                key={pack.amount}
                                onPress={() => handleCreditPurchase(pack)}
                                style={[s.packCard, { backgroundColor: C.card, borderColor: C.separator }]}
                            >
                                <IconSymbol name="bolt.fill" size={20} color="#FFD60A" />
                                <Text style={[s.packAmount, { color: C.text }]}>{pack.amount.toLocaleString()}</Text>
                                <Text style={[s.packPrice, { color: C.textSecondary }]}>{currencySymbol}{pack.price.toLocaleString()}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View style={[s.footer, { paddingBottom: insets.bottom + 20, borderTopColor: C.separator, backgroundColor: SOLID_BG }]}>
                <TouchableOpacity 
                    onPress={handlePurchase}
                    disabled={isPurchasing}
                    style={s.mainCTA}
                >
                    <LinearGradient colors={['#007AFF', '#0A84FF']} style={s.ctaGradient}>
                        {isPurchasing ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={s.ctaText}>
                                {isTrialEligible ? 'Start 3-Day Free Trial' : `Get Skeeme ${activePlan.charAt(0).toUpperCase() + activePlan.slice(1)}`}
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
                <Text style={s.termsText}>
                    {isTrialEligible ? 'A verification fee of 100 NGN will be applied. ' : ''}
                    Billed recurringly. Cancel anytime in account settings.
                </Text>
            </View>

            {/* Payment Modal */}
            {checkoutUrl && (
                <Modal visible={true} animationType="slide">
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
                        <View style={s.modalHeader}>
                            <TouchableOpacity onPress={() => setCheckoutUrl(null)}><Text style={s.doneBtn}>Cancel</Text></TouchableOpacity>
                        </View>
                        <WebView 
                            source={{ uri: checkoutUrl }} 
                            onNavigationStateChange={(nav) => {
                                if (nav.url.includes('/verify') || nav.url.includes('callback') || nav.url.includes('trxref')) {
                                    setCheckoutUrl(null);
                                    if (paymentRef && paymentType) verifyPayment(paymentRef, paymentType);
                                }
                            }}
                        />
                    </SafeAreaView>
                </Modal>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    premiumHeader: { height: 260, alignItems: 'center', position: 'relative' },
    closeBtn: { position: 'absolute', left: 20, top: 60, zIndex: 10 },
    plusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
    plusBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
    headerTitle: { fontSize: 36, fontWeight: '900', color: '#FFF', marginBottom: 8, textAlign: 'center', paddingHorizontal: 20 },
    headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
    sparklesLeft: { position: 'absolute', left: 40, bottom: 60 },
    sparklesRight: { position: 'absolute', right: 40, top: 80 },

    content: { paddingBottom: 160 },
    billingToggle: { flexDirection: 'row', padding: 4, borderRadius: 25, marginHorizontal: 20, marginTop: -25, height: 50, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    toggleBtn: { flex: 1, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    toggleBtnActive: { backgroundColor: '#007AFF' },
    toggleText: { fontWeight: '700', fontSize: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    saveTag: { backgroundColor: '#FFD60A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    saveTagText: { color: '#000', fontSize: 10, fontWeight: '800' },

    plansContainer: { paddingHorizontal: 16, marginTop: 32, gap: 16 },
    planCard: { borderRadius: 20, padding: 20, borderWidth: 2, position: 'relative' },
    planTag: { position: 'absolute', top: -12, right: 20, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    planTagText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    planName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    planPrice: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
    planPeriod: { fontSize: 16, fontWeight: '500' },
    planCreditsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    planCreditsText: { fontSize: 14, color: '#007AFF', fontWeight: '700' },

    sectionTitle: { fontSize: 18, fontWeight: '800', marginHorizontal: 16, marginTop: 32, marginBottom: 16 },
    table: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', padding: 16, backgroundColor: 'rgba(0,0,0,0.02)' },
    tableCol: { flex: 1, alignItems: 'center' },
    tableColMain: { flex: 1.5 },
    tableHeaderText: { fontSize: 13, fontWeight: '800', color: '#8E8E93' },
    tableRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1 },
    rowLabel: { fontSize: 13, fontWeight: '600' },
    rowValue: { fontSize: 13, textAlign: 'center' },

    packsContent: { paddingHorizontal: 16, gap: 12, paddingBottom: 40 },
    packCard: { width: 110, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
    packAmount: { fontSize: 20, fontWeight: '900', marginTop: 8 },
    packPrice: { fontSize: 13, fontWeight: '600' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, borderTopWidth: 1, paddingTop: 16 },
    mainCTA: { height: 60, borderRadius: 30, overflow: 'hidden' },
    ctaGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    ctaText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    termsText: { textAlign: 'center', color: '#8E8E93', fontSize: 12, marginTop: 12 },

    modalHeader: { padding: 16, alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    doneBtn: { color: '#007AFF', fontSize: 16, fontWeight: '700' }
});

