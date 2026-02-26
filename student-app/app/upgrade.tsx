import { View, Text, ScrollView, TouchableOpacity, Alert, Pressable, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';

const { height, width } = Dimensions.get('window');

export default function UpgradeScreen() {
    const { user } = useAuthStore();
    const { colorScheme, setColorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleSimulatedPayment = (plan: string) => {
        Alert.alert(
            `Upgrade to ${plan}`,
            "In a production environment, this would open Native In-App Purchases (Apple/Google) or a Stripe Checkout sheet."
        );
    };

    const isPro = user?.is_unlimited;

    // Pricing Data
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

    return (
        <View style={StyleSheet.absoluteFill} className="justify-end">
            {/* Backdrop */}
            <Pressable
                style={StyleSheet.absoluteFill}
                className="bg-black/60"
                onPress={() => router.back()}
            />

            {/* Bottom Sheet Container */}
            <View
                className="bg-slate-50 dark:bg-brand-dark w-full rounded-t-[40px] overflow-hidden"
                style={{
                    height: height * 0.9,
                    borderTopWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }}
            >
                {/* Header line for dragging affordance (visual only) */}
                <View className="w-12 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full self-center mt-4 mb-2" />

                {/* Close Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-4 right-5 size-10 bg-white/80 dark:bg-slate-800/80 rounded-full items-center justify-center z-10 shadow-sm"
                >
                    <Ionicons name="close" size={24} color={isDark ? '#cbd5e1' : '#64748b'} />
                </TouchableOpacity>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                >
                    <View className="px-6 pt-6 items-center">
                        <Text className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[12px] mb-2">
                            Elevate Your Learning
                        </Text>
                        <Text className="text-3xl font-black text-slate-900 dark:text-white text-center mb-6">
                            Choose Your Plan
                        </Text>

                        {/* Billing Toggle */}
                        <View className="flex-row bg-slate-200 dark:bg-slate-900 p-1.5 rounded-2xl mb-8 w-64 items-center">
                            <TouchableOpacity
                                onPress={() => setBillingCycle('monthly')}
                                className="flex-1 py-2.5 rounded-xl items-center"
                                style={billingCycle === 'monthly' ? { backgroundColor: isDark ? '#1e293b' : '#ffffff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 } : {}}
                            >
                                <Text
                                    className="font-bold"
                                    style={{ color: billingCycle === 'monthly' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8') }}
                                >
                                    Monthly
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setBillingCycle('yearly')}
                                className="flex-1 py-2.5 rounded-xl items-center"
                                style={billingCycle === 'yearly' ? { backgroundColor: isDark ? '#1e293b' : '#ffffff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 } : {}}
                            >
                                <Text
                                    className="font-bold"
                                    style={{ color: billingCycle === 'yearly' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8') }}
                                >
                                    Yearly
                                </Text>
                                <View className="absolute -top-3 -right-2 bg-emerald-500 px-2 py-0.5 rounded-full">
                                    <Text className="text-[8px] font-black text-white">SAVE 50%</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Pricing Cards */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 16 }}>

                            {/* Free Plan */}
                            <PricingCard
                                title="Free"
                                description="Perfect for quick tasks"
                                credits="500"
                                price="0"
                                features={['Basic AI Speed', 'Standard Queue', 'Daily Limits']}
                                onPress={() => { }}
                                isCurrent={!isPro}
                                isDark={isDark}
                            />

                            {/* Standard Plan */}
                            <PricingCard
                                title="Standard"
                                description="The ultimate study companion"
                                credits="5,000"
                                price={pricing[currency].standard[billingCycle]}
                                symbol={symbol}
                                cycle={billingCycle === 'monthly' ? '/ mo' : '/ yr'}
                                features={['Fast AI Speed', 'Priority Queue', '5,000 Monthly Credits', 'Advanced OCR']}
                                badge="Most Popular"
                                isBestValue
                                onPress={() => handleSimulatedPayment('Standard')}
                                isDark={isDark}
                            />

                            {/* Elite Plan */}
                            <PricingCard
                                title="Elite"
                                description="For the academic beasts"
                                credits="15,000"
                                price={pricing[currency].elite[billingCycle]}
                                symbol={symbol}
                                cycle={billingCycle === 'monthly' ? '/ mo' : '/ yr'}
                                features={['Highest AI Priority', 'No Limits Speed', '15,000 Monthly Credits', 'Exam Season Beast Mode']}
                                badge="For Power Users"
                                onPress={() => handleSimulatedPayment('Elite')}
                                isDark={isDark}
                                variant="indigo"
                            />
                        </ScrollView>

                        <Text className="text-center text-slate-400 dark:text-slate-500 font-medium mt-10 text-[11px] px-8 leading-tight">
                            Subscriptions auto-renew at the end of each period. Cancel anytime via App Store or Play Store settings.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

function PricingCard({
    title,
    description,
    credits,
    price,
    symbol = '$',
    cycle = '',
    features,
    badge,
    isBestValue,
    onPress,
    isDark,
    isCurrent,
    variant = 'slate'
}: any) {
    const isIndigo = variant === 'indigo';

    return (
        <View
            className="w-[280px] rounded-[32px] p-6 border overflow-hidden shadow-xl"
            style={{
                backgroundColor: isIndigo ? '#4f46e5' : (isDark ? '#0f172a' : '#ffffff'),
                borderColor: isIndigo ? '#6366f1' : (isDark ? '#1e293b' : '#e2e8f0'),
                shadowColor: isIndigo ? '#6366f1' : '#000',
                shadowOpacity: 0.1,
                shadowRadius: 20
            }}
        >
            {badge && (
                <View className={`absolute top-4 right-4 px-3 py-1 rounded-full ${isIndigo ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/40'}`}>
                    <Text className={`text-[9px] font-black uppercase tracking-tighter ${isIndigo ? 'text-white' : 'text-indigo-600 dark:text-indigo-300'}`}>
                        {badge}
                    </Text>
                </View>
            )}

            <Text className={`text-xl font-black mb-1 ${isIndigo ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</Text>
            <Text className={`text-xs font-medium mb-6 ${isIndigo ? 'text-indigo-100/70' : 'text-slate-500 dark:text-slate-400'}`}>{description}</Text>

            <View className="flex-row items-baseline mb-6">
                <Text className={`text-2xl font-black ${isIndigo ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{symbol}{price}</Text>
                <Text className={`text-sm font-bold ml-1 ${isIndigo ? 'text-indigo-100/60' : 'text-slate-400 dark:text-slate-500'}`}>{cycle}</Text>
            </View>

            <View className="space-y-3 mb-8">
                {features.map((f: string, i: number) => (
                    <View key={i} className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color={isIndigo ? '#fff' : '#6366f1'} />
                        <Text className={`ml-2 text-[13px] font-semibold ${isIndigo ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>{f}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                onPress={onPress}
                disabled={isCurrent}
                className={`w-full py-4 rounded-2xl items-center shadow-lg ${isIndigo ? 'bg-white' : 'bg-indigo-600 shadow-indigo-500/30'} ${isCurrent ? 'opacity-50' : ''}`}
                activeOpacity={0.8}
            >
                <Text className={`font-black text-lg ${isIndigo ? 'text-indigo-600' : 'text-white'}`}>
                    {isCurrent ? 'Current Plan' : 'Get Started'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
