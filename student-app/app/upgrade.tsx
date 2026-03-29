import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, useColorScheme, Alert, ActivityIndicator, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { api } from '@/lib/api';
import { WebView } from 'react-native-webview';
import { PlanType, CurrencyType } from '@/types';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BillingCycle = 'monthly' | 'yearly';

export default function UpgradeScreen() {
    const { user, pricingConfig, fetchPricingConfig } = useAuthStore();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
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
            badge: null,
            features: [
                '5,000 Weekly Credits',
                'Advanced Quiz Generation',
                'Detailed Flashcard creation',
                'Priority AI model access'
            ],
            config: pricingConfig[currency]?.standard || {}
        },
        {
            id: 'elite',
            name: 'Elite',
            badge: 'Most Popular',
            features: [
                '10,000+ Weekly Credits',
                'Unlimited Scan & Solve',
                'Unlimited Flashcard creation',
                'Ultra-fast Elite AI model'
            ],
            config: pricingConfig[currency]?.elite || {}
        }
    ];

    const isPromoActive = (plan: string) => {
        const promoEnd = pricingConfig.promos?.[`${plan}_end`];
        if (!promoEnd) return false;
        return new Date() < new Date(promoEnd);
    };

    const activePricing = pricingConfig[currency]?.[activePlan] || {};
    const isPromo = isPromoActive(activePlan) && billingCycle === 'monthly';
    const displayPrice = isPromo ? activePricing.promoMonthly : activePricing[billingCycle];
    const selectedPriceStr = `${currencySymbol}${displayPrice?.toLocaleString()}`;

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            const res = await api.post('subscriptions/checkout', {
                plan: activePlan,
                cycle: billingCycle,
            });
            if (res.data?.authorization_url && res.data?.reference) {
                setPaymentRef(res.data.reference);
                setPaymentType('subscription');
                setCheckoutUrl(res.data.authorization_url);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Could not initialize checkout. Please try again.";
            Alert.alert("Checkout Failed", msg);
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleCreditPurchase = async (pack: any) => {
        setPurchasingPack(pack.amount);
        try {
            const res = await api.post('credits/checkout', {
                amount: pack.amount,
            });
            if (res.data?.authorization_url && res.data?.reference) {
                setPaymentRef(res.data.reference);
                setPaymentType('credits');
                setCheckoutUrl(res.data.authorization_url);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Could not initialize checkout. Please try again.";
            Alert.alert("Checkout Failed", msg);
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
                Alert.alert("Success", type === 'subscription' ? "Welcome to the premium club! Your subscription is active." : "Credits added successfully!");
                router.replace('/(drawer)');
            } else {
                Alert.alert("Payment Pending", res.data?.message || "Payment is still processing. Please check your balance shortly.");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Could not verify your payment.";
            Alert.alert("Verification Check", msg);
        } finally {
            setIsPurchasing(false);
            setPaymentRef(null);
            setPaymentType(null);
        }
    };

    const handleWebViewNavigation = (navState: any) => {
        const url = navState.url;
        if (url.includes('reference=') || url.includes('/callback') || url.includes('skeeme.com/callback') || url.includes('trxref=')) {
            setCheckoutUrl(null);
            if (paymentRef && paymentType) verifyPayment(paymentRef, paymentType);
        }
    };

    return (
        <View style={[s.container, { backgroundColor: C.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            
            {/* Header */}
            <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="close" size={24} color={C.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                
                {/* Title */}
                <Text style={[s.title, { color: C.text }]}>Upgrade Skeeme</Text>
                <Text style={[s.subtitle, { color: C.textSecondary }]}>
                    Unlock unlimited features, priority AI models, and advance your studying to the next level.
                </Text>

                {/* Billing Cycle Toggle */}
                <View style={[s.billingToggle, { backgroundColor: C.secondaryBackground }]}>
                    <TouchableOpacity 
                        onPress={() => setBillingCycle('monthly')}
                        style={[s.toggleBtn, billingCycle === 'monthly' && { backgroundColor: C.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                    >
                        <Text style={[s.toggleText, { color: billingCycle === 'monthly' ? C.text : C.textSecondary }]}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setBillingCycle('yearly')}
                        style={[s.toggleBtn, billingCycle === 'yearly' && { backgroundColor: C.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                    >
                        <View style={s.row}>
                            <Text style={[s.toggleText, { color: billingCycle === 'yearly' ? C.text : C.textSecondary }]}>Yearly</Text>
                            <View style={s.saveBadge}>
                                <Text style={s.saveBadgeText}>SAVE</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Side-by-Side Plans */}
                <View style={s.plansRow}>
                    {PLANS.map((plan) => {
                        const isSelected = activePlan === plan.id;
                        return (
                            <TouchableOpacity
                                key={plan.id}
                                onPress={() => setActivePlan(plan.id as Exclude<PlanType, 'free'>)}
                                activeOpacity={0.9}
                                style={[
                                    s.planCard,
                                    { backgroundColor: C.card },
                                    isSelected && { borderColor: '#007AFF', borderWidth: 2 }
                                ]}
                            >
                                {plan.badge && (
                                    <View style={s.popularBadge}>
                                        <Text style={s.popularBadgeText}>{plan.badge}</Text>
                                    </View>
                                )}
                                <Text style={[s.planName, { color: C.text }]}>{plan.name}</Text>
                                <View style={s.priceContainer}>
                                    {isPromoActive(plan.id) && billingCycle === 'monthly' && (
                                        <Text style={[s.originalPrice, { color: C.textTertiary }]}>
                                            {currencySymbol}{plan.config.monthly?.toLocaleString()}
                                        </Text>
                                    )}
                                    <Text style={[s.planPrice, { color: C.text }]}>
                                        {currencySymbol}{(isPromoActive(plan.id) && billingCycle === 'monthly' ? plan.config.promoMonthly : plan.config[billingCycle])?.toLocaleString()}
                                        <Text style={[s.planPeriod, { color: C.textSecondary }]}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</Text>
                                    </Text>
                                </View>
                                <Text style={[s.planCredits, { color: '#007AFF' }]}>
                                    {plan.config.credits?.toLocaleString()} Credits/mo
                                </Text>

                                <View style={s.planFeaturesWrapper}>
                                    {plan.features.map((ft, idx) => (
                                        <Text key={idx} style={[s.planFeatureText, { color: C.textSecondary }]}>• {ft}</Text>
                                    ))}
                                </View>

                                <View style={[s.checkmarkBox, isSelected ? { backgroundColor: '#007AFF', borderColor: '#007AFF' } : { borderColor: C.separator }]}>
                                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Credit Packs */}
                <Text style={[s.sectionTitle, { color: C.text }]}>Need More Credits?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.packsScroll} contentContainerStyle={s.packsScrollContent}>
                    {(pricingConfig.credit_packs?.[currency] || []).map((pack: any) => (
                        <TouchableOpacity
                            key={pack.amount}
                            onPress={() => handleCreditPurchase(pack)}
                            activeOpacity={0.8}
                            disabled={purchasingPack !== null || isPurchasing}
                            style={[s.packCard, { backgroundColor: C.card, borderColor: C.separator }, purchasingPack === pack.amount && s.opacity50]}
                        >
                            {purchasingPack === pack.amount ? (
                                <ActivityIndicator size="small" color="#007AFF" style={s.packLoading} />
                            ) : (
                                <View style={s.packIconCircle}>
                                    <Ionicons name="diamond" size={18} color="#007AFF" />
                                </View>
                            )}
                            <Text style={[s.packAmount, { color: C.text }]}>{pack.amount.toLocaleString()}</Text>
                            <Text style={[s.packCreditsLabel, { color: C.textSecondary }]}>Credits</Text>
                            <Text style={[s.packPrice, { color: C.text }]}>
                                {currencySymbol}{pack.price.toLocaleString(undefined, { minimumFractionDigits: currency === 'usd' ? 2 : 0 })}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </ScrollView>

            {/* Footer */}
            <View style={[s.footer, { backgroundColor: C.background, paddingBottom: insets.bottom + Spacing.lg, borderTopColor: C.separator }]}>
                <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={isPurchasing || purchasingPack !== null}
                    activeOpacity={0.8}
                    style={[s.subscribeBtn, (isPurchasing || purchasingPack !== null) && s.opacity70]}
                >
                    {isPurchasing && paymentType === 'subscription' ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={s.subscribeBtnText}>Subscribe for {selectedPriceStr}/{billingCycle === 'monthly' ? 'mo' : 'yr'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => Alert.alert("Not Implemented", "Restore purchases would be linked to native IAP receipts.")}
                    style={s.restoreBtn}
                >
                    <Text style={[s.restoreText, { color: C.textTertiary }]}>Restore Purchases</Text>
                </TouchableOpacity>
            </View>

            {/* Paystack Checkout Modal */}
            {checkoutUrl && (
                <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
                    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
                            <TouchableOpacity onPress={() => {
                                setCheckoutUrl(null);
                                if (paymentRef && paymentType) verifyPayment(paymentRef, paymentType);
                            }}>
                                <Text style={{ fontWeight: '600', color: '#007AFF', fontSize: 16 }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <WebView source={{ uri: checkoutUrl }} onNavigationStateChange={handleWebViewNavigation} startInLoadingState={true} style={{ flex: 1 }} />
                    </SafeAreaView>
                </Modal>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { paddingHorizontal: 16, paddingBottom: 8 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    
    scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
    title: { fontSize: 32, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, lineHeight: 22, marginBottom: 24 },

    billingToggle: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: 32 },
    toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    toggleText: { fontSize: 14, fontWeight: '600' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    saveBadge: { backgroundColor: '#34C759', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    saveBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

    plansRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
    planCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'transparent', position: 'relative' },
    popularBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    popularBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    
    planName: { fontSize: 18, fontWeight: '700', marginBottom: 8, marginTop: 4 },
    priceContainer: { marginBottom: 4 },
    originalPrice: { fontSize: 14, textDecorationLine: 'line-through', marginBottom: -4 },
    planPrice: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    planPeriod: { fontSize: 14, fontWeight: '500' },
    planCredits: { fontSize: 14, fontWeight: '700', marginBottom: 16 },
    
    planFeaturesWrapper: { gap: 6, marginBottom: 32 },
    planFeatureText: { fontSize: 12, lineHeight: 16 },
    
    checkmarkBox: { position: 'absolute', bottom: 16, right: 16, width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    packsScroll: { marginHorizontal: -16 },
    packsScrollContent: { paddingHorizontal: 16, gap: 12 },
    packCard: { width: 140, padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
    packLoading: { height: 32, marginBottom: 12 },
    packIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 122, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    packAmount: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
    packCreditsLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    packPrice: { fontSize: 16, fontWeight: '700' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 16, paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth },
    subscribeBtn: { backgroundColor: '#007AFF', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    subscribeBtnText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
    restoreBtn: { alignItems: 'center', paddingVertical: 8 },
    restoreText: { fontSize: 14 },
    
    opacity50: { opacity: 0.5 },
    opacity70: { opacity: 0.7 },
});
