import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-brand-dark justify-finish">
            <StatusBar style="light" />

            {/* Main Content Area */}
            <View className="flex-1 justify-center items-center px-8 relative">
                {/* Centerpiece 3D Logo / Icon */}
                <View className="items-center justify-center">
                    <Image
                        source={require('@/assets/images/splash-icon.png')}
                        style={{ width: 140, height: 140, resizeMode: 'contain', tintColor: 'white' }}
                    />
                </View>

                {/* Typography positioned below the centerpiece */}
                <View className="absolute bottom-[20%] w-full items-start px-8">
                    <Text className="text-white text-[32px] font-black tracking-tight leading-[38px] mb-4">
                        Master any subject with AI-driven study tools
                    </Text>
                    <Text className="text-slate-400 text-[16px] font-medium leading-relaxed">
                        Generate quizzes, scan math problems, and track your progress with features designed exclusively for students.
                    </Text>
                </View>
            </View>

            {/* Bottom Actions Area */}
            <View className="w-full px-6 pb-12 pt-6 border-t border-white/5 bg-brand-dark">
                <TouchableOpacity
                    onPress={() => router.push('/signup')}
                    className="w-full bg-[#6366f1] py-[18px] rounded-[12px] items-center justify-center mb-6"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-bold text-[17px] tracking-tight">Sign Up</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <TouchableOpacity
                        onPress={() => router.push('/login')}
                        activeOpacity={0.6}
                    >
                        <Text className="text-slate-400 text-[15px] font-medium">
                            <Text className="text-[#818cf8] underline">Sign In</Text> if you already have a skeeme account
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
