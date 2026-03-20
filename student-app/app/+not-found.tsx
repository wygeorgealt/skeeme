import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { Compass, Home } from 'iconoir-react-native';

export default function NotFoundScreen() {
    return (
        <View className="flex-1 bg-slate-900 justify-center items-center px-5">
            <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />

            <View className="size-16 bg-slate-800 rounded-full items-center justify-center mb-5">
                <Compass width={40} height={40} color="#6366f1" />
            </View>

            <Text className="text-2xl font-black text-white mb-2">404</Text>
            <Text className="text-slate-400 font-medium text-center text-base mb-6">
                This page doesn&apos;t exist. You may have followed a broken link.
            </Text>

            <TouchableOpacity
                onPress={() => router.replace('/(drawer)')}
                className="bg-indigo-600 px-6 py-4 rounded-xl flex-row items-center"
                activeOpacity={0.8}
            >
                <Home width={18} height={18} color="white" />
                <Text className="text-white font-black text-base ml-2">Go Home</Text>
            </TouchableOpacity>
        </View>
    );
}
