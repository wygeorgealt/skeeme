import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
    return (
        <View className="flex-1 bg-slate-900 justify-center items-center px-6">
            <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />

            <View className="size-20 bg-slate-800 rounded-full items-center justify-center mb-6">
                <Ionicons name="compass-outline" size={40} color="#6366f1" />
            </View>

            <Text className="text-3xl font-black text-white mb-2">404</Text>
            <Text className="text-slate-400 font-medium text-center text-base mb-8">
                This page doesn&apos;t exist. You may have followed a broken link.
            </Text>

            <TouchableOpacity
                onPress={() => router.replace('/(drawer)')}
                className="bg-indigo-600 px-8 py-4 rounded-2xl flex-row items-center"
                activeOpacity={0.8}
            >
                <Ionicons name="home-outline" size={18} color="white" />
                <Text className="text-white font-black text-base ml-2">Go Home</Text>
            </TouchableOpacity>
        </View>
    );
}
