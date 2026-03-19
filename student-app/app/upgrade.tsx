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



    const bgClass = isDark ? 'bg-brand-dark' : 'bg-white';
    const textBaseClass = isDark ? 'text-white' : 'text-slate-900';
    const subtextClass = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <View className={`flex-1 ${bgClass}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="pt-14 px-6 flex-row justify-between items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                    <Ionicons name="close" size={24} color={isDark ? '#cbd5e1' : '#64748b'} />
                </TouchableOpacity>
                <Text className={`${textBaseClass} font-black text-lg`}>Subscription</Text>
                <View className="size-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="px-6 pt-8 pb-10">
                    <Text className={`${textBaseClass} text-3xl font-black tracking-tight mb-2`}>
                        Unlock <Text className="text-brand-primary">Premium</Text>
                    </Text>
                    <Text className={`${subtextClass} font-medium text-[16px] leading-snug mb-8`}>
                        Choose the plan that fits your learning journey perfectly.
                    </Text>

                    {/* Tab Switcher */}
                    <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl mb-8">
                        {(['standard', 'elite'] as PlanType[]).map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    className="flex-1 py-3 rounded-xl items-center"
                                    style={{
                                        backgroundColor: isActive
                                            ? '#D2B48C'
                                            : 'transparent',
                                        shadowOpacity: isActive && !isDark ? 0.1 : 0,
                                        elevation: isActive && !isDark ? 2 : 0,
                                    }}
                                >
                                    <Text
                                        className="font-black text-sm capitalize"
                                        style={{
                                            color: isActive
                                                ? (isDark ? '#FFFFFF' : '#121212')
                                                : (isDark ? '#94A3B8' : '#64748B')
                                        }}
                                    >
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Benefits Section */}
                    <Animated.View key={activeTab} entering={FadeIn} className="mb-10">
                        <Text className="text-xs font-black text-brand-primary tracking-widest uppercase mb-4">
                            {activeTab} Benefits
                        </Text>
                        <View className="gap-y-4">
                            {FEATURES[activeTab as keyof typeof FEATURES].map((feature: string, idx: number) => (
                                <View key={idx} className="flex-row items-center">
                                    <View className="size-6 bg-brand-primary/10 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="checkmark" size={14} color="#D2B48C" />
                                    </View>
                                    <Text className="text-slate-700 dark:text-slate-200 font-bold text-[15px]">
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
                            subtitle={`Total ${currencySymbol}${activePricing.yearly.toLocaleString()} every 12 months`}
                            isSelected={billingCycle === 'yearly'}
                            onSelect={() => setBillingCycle('yearly')}
                            badge={activePricing.save ? `SAVE ${activePricing.save}` : undefined}
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
                            badge={isPromo ? 'LIMITED PROMO' : undefined}
                            isDark={isDark}
                        />
                    </View>

                    {/* One-Time Top-Up Section */}
                    <View className="mt-12 mb-6">
                        <Text className="text-xs font-black text-brand-primary tracking-widest uppercase mb-4">
                            One-Time Top-Ups
                        </Text>
                        <Text className={`${subtextClass} font-medium text-[15px] leading-snug mb-6`}>
                            Need a quick boost? Buy credits a-la-carte without a subscription.
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
                                    className={`w-[48%] mb-4 p-4 rounded-[28px] border-2 flex-col items-center justify-center bg-slate-50 dark:bg-white/5 ${isDark ? 'border-slate-800' : 'border-slate-200'} ${(purchasingPack !== null || isPurchasing) ? 'opacity-50' : ''}`}
                                >
                                    {purchasingPack === pack.amount ? (
                                        <ActivityIndicator size="small" color="#D2B48C" className="mb-3 mt-1 h-12 justify-center" />
                                    ) : (
                                        <View className="bg-brand-primary/10 size-12 rounded-full items-center justify-center mb-3">
                                            <Ionicons name="flash" size={20} color="#D2B48C" />
                                        </View>
                                    )}
                                    <Text className={`${textBaseClass} font-black text-[22px] tracking-tight mb-0.5`}>{pack.amount.toLocaleString()}</Text>
                                    <Text className={`${subtextClass} font-bold text-[10px] uppercase tracking-widest mb-4`}>Credits</Text>
                                    
                                    <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-1.5">
                                        <Text className={`${textBaseClass} font-black text-sm`}>
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
            <View className={`px-6 pb-12 pt-4 border-t ${isDark ? 'bg-brand-dark border-slate-800' : 'bg-white border-slate-100'}`}>
                <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={isPurchasing || purchasingPack !== null}
                    activeOpacity={0.9}
                    className={`h-[56px] bg-brand-primary rounded-2xl items-center justify-center shadow-sm ${(isPurchasing || purchasingPack !== null) ? 'opacity-75' : ''}`}
                >
                    {isPurchasing ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text className="text-white font-bold text-[16px]">
                            {billingCycle === 'yearly' ? 'Start 7-day Free Trial' : 'Get Started Now'}
                        </Text>
                    )}
                </TouchableOpacity>
                <Text className="text-center text-slate-400 dark:text-slate-500 text-xs font-medium mt-4 px-8">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
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
            className="p-6 rounded-[28px] border-2 flex-row items-center justify-between"
            style={{
                borderColor: isSelected ? '#D2B48C' : (isDark ? 'rgba(46, 189, 133, 0.2)' : '#f1f5f9'),
                backgroundColor: isSelected
                    ? (isDark ? 'rgba(46, 189, 133, 0.15)' : 'rgba(46, 189, 133, 0.08)')
                    : (isDark ? 'rgba(46, 189, 133, 0.05)' : 'rgba(248, 250, 252, 0.5)')
            }}
        >
            <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-1">
                    <Text className="text-slate-900 dark:text-white font-black text-xl mr-3">{title}</Text>
                    {badge && (
                        <View className="bg-brand-primary px-2.5 py-0.5 rounded-full">
                            <Text className="text-[10px] font-black text-white">{badge}</Text>
                        </View>
                    )}
                </View>
                <Text className="text-slate-500 dark:text-white/50 font-bold text-xs">{subtitle}</Text>

                <View className="flex-row items-baseline mt-3">
                    <Text className="text-brand-primary dark:text-white font-black text-[19px]">
                        {priceFormatted}
                    </Text>
                    {originalPriceFormatted && (
                        <Text className="text-slate-400 line-through text-sm font-bold ml-2">
                            {originalPriceFormatted}
                        </Text>
                    )}
                    <Text className="text-slate-400 dark:text-white/60 text-sm font-bold"> / {title === 'Yearly' ? 'year' : 'month'}</Text>
                </View>
            </View>
            <View
                className="size-6 rounded-full border-2 items-center justify-center"
                style={{
                    borderColor: isSelected ? '#D2B48C' : (isDark ? '#475569' : '#cbd5e1')
                }}
            >
                {isSelected && <View className="size-3 rounded-full bg-brand-primary" />}
            </View>
        </TouchableOpacity>
    );
}
