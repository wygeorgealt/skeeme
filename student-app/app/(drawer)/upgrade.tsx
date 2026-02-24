import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

export default function UpgradeScreen() {
    const { user } = useAuthStore();

    const handleSimulatedPayment = () => {
        Alert.alert(
            "Simulated Payment",
            "In a production environment, this would open Native In-App Purchases (Apple/Google) or a Stripe Checkout sheet."
        );
    };

    if (user?.is_unlimited) {
        return (
            <View className="flex-1 bg-slate-50 dark:bg-brand-dark justify-center items-center p-6">
                <View className="size-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
                    <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                </View>
                <Text className="text-2xl font-black text-slate-900 text-center mb-2">You are a Pro!</Text>
                <Text className="text-slate-500 font-medium text-center">
                    You currently have the Unlimited Pro subscription. Enjoy unrestricted access to all AI study tools.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-slate-50 dark:bg-brand-dark">
            <View className="px-6 py-10">
                <LinearGradient
                    colors={['#4f46e5', '#0ea5e9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-[32px] p-8 shadow-2xl shadow-indigo-900/40 relative overflow-hidden"
                >

                    {/* Background Decoration */}
                    <View className="absolute -top-10 -right-10 opacity-10">
                        <Ionicons name="planet" size={160} color="white" />
                    </View>

                    <Text className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2">
                        Level Up
                    </Text>
                    <Text className="text-4xl font-black text-white mb-2">Unlimited Pro</Text>
                    <Text className="text-indigo-100 font-medium mb-8">
                        Master any subject without worrying about credit limits.
                    </Text>

                    <View className="bg-white/10 rounded-2xl p-4 mb-8">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                            <Text className="text-white font-semibold ml-3">Unlimited AI Practice Quizzes</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                            <Text className="text-white font-semibold ml-3">Generate from File Uploads</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                            <Text className="text-white font-semibold ml-3">Priority Generation Speed</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                            <Text className="text-white font-semibold ml-3">No recurring credit deductions</Text>
                        </View>
                    </View>

                    <View className="flex-row items-end mb-6">
                        <Text className="text-5xl font-black text-white">$4</Text>
                        <Text className="text-indigo-200 font-bold mb-1 ml-1">/month</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleSimulatedPayment}
                        className="w-full bg-white py-4 rounded-xl items-center"
                    >
                        <Text className="text-indigo-900 font-black text-lg">Upgrade Now</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <Text className="text-center text-slate-400 font-medium mt-6 text-xs px-4">
                    Payment will be charged to your iTunes/Google Play account. Subscription automatically renews unless canceled.
                </Text>
            </View>
        </ScrollView>
    );
}
