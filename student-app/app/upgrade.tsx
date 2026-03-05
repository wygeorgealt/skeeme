import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

function calculateTrialEndDate() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function UpgradeScreen() {
    const { user } = useAuthStore();
    const trialEndDate = calculateTrialEndDate();

    const handleSimulatedPayment = () => {
        Alert.alert(
            "Start Trial",
            "In a production environment, this would open Native In-App Purchases (Apple/Google) for the Yearly plan with a 7-day trial."
        );
    };

    return (
        <View style={StyleSheet.absoluteFill} className="bg-white">
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

                    <TouchableOpacity
                        onPress={handleSimulatedPayment}
                        className="bg-[#FCD34D] w-full py-[18px] rounded-xl items-center mt-6 shadow-sm"
                        activeOpacity={0.9}
                    >
                        <Text className="text-slate-900 font-bold text-lg tracking-tight">
                            View subscriptions
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-8 py-2 items-center"
                    >
                        <Text className="text-indigo-600 font-bold text-[17px]">
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
            <View className={`size-[64px] rounded-xl ${iconBg} items-center justify-center mr-5`}>
                {icon}
            </View>
            <View className="flex-1 justify-center min-h-[64px] pt-1.5">
                <Text className="text-slate-900 font-black text-lg mb-1 tracking-tight">{title}</Text>
                <Text className="text-slate-600 text-[15px] leading-snug font-medium pt-0.5">{description}</Text>
            </View>
        </View>
    );
}
