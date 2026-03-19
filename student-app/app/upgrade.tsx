import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Linking, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { router, Stack } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { api } from '@/lib/api';

type PlanType = 'standard' | 'elite';
type BillingCycle = 'monthly' | 'yearly';

const FEATURES = {
    standard: [
        '1,500 Weekly Credits',
        '6,000 Monthly Total',
        'Advanced Quiz Generation',
        'Detailed Flashcard creation',
        'Priority AI model access',
    ],
    elite: [
        '5,000 Weekly Credits',
        '20,000 Monthly Total',
        'Unlimited Flashcard creation',
        'Ultra-fast Elite AI model',
        'Unlimited Scan & Solve',
    ]
};

export default function UpgradeScreen() {
    const { user, pricingConfig, fetchPricingConfig } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [activeTab, setActiveTab] = useState<PlanType>('standard');
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchasingPack, setPurchasingPack] = useState<number | null>(null);

    useEffect(() => {
        if (!pricingConfig) {
            fetchPricingConfig();
        }
    }, []);

    const currencySymbol = user?.pricing?.currency || '$';
    const currency = user?.pricing?.currency === '₦' ? 'ngn' : 'usd';

    if (!pricingConfig) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? 'bg-brand-dark' : 'bg-white'}`}>
                <ActivityIndicator size="large" color="#D2B48C" />
            </View>
        );
    }

    const isPromoActive = (plan: PlanType) => {
        if (!pricingConfig.promos || !pricingConfig.promos[`${plan}_end`]) return false;
        return new Date() < new Date(pricingConfig.promos[`${plan}_end`]);
    };

    const activePricing = pricingConfig[currency][activeTab];
    const isPromo = isPromoActive(activeTab);



    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {

            const response = await api.post('subscriptions/checkout', {
                plan: activeTab,
                cycle: billingCycle,
            });

            if (response.data.authorization_url) {


                // Open system browser for payment
                await Linking.openURL(response.data.authorization_url);

                // Start automatic polling after a short delay
                setTimeout(() => pollPaymentStatus(response.data.reference, 0), 5000);
            }
        } catch (error: any) {
            if (__DEV__) {
                if (__DEV__) console.error('Checkout failed', error);
                if (error.response?.data) {
                    if (__DEV__) console.error('Checkout Error Response:', JSON.stringify(error.response.data, null, 2));
                }
            }
            const msg = error.response?.data?.message || "Could not start the payment process. Please try again.";
            Alert.alert("Checkout Failed", msg);
        } finally {
            setIsPurchasing(false);
        }
    };

    const pollPaymentStatus = async (reference: string, attempt: number, isCreditPack: boolean = false) => {
        const MAX_ATTEMPTS = 24; // 24 * 5s = 2 minutes
        if (attempt >= MAX_ATTEMPTS) {
            Alert.alert(
                "Payment Pending",
                "We couldn't confirm your payment automatically. Use the 'Check Payment' button to verify manually.",
            );
            return;
        }

        try {

            const endpoint = isCreditPack ? `/credits/verify/${reference}` : `/subscriptions/verify/${reference}`;
            const response = await api.get(endpoint);

            if (response.data.status === 'success') {

                await useAuthStore.getState().checkAuth();
                Alert.alert("Success", "Welcome to the premium club! Your subscription is active.");
                router.replace('/(drawer)');
                return;
            }
        } catch {
            // Network error — continue polling
        } finally {
        }

        // Schedule next poll
        setTimeout(() => pollPaymentStatus(reference, attempt + 1, isCreditPack), 5000);
    };



    const bgClass = isDark ? 'bg-[#0f0f11]' : 'bg-[#fafafa]';
    const cardBgClass = isDark ? 'bg-[#161618]' : 'bg-white';
    const textBaseClass = isDark ? 'text-white' : 'text-slate-900';
    const subtextClass = isDark ? 'text-slate-500' : 'text-slate-500';

    return (
        <View className={`flex-1 ${bgClass}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="pt-14 px-8 flex-row justify-between items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className={`size-12 items-center justify-center rounded-2xl border ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                    <Ionicons name="close" size={24} color={isDark ? '#cbd5e1' : '#0f172a'} />
                </TouchableOpacity>
                <Text className={`${textBaseClass} font-bold text-lg tracking-tight`}>Subscription</Text>
                <View className="size-12" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="px-8 pt-8 pb-10">
                    <Text className={`${textBaseClass} text-[36px] font-bold tracking-tight mb-2 leading-tight`}>
                        Ready for <Text className="text-brand-primary">Skeeme Elite?</Text>
                    </Text>
                    <Text className={`${subtextClass} font-medium text-[16px] leading-relaxed mb-10`}>
                        Select a plan to unlock advanced AI models and priority processing.
                    </Text>

                    {/* Tab Switcher */}
                    <View className={`flex-row p-1.5 rounded-[20px] border mb-10 ${isDark ? 'bg-[#161618] border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
                        {(['standard', 'elite'] as PlanType[]).map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.7}
                                    className={`flex-1 py-3.5 rounded-[16px] items-center ${isActive ? 'bg-brand-primary shadow-sm' : ''}`}
                                >
                                    <Text
                                        className={`font-bold text-[14px] capitalize ${isActive ? 'text-white' : (isDark ? 'text-slate-500' : 'text-slate-500')}`}
                                    >
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Benefits Section */}
                    <Animated.View key={activeTab} entering={FadeIn} className={`rounded-[32px] p-8 border mb-10 ${cardBgClass} ${isDark ? 'border-slate-800' : 'border-slate-100 shadow-sm'}`}>
                        <Text className="text-[11px] font-bold text-brand-primary tracking-[0.2em] uppercase mb-6">
                            {activeTab} Features
                        </Text>
                        <View className="gap-y-5">
                            {FEATURES[activeTab as keyof typeof FEATURES].map((feature: string, idx: number) => (
                                <View key={idx} className="flex-row items-center">
                                    <View className="size-6 bg-brand-primary/10 rounded-full items-center justify-center mr-4">
                                        <Ionicons name="sparkles-outline" size={14} color="#D2B48C" />
                                    </View>
                                    <Text className={`font-bold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                        {feature}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Billing Cards */}
                    <View className="gap-y-4">
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
                    <View className="mt-14 mb-6">
                        <Text className="text-[12px] font-bold text-brand-primary tracking-[0.2em] uppercase mb-6 ml-1">
                            Instant Top-Ups
                        </Text>
                        
                        <View className="flex-row flex-wrap justify-between">
                            {[
                                { amount: 200, usd: 2.00, ngn: 1500 },
                                { amount: 500, usd: 3.70, ngn: 2800 },
                                { amount: 1000, usd: 6.00, ngn: 4000 },
                                { amount: 5000, usd: 15.00, ngn: 9500 },
                            ].map((pack) => (
                                <TouchableOpacity 
                                    key={pack.amount}
                                    onPress={async () => {
                                        setPurchasingPack(pack.amount);
                                        try {
                                            const response = await api.post('credits/checkout', { amount: pack.amount });
                                            if (response.data.authorization_url) {
                                                await Linking.openURL(response.data.authorization_url);
                                                setTimeout(() => pollPaymentStatus(response.data.reference, 0, true), 5000);
                                            }
                                        } catch (error: any) {
                                            const msg = error.response?.data?.message || "Could not start checkout.";
                                            Alert.alert("Checkout Failed", msg);
                                        } finally {
                                            setPurchasingPack(null);
                                        }
                                    }}
                                    activeOpacity={0.8}
                                    disabled={purchasingPack !== null || isPurchasing}
                                    className={`w-[48%] mb-4 p-6 rounded-[32px] border flex-col items-center justify-center ${cardBgClass} ${isDark ? 'border-slate-800' : 'border-slate-100 shadow-sm'} ${(purchasingPack !== null || isPurchasing) ? 'opacity-50' : ''}`}
                                >
                                    {purchasingPack === pack.amount ? (
                                        <ActivityIndicator size="small" color="#D2B48C" className="mb-4 h-12 justify-center" />
                                    ) : (
                                        <View className="bg-brand-primary/10 size-12 rounded-2xl items-center justify-center mb-4">
                                            <Ionicons name="flash-outline" size={24} color="#D2B48C" />
                                        </View>
                                    )}
                                    <Text className={`${textBaseClass} font-bold text-[24px] tracking-tight mb-1`}>{pack.amount.toLocaleString()}</Text>
                                    <Text className={`font-bold text-[10px] uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Credits</Text>
                                    
                                    <View className={`px-4 py-2 rounded-xl ${isDark ? 'bg-white' : 'bg-slate-900'}`}>
                                        <Text className={`font-bold text-[13px] ${isDark ? 'text-slate-900' : 'text-white'}`}>
                                            {currencySymbol}{(currency === 'ngn' ? pack.ngn : pack.usd).toLocaleString(undefined, { minimumFractionDigits: currency === 'usd' ? 2 : 0 })}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View className={`px-8 pb-12 pt-6 border-t ${isDark ? 'bg-[#0f0f11] border-slate-800' : 'bg-white border-slate-50'}`}>
                <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={isPurchasing || purchasingPack !== null}
                    activeOpacity={0.9}
                    className={`h-[64px] bg-brand-primary rounded-[20px] items-center justify-center shadow-lg shadow-brand-primary/20 ${(isPurchasing || purchasingPack !== null) ? 'opacity-75' : ''}`}
                >
                    {isPurchasing ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text className="text-white font-bold text-[17px] tracking-tight">
                            {billingCycle === 'yearly' ? 'Start Free Trial' : 'Continue to Checkout'}
                        </Text>
                    )}
                </TouchableOpacity>
                <Text className="text-center text-slate-400 font-medium text-[12px] mt-6 px-4 leading-relaxed">
                    By continuing, you agree to our Terms of Service & Privacy Policy.
                </Text>
            </View>
        </View>
    );
}

function CardOption({ title, price, originalPrice, symbol, subtitle, isSelected, onSelect, badge, isDark }: any) {
    const priceFormatted = symbol + price.toLocaleString();
    const originalPriceFormatted = originalPrice ? symbol + originalPrice.toLocaleString() : null;

    return (
        <TouchableOpacity
            onPress={onSelect}
            activeOpacity={0.8}
            className={`p-8 rounded-[32px] border-2 flex-row items-center justify-between ${isSelected ? (isDark ? 'bg-brand-primary/10 border-brand-primary' : 'bg-brand-primary/5 border-brand-primary') : (isDark ? 'bg-[#161618] border-slate-800' : 'bg-white border-slate-100 shadow-sm')}`}
        >
            <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-2">
                    <Text className={`font-bold text-[22px] tracking-tight mr-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</Text>
                    {badge && (
                        <View className="bg-emerald-500 px-3 py-1 rounded-full">
                            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">{badge}</Text>
                        </View>
                    )}
                </View>
                <Text className={`font-medium text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</Text>

                <View className="flex-row items-baseline mt-5">
                    <Text className={`font-bold text-[24px] tracking-tight ${isDark ? 'text-white' : 'text-brand-primary'}`}>
                        {priceFormatted}
                    </Text>
                    {originalPriceFormatted && (
                        <Text className="text-slate-400 line-through text-[15px] font-medium ml-3">
                            {originalPriceFormatted}
                        </Text>
                    )}
                    <Text className={`text-[14px] font-medium ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {title === 'Yearly' ? 'year' : 'month'}</Text>
                </View>
            </View>
            <View
                className={`size-7 rounded-full border-2 items-center justify-center ${isSelected ? 'border-brand-primary bg-brand-primary' : (isDark ? 'border-slate-800' : 'border-slate-200')}`}
            >
                {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
        </TouchableOpacity>
    );
}
