import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Linking, Alert, ActivityIndicator } from 'react-native';
import { Xmark, Sparks, FireFlame, Check } from 'iconoir-react-native';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { api } from '@/lib/api';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { LinearGradient } from 'expo-linear-gradient';

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
    }, [pricingConfig]);

    const currencySymbol = user?.pricing?.currency || '$';
    const currency = user?.pricing?.currency === '₦' ? 'ngn' : 'usd';

    if (!pricingConfig) {
        return (
            <GlowBackground isRoot className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#8B5CF6" />
            </GlowBackground>
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
                await Linking.openURL(response.data.authorization_url);
                setTimeout(() => pollPaymentStatus(response.data.reference, 0), 5000);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Could not start the payment process. Please try again.";
            Alert.alert("Checkout Failed", msg);
        } finally {
            setIsPurchasing(false);
        }
    };

    const pollPaymentStatus = async (reference: string, attempt: number, isCreditPack: boolean = false) => {
        const MAX_ATTEMPTS = 24;
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
        }
        setTimeout(() => pollPaymentStatus(reference, attempt + 1, isCreditPack), 5000);
    };

    const textBaseClass = isDark ? 'text-white' : 'text-slate-900';
    const subtextClass = isDark ? 'text-indigo-200' : 'text-slate-500';
    const cardBgClass = isDark ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-white border-slate-200 shadow-sm';

    return (
        <GlowBackground isRoot className="flex-1">
            <StatusBar style={isDark ? 'light' : 'dark'} translucent />

            {/* Header */}
            <View className="pt-14 px-6 flex-row justify-between items-center z-10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className={`size-10 items-center justify-center rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                    <Xmark width={18} height={18} color={isDark ? '#cbd5e1' : '#0f172a'} />
                </TouchableOpacity>
                <Text className={`${textBaseClass} font-bold text-lg tracking-tight`}>Subscription</Text>
                <View className="size-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <Animated.View entering={FadeInDown.delay(100).duration(500)} className="px-6 pt-8 pb-8">
                    <Text className={`${textBaseClass} text-[38px] font-black tracking-tight mb-3 leading-tight`}>
                        Ready for <Text className="text-brand-primary">Skeeme Elite?</Text>
                    </Text>
                    <Text className={`${subtextClass} font-medium text-[16px] leading-relaxed mb-8 opacity-80`}>
                        Select a plan to unlock advanced AI models and priority processing.
                    </Text>

                    {/* Tab Switcher */}
                    <View className={`flex-row p-1.5 rounded-[22px] border mb-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/80 border-slate-200'}`}>
                        {(['standard', 'elite'] as PlanType[]).map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.7}
                                    className={`flex-1 py-4 rounded-[18px] items-center ${isActive ? 'bg-brand-primary shadow-lg shadow-brand-primary/30' : ''}`}
                                >
                                    <Text
                                        className={`font-bold text-[14px] capitalize tracking-wide ${isActive ? 'text-white' : (isDark ? 'text-indigo-300' : 'text-slate-500')}`}
                                    >
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Benefits Section */}
                    <Animated.View key={activeTab} entering={FadeIn} className={`rounded-[28px] p-7 border mb-8 ${cardBgClass} overflow-hidden`}>
                        {isDark && (
                            <LinearGradient
                                colors={['rgba(139,92,246,0.1)', 'transparent']}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100 }}
                            />
                        )}
                        <Text className="text-[12px] font-bold text-brand-primary tracking-[0.2em] uppercase mb-6 drop-shadow-sm">
                            {activeTab} Features
                        </Text>
                        <View className="gap-y-5">
                            {FEATURES[activeTab as keyof typeof FEATURES].map((feature: string, idx: number) => (
                                <View key={idx} className="flex-row items-center">
                                    <View className="size-7 bg-brand-primary/10 rounded-full items-center justify-center mr-4">
                                        <Sparks width={14} height={14} color="#8B5CF6" />
                                    </View>
                                    <Text className={`font-semibold text-[15px] ${isDark ? 'text-indigo-100' : 'text-slate-700'}`}>
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
                    <View className="mt-14 mb-5">
                        <Text className="text-[12px] font-bold text-brand-primary tracking-[0.2em] uppercase mb-6 ml-2">
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
                                    className={`w-[48%] mb-4 p-5 rounded-[24px] border flex-col items-center justify-center ${cardBgClass} ${(purchasingPack !== null || isPurchasing) ? 'opacity-50' : ''}`}
                                >
                                    {purchasingPack === pack.amount ? (
                                        <ActivityIndicator size="small" color="#8B5CF6" className="mb-4 h-11 justify-center" />
                                    ) : (
                                        <View className="bg-brand-primary/10 size-11 rounded-2xl items-center justify-center mb-4 border border-brand-primary/20">
                                            <FireFlame width={20} height={20} color="#8B5CF6" />
                                        </View>
                                    )}
                                    <Text className={`${textBaseClass} font-black text-[22px] tracking-tight mb-1`}>{pack.amount.toLocaleString()}</Text>
                                    <Text className={`font-bold text-[10px] uppercase tracking-[0.2em] mb-5 ${isDark ? 'text-indigo-400' : 'text-slate-400'}`}>Credits</Text>
                                    
                                    <View className={`px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/10 border-white/10' : 'bg-slate-900 border-slate-900'}`}>
                                        <Text className={`font-bold text-[13px] ${isDark ? 'text-white' : 'text-white'}`}>
                                            {currencySymbol}{(currency === 'ngn' ? pack.ngn : pack.usd).toLocaleString(undefined, { minimumFractionDigits: currency === 'usd' ? 2 : 0 })}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </Animated.View>
            </ScrollView>

            {/* Bottom Button */}
            <View className={`px-6 pb-12 pt-6 border-t ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-100'}`}>
                <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={isPurchasing || purchasingPack !== null}
                    activeOpacity={0.9}
                    className={`h-[60px] bg-brand-primary rounded-[22px] items-center justify-center shadow-xl shadow-brand-primary/30 ${(isPurchasing || purchasingPack !== null) ? 'opacity-70' : ''}`}
                >
                    {isPurchasing ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text className="text-white font-bold text-[16px] tracking-wide">
                            {billingCycle === 'yearly' ? 'Start Free Trial' : 'Continue to Checkout'}
                        </Text>
                    )}
                </TouchableOpacity>
                <Text className={`text-center font-medium text-[11px] mt-5 px-4 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
            className={`p-6 rounded-[24px] border-2 flex-row items-center justify-between transition-all ${isSelected ? (isDark ? 'bg-brand-primary/10 border-brand-primary' : 'bg-brand-primary/5 border-brand-primary') : (isDark ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-white border-slate-200 shadow-sm')}`}
        >
            <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-2">
                    <Text className={`font-black text-[24px] tracking-tight mr-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</Text>
                    {badge && (
                        <View className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                            <Text className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{badge}</Text>
                        </View>
                    )}
                </View>
                <Text className={`font-semibold text-[13px] ${isDark ? 'text-indigo-300/80' : 'text-slate-500'}`}>{subtitle}</Text>

                <View className="flex-row items-baseline mt-5">
                    <Text className={`font-black text-[26px] tracking-tight ${isDark ? 'text-white' : 'text-brand-primary'}`}>
                        {priceFormatted}
                    </Text>
                    {originalPriceFormatted && (
                        <Text className="text-slate-400 line-through text-[15px] font-bold ml-3">
                            {originalPriceFormatted}
                        </Text>
                    )}
                    <Text className={`text-[14px] font-bold ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {title === 'Yearly' ? 'year' : 'month'}</Text>
                </View>
            </View>
            <View
                className={`size-8 rounded-full border-2 items-center justify-center ${isSelected ? 'border-brand-primary bg-brand-primary' : (isDark ? 'border-indigo-500/30 bg-transparent' : 'border-slate-300 bg-slate-50')}`}
            >
                {isSelected && <Check width={18} height={18} color="white" />}
            </View>
        </TouchableOpacity>
    );
}
