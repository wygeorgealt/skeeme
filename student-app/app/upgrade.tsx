import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

function calculateTrialEndDate() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function UpgradeScreen() {
    const { user } = useAuthStore();
    const trialEndDate = calculateTrialEndDate();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    // Pricing Data matching old version
    const pricing = {
        ngn: {
            standard: { monthly: '5,000', yearly: '29,999' },
            elite: { monthly: '13,000', yearly: '119,000' }
        },
        usd: {
            standard: { monthly: '12.99', yearly: '99.99' },
            elite: { monthly: '29.99', yearly: '249.99' }
        }
    };

    const currency = user?.pricing?.currency === '₦' ? 'ngn' : 'usd';
    const symbol = user?.pricing?.currency || '$';

    const handleSimulatedPayment = (plan: string) => {
        Alert.alert(
            `Upgrade to ${plan} (${billingCycle})`,
            "In a production environment, this would open Native In-App Purchases (Apple/Google) or a Stripe Checkout sheet."
        );
    };

    return (
        <View style={StyleSheet.absoluteFill} className="bg-white dark:bg-brand-dark">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* TOP HEADER SECTION (DARK) */}
                <View className="bg-[#0B0F19] pt-16 px-6 pb-12">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mb-8"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>

                    <Text className="text-[32px] font-black tracking-tight mb-8">
                        <Text className="text-white">Skeeme</Text>
                        <Text className="text-[#FCD34D]">Pro</Text>
                    </Text>

                    <Text className="text-white text-[22px] font-black mb-6 tracking-tight">Free 7-day trial</Text>

                    {/* Timeline */}
                    <View className="flex-row">
                        <View className="items-center mr-5 pt-1.5">
                            <View className="size-[22px] rounded-full bg-[#4f46e5] z-10" />
                            <LinearGradient colors={['#4f46e5', '#1e1b4b']} style={{ width: 6, height: 75, marginVertical: -4 }} />
                            <View className="size-[22px] rounded-full bg-[#312e81] z-10" />
                        </View>
                        <View className="flex-1 pb-4">
                            <View className="h-[75px] justify-start pt-1">
                                <Text className="text-white font-black text-lg leading-tight">Today</Text>
                                <Text className="text-slate-300 font-medium text-[15px] mt-1">Get Skeeme Pro free for 7 days.</Text>
                            </View>
                            <View className="justify-start pt-1.5">
                                <Text className="text-white font-black text-lg leading-tight">{trialEndDate}</Text>
                                <Text className="text-slate-300 font-medium text-[15px] mt-1 leading-relaxed">
                                    Trial ends. You will be billed for one year unless you cancel before this date.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* BOTTOM FEATURES SECTION (WHITE) */}
                <View className="bg-white px-6 pt-10 pb-16">

                    <FeatureItem
                        icon={<Ionicons name="infinite" size={36} color="#4f46e5" />}
                        title="UNLIMITED ACCESS*"
                        description="Generate unlimited practice quizzes and custom flashcards without running out of credits."
                        iconBg="bg-indigo-100"
                    />

                    <FeatureItem
                        icon={<Ionicons name="flash" size={36} color="#10b981" />}
                        title="Study smarter and faster"
                        description="Go beyond basic responses. Skip the queue and get your materials generated instantly with top-tier AI."
                        iconBg="bg-emerald-100"
                    />

                    <FeatureItem
                        icon={<Ionicons name="scan-circle" size={36} color="#d946ef" />}
                        title="Advanced Scan & Solve"
                        description="Be 100% ready for test day with unlimited deep-analysis photo solving and step-by-step logic."
                        iconBg="bg-fuchsia-100"
                    />

                    {/* NEW: Plan Selection */}
                    <View className="mt-12">
                        <Text className="text-slate-900 dark:text-white font-black text-xl mb-6 tracking-tight">Select your plan</Text>

                        {/* Billing Cycle Toggle */}
                        <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-8 items-center border border-slate-200 dark:border-slate-800">
                            {(['monthly', 'yearly'] as const).map((cycle) => (
                                <TouchableOpacity
                                    key={cycle}
                                    onPress={() => setBillingCycle(cycle)}
                                    className="flex-1 py-3 rounded-xl items-center"
                                    style={[
                                        billingCycle === cycle ? {
                                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 2,
                                            elevation: 1
                                        } : {}
                                    ]}
                                >
                                    <View className="flex-row items-center">
                                        <Text
                                            className="font-bold capitalize"
                                            style={{
                                                color: billingCycle === cycle ? (isDark ? '#ffffff' : '#0f172a') : '#64748b'
                                            }}
                                        >
                                            {cycle}
                                        </Text>
                                        {cycle === 'yearly' && (
                                            <View className="ml-2 bg-emerald-500 px-2 py-0.5 rounded-full">
                                                <Text className="text-[8px] font-black text-white">SAVE 50%</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Plan Cards */}
                        <View className="gap-4">
                            <PlanOption
                                title="Standard"
                                price={`${symbol}${pricing[currency].standard[billingCycle]}`}
                                cycle={billingCycle === 'monthly' ? '/mo' : '/yr'}
                                subtitle="Essential features for regular study"
                                icon="star"
                                iconColor="#4f46e5"
                                onPress={() => handleSimulatedPayment('Standard')}
                                isDark={isDark}
                            />
                            <PlanOption
                                title="Elite"
                                price={`${symbol}${pricing[currency].elite[billingCycle]}`}
                                cycle={billingCycle === 'monthly' ? '/mo' : '/yr'}
                                subtitle="Full power for exam season"
                                icon="flash"
                                iconColor="#f59e0b"
                                badge="Best Value"
                                onPress={() => handleSimulatedPayment('Elite')}
                                isDark={isDark}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-12 py-2 items-center"
                    >
                        <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-[17px]">
                            Continue using the free version
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-center text-slate-600 font-medium text-[13px] mt-10 px-4">
                        Get a <Text className="font-bold text-slate-800">free 7-day trial</Text> with an annual subscription. Cancel anytime.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

function FeatureItem({ icon, title, description, iconBg }: any) {
    return (
        <View className="flex-row items-start mb-8 pr-2">
            <View className={`size-[64px] rounded-xl ${iconBg} items-center justify-center mr-5 border-2 border-white/10`}>
                {icon}
            </View>
            <View className="flex-1 justify-center min-h-[64px] pt-1.5">
                <Text className="text-slate-900 dark:text-white font-black text-lg mb-1 tracking-tight">{title}</Text>
                <Text className="text-slate-600 dark:text-slate-400 text-[15px] leading-snug font-medium pt-0.5">{description}</Text>
            </View>
        </View>
    );
}

function PlanOption({ title, price, cycle, subtitle, icon, iconColor, badge, onPress, isDark }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[24px] border-2 border-slate-200 dark:border-slate-800 flex-row items-center justify-between"
            activeOpacity={0.8}
        >
            <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-1">
                    <Ionicons name={icon as any} size={16} color={iconColor} className="mr-2" />
                    <Text className="text-slate-900 dark:text-white font-black text-lg">{title}</Text>
                    {badge && (
                        <View className="ml-3 bg-indigo-600 px-2 py-0.5 rounded-full">
                            <Text className="text-[9px] font-black text-white uppercase">{badge}</Text>
                        </View>
                    )}
                </View>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold">{subtitle}</Text>
            </View>
            <View className="items-end">
                <View className="flex-row items-baseline">
                    <Text className="text-slate-900 dark:text-white font-black text-xl">{price}</Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-xs font-bold ml-0.5">{cycle}</Text>
                </View>
                <Text className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest mt-1">Select</Text>
            </View>
        </TouchableOpacity>
    );
}
