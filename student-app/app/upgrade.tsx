import { Text } from '@/components/ui/Text';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, useColorScheme, Linking, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Xmark, Sparks, FireFlame, Check } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { LinearGradient } from 'expo-linear-gradient';

import { PlanType, CurrencyType } from '@/types';
type BillingCycle = 'monthly' | 'yearly';

export default function UpgradeScreen() {
    const { user, pricingConfig, fetchPricingConfig } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [activeTab, setActiveTab] = useState<Exclude<PlanType, 'free'>>('standard');
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchasingPack, setPurchasingPack] = useState<number | null>(null);

    useEffect(() => {
        if (!pricingConfig) {
            fetchPricingConfig();
        }
    }, [pricingConfig]);

    const currencySymbol = user?.pricing?.currency || '$';
    const currency: CurrencyType = user?.pricing?.currency === '₦' ? 'ngn' : 'usd';

    if (!pricingConfig) {
        return (
            <GlowBackground isRoot style={s.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </GlowBackground>
        );
    }

    const currentPricing = pricingConfig[currency]?.[activeTab] || {};
    
    const FEATURES = {
        standard: [
            `${(currentPricing.weekly || 1500).toLocaleString()} Weekly Credits`,
            `${(currentPricing.credits || 6000).toLocaleString()} Monthly Total`,
            'Advanced Quiz Generation',
            'Detailed Flashcard creation',
            'Priority AI model access',
        ],
        elite: [
            `${(currentPricing.weekly || 5000).toLocaleString()} Weekly Credits`,
            `${(currentPricing.credits || 20000).toLocaleString()} Monthly Total`,
            'Unlimited Flashcard creation',
            'Ultra-fast Elite AI model',
            'Unlimited Scan & Solve',
        ]
    };

    const isPromoActive = (plan: PlanType) => {
        const promoEnd = pricingConfig.promos[`${plan}_end`];
        if (!promoEnd) return false;
        return new Date() < new Date(promoEnd);
    };

    const activePricing = pricingConfig[currency][activeTab];
    const isPromo = isPromoActive(activeTab);

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            // Use RevenueCat's high-fidelity Paywall UI
            const RevenueCatUI = require('react-native-purchases-ui').default;
            const { result } = await RevenueCatUI.presentPaywall();
            
            if (result === 'PURCHASED') {
                await useAuthStore.getState().checkAuth();
                Alert.alert("Success", "Welcome to the premium club! Your subscription is active.");
                router.replace('/(drawer)');
            }
        } catch (error: any) {
            Alert.alert("Checkout Failed", "Could not complete the purchase. Please try again.");
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleCreditPurchase = async (pack: any) => {
        setPurchasingPack(pack.amount);
        try {
            const Purchases = require('react-native-purchases').default;
            
            // Map your UI packs to Store Product IDs
            const productID = `skeeme_credits_${pack.amount}`;
            const products = await Purchases.getProducts([productID]);
            
            if (products.length > 0) {
                await Purchases.purchaseProduct(products[0]);
                await useAuthStore.getState().checkAuth();
                Alert.alert("Success", `Successfully added ${pack.amount.toLocaleString()} credits!`);
            } else {
                throw new Error("Product not found in store");
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                Alert.alert("Purchase Failed", error.message || "Could not complete the transaction.");
            }
        } finally {
            setPurchasingPack(null);
        }
    };

    return (
        <GlowBackground isRoot style={s.flex1}>
            <StatusBar style={isDark ? 'light' : 'dark'} translucent />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, isDark ? s.backBtnDark : s.backBtnLight]}
                >
                    <Xmark width={18} height={18} color={isDark ? '#cbd5e1' : '#0f172a'} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, isDark ? s.textWhite : s.textSlate900]}>Subscription</Text>
                <View style={s.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={s.flex1}>
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={s.contentPadding}>
                    <Text style={[isDark ? s.textWhite : s.textSlate900, s.heroTitle]}>
                        Ready for <Text style={s.textBrandPrimary}>Skeeme Elite?</Text>
                    </Text>
                    <Text style={[isDark ? s.textIndigo200 : s.textSlate500, s.heroSubtitle]}>
                        Select a plan to unlock advanced AI models and priority processing.
                    </Text>

                    {/* Tab Switcher */}
                    <View style={[s.tabSwitcher, isDark ? s.tabSwitcherDark : s.tabSwitcherLight]}>
                        {(['standard', 'elite'] as Exclude<PlanType, 'free'>[]).map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.7}
                                    style={[s.tabButton, isActive && s.tabButtonActive]}
                                >
                                    <Text
                                        style={[s.tabText, isActive ? s.textWhite : (isDark ? s.textIndigo300 : s.textSlate500)]}
                                    >
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Benefits Section */}
                    <Animated.View key={activeTab} entering={FadeIn} style={[s.benefitsCard, isDark ? s.benefitsCardDark : s.benefitsCardLight]}>
                        {isDark && (
                            <LinearGradient
                                colors={['rgba(139,92,246,0.1)', 'transparent']}
                                style={s.benefitsGradient}
                            />
                        )}
                        <Text style={s.benefitsLabel}>
                            {activeTab} Features
                        </Text>
                        <View style={s.benefitsList}>
                            {FEATURES[activeTab as keyof typeof FEATURES].map((feature: string, idx: number) => (
                                <View key={idx} style={s.benefitItem}>
                                    <View style={s.benefitIconBox}>
                                        <Sparks width={14} height={14} color="#8B5CF6" />
                                    </View>
                                    <Text style={[s.benefitText, isDark ? s.textIndigo100 : s.textSlate700]}>
                                        {feature}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Billing Cards */}
                    <View style={s.billingRow}>
                        <CardOption
                            title="Yearly"
                            price={activePricing.yearly}
                            symbol={currencySymbol}
                            subtitle={`Billed annually`}
                            isSelected={billingCycle === 'yearly'}
                            onSelect={() => setBillingCycle('yearly')}
                            badge={activePricing.save ? `${activePricing.save} OFF` : undefined}
                            isDark={isDark}
                        />
                        <CardOption
                            title="Monthly"
                            price={isPromo ? activePricing.promoMonthly : activePricing.monthly}
                            originalPrice={isPromo ? activePricing.monthly : undefined}
                            symbol={currencySymbol}
                            subtitle="Flat rate, cancel anytime"
                            isSelected={billingCycle === 'monthly'}
                            onSelect={() => setBillingCycle('monthly')}
                            badge={isPromo ? 'PROMO' : undefined}
                            isDark={isDark}
                        />
                    </View>

                    {/* One-Time Top-Up Section */}
                    <View style={s.topUpSection}>
                        <Text style={s.topUpLabel}>
                            Instant Top-Ups
                        </Text>
                        
                        <View style={s.topUpGrid}>
                            {(pricingConfig.credit_packs?.[currency] || []).map((pack: any) => (
                                <TouchableOpacity 
                                    key={pack.amount}
                                    onPress={() => handleCreditPurchase(pack)}
                                    activeOpacity={0.8}
                                    disabled={purchasingPack !== null || isPurchasing}
                                    style={[
                                        s.topUpCard, 
                                        isDark ? s.benefitsCardDark : s.benefitsCardLight,
                                        (purchasingPack !== null || isPurchasing) && s.opacity50
                                    ]}
                                >
                                    {purchasingPack === pack.amount ? (
                                        <ActivityIndicator size="small" color="#8B5CF6" style={s.topUpLoading} />
                                    ) : (
                                        <View style={s.topUpIconBox}>
                                            <FireFlame width={20} height={20} color="#8B5CF6" />
                                        </View>
                                    )}
                                    <Text style={[isDark ? s.textWhite : s.textSlate900, s.topUpAmount]}>{pack.amount.toLocaleString()}</Text>
                                    <Text style={[s.topUpUnit, isDark ? s.textIndigo400 : s.textSlate400]}>Credits</Text>
                                    
                                    <View style={[s.topUpPriceBox, isDark ? s.bgWhite10 : s.bgSlate900]}>
                                        <Text style={s.textWhiteBold}>
                                            {currencySymbol}{pack.price.toLocaleString(undefined, { minimumFractionDigits: currency === 'usd' ? 2 : 0 })}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </Animated.View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={[s.footer, isDark ? s.footerDark : s.footerLight]}>
                <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={isPurchasing || purchasingPack !== null}
                    activeOpacity={0.9}
                    style={[s.mainBtn, (isPurchasing || purchasingPack !== null) && s.opacity70]}
                >
                    {isPurchasing ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={s.mainBtnText}>
                            {billingCycle === 'yearly' ? 'Start Free Trial' : 'Continue to Checkout'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={async () => {
                        const { restorePurchases } = require('@/lib/revenuecat');
                        const restored = await restorePurchases();
                        if (restored) {
                            await useAuthStore.getState().checkAuth();
                            Alert.alert("Success", "Your purchases have been restored!");
                            router.replace('/(drawer)');
                        } else {
                            Alert.alert("Restore Failed", "No active subscriptions found to restore.");
                        }
                    }}
                    style={{ marginTop: 16, alignSelf: 'center' }}
                >
                    <Text style={[s.restoreText, isDark ? s.textIndigo400 : s.textBrandPrimary]}>Restore Purchases</Text>
                </TouchableOpacity>

                <Text style={[s.termsText, isDark ? s.textSlate500 : s.textSlate400]}>
                    By continuing, you agree to our Terms of Service & Privacy Policy.
                </Text>
            </View>
        </GlowBackground>
    );
}

function CardOption({ title, price, originalPrice, symbol, subtitle, isSelected, onSelect, badge, isDark }: any) {
    const priceFormatted = symbol + price.toLocaleString();
    const originalPriceFormatted = originalPrice ? symbol + originalPrice.toLocaleString() : null;

    return (
        <TouchableOpacity
            onPress={onSelect}
            activeOpacity={0.8}
            style={[
                s.optionCard,
                isDark ? s.benefitsCardDark : s.benefitsCardLight,
                isSelected && (isDark ? s.optionCardActiveDark : s.optionCardActiveLight)
            ]}
        >
            <View style={s.flex1}>
                <View style={s.optionHeader}>
                    <Text style={[s.optionTitle, isDark ? s.textWhite : s.textSlate900]}>{title}</Text>
                    {badge && (
                        <View style={s.badge}>
                            <Text style={s.badgeText}>{badge}</Text>
                        </View>
                    )}
                </View>
                <Text style={[s.optionSubtitle, isDark ? s.textIndigo30080 : s.textSlate500]}>{subtitle}</Text>

                <View style={s.priceRow}>
                    <Text style={[s.priceValue, isDark ? s.textWhite : s.textBrandPrimary]}>
                        {priceFormatted}
                    </Text>
                    {originalPriceFormatted && (
                        <Text style={s.originalPrice}>
                            {originalPriceFormatted}
                        </Text>
                    )}
                    <Text style={[s.priceUnit, isDark ? s.textSlate500 : s.textSlate400]}>/ {title === 'Yearly' ? 'year' : 'month'}</Text>
                </View>
            </View>
            <View
                style={[
                    s.radio, 
                    isSelected ? s.radioActive : (isDark ? s.radioInactiveDark : s.radioInactiveLight)
                ]}
            >
                {isSelected && <Check width={18} height={18} color="white" />}
            </View>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    flex1: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { paddingTop: 56, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1 },
    backBtnDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    backBtnLight: { backgroundColor: 'white', borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontWeight: '700', fontSize: 18, letterSpacing: -0.5 },
    headerSpacer: { width: 40 },
    
    contentPadding: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },
    heroTitle: { fontSize: 38, fontWeight: '900', letterSpacing: -0.5, marginBottom: 12, lineHeight: 40 },
    heroSubtitle: { fontWeight: '500', fontSize: 16, lineHeight: 24, marginBottom: 32, opacity: 0.8 },
    
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textBrandPrimary: { color: '#8B5CF6' },
    textIndigo100: { color: '#e0e7ff' },
    textIndigo200: { color: '#c7d2fe' },
    textIndigo300: { color: '#a5b4fc' },
    textIndigo30080: { color: 'rgba(165,180,252,0.8)' },
    textIndigo400: { color: '#818cf8' },
    textSlate400: { color: '#94a3b8' },
    textSlate500: { color: '#64748b' },
    textSlate700: { color: '#334155' },
    textWhiteBold: { color: 'white', fontWeight: '700', fontSize: 13 },

    tabSwitcher: { flexDirection: 'row', padding: 6, borderRadius: 22, borderWidth: 1, marginBottom: 32 },
    tabSwitcherDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    tabSwitcherLight: { backgroundColor: 'rgba(241,245,249,0.8)', borderColor: '#e2e8f0' },
    tabButton: { flex: 1, paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
    tabButtonActive: { backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    tabText: { fontWeight: '700', fontSize: 14, textTransform: 'capitalize', letterSpacing: 0.5 },

    benefitsCard: { borderRadius: 28, padding: 28, borderWidth: 1, marginBottom: 32, overflow: 'hidden' },
    benefitsCardDark: { backgroundColor: 'rgba(49, 46, 129, 0.2)', borderColor: 'rgba(99, 102, 241, 0.2)' },
    benefitsCardLight: { backgroundColor: 'white', borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    benefitsGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
    benefitsLabel: { fontSize: 12, fontWeight: '700', color: '#8B5CF6', letterSpacing: 2.4, textTransform: 'uppercase', marginBottom: 24 },
    benefitsList: { gap: 20 },
    benefitItem: { flexDirection: 'row', alignItems: 'center' },
    benefitIconBox: { width: 28, height: 28, backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    benefitText: { fontWeight: '600', fontSize: 15 },

    billingRow: { gap: 16 },
    optionCard: { padding: 24, borderRadius: 24, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    optionCardActiveDark: { backgroundColor: 'rgba(139,92,246,0.1)', borderColor: '#8B5CF6' },
    optionCardActiveLight: { backgroundColor: 'rgba(139,92,246,0.05)', borderColor: '#8B5CF6' },
    optionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    optionTitle: { fontWeight: '900', fontSize: 24, letterSpacing: -0.5, marginRight: 12 },
    optionSubtitle: { fontWeight: '600', fontSize: 13 },
    badge: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.3)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1.2 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 20 },
    priceValue: { fontWeight: '900', fontSize: 26, letterSpacing: -0.5 },
    originalPrice: { color: '#94a3b8', textDecorationLine: 'line-through', fontSize: 15, fontWeight: '700', marginLeft: 12 },
    priceUnit: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
    radio: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: '#8B5CF6', backgroundColor: '#8B5CF6' },
    radioInactiveDark: { borderColor: 'rgba(99, 102, 241, 0.3)', backgroundColor: 'transparent' },
    radioInactiveLight: { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },

    topUpSection: { marginTop: 56, marginBottom: 20 },
    topUpLabel: { fontSize: 12, fontWeight: '700', color: '#8B5CF6', letterSpacing: 2.4, textTransform: 'uppercase', marginBottom: 24, marginLeft: 8 },
    topUpGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    topUpCard: { width: '48%', marginBottom: 16, padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    topUpIconBox: { backgroundColor: 'rgba(139,92,246,0.1)', width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
    topUpAmount: { fontWeight: '900', fontSize: 22, letterSpacing: -0.5, marginBottom: 4 },
    topUpUnit: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 },
    topUpPriceBox: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
    bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' },
    bgSlate900: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    topUpLoading: { marginBottom: 16, height: 44, justifyContent: 'center' },
    opacity50: { opacity: 0.5 },
    opacity70: { opacity: 0.7 },

    footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 24, borderTopWidth: 1 },
    footerDark: { backgroundColor: 'rgba(0,0,0,0.2)', borderTopColor: 'rgba(255,255,255,0.05)' },
    footerLight: { backgroundColor: 'white', borderTopColor: '#f1f5f9' },
    mainBtn: { height: 60, backgroundColor: '#8B5CF6', borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
    restoreText: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
    termsText: { textAlign: 'center', fontWeight: '500', fontSize: 11, marginTop: 20, paddingHorizontal: 16, lineHeight: 18 },
});
