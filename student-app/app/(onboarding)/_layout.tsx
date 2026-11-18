import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { preloadStudyGlow } from '@/lib/preloadStudyGlow';

export default function OnboardingLayout() {
    useEffect(() => {
        void preloadStudyGlow();
    }, []);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'default',
                animationMatchesGesture: true,
                gestureEnabled: true,
                contentStyle: { backgroundColor: 'transparent' },
            }}
        >
            <Stack.Screen name="auth-select" />
            <Stack.Screen name="name" />
            <Stack.Screen name="start" />
            <Stack.Screen name="explanation-preferences" />
            <Stack.Screen name="study-challenges" />
            <Stack.Screen name="daily-goal" />
            <Stack.Screen name="personalized-plan" />
            <Stack.Screen name="reminders" />
            <Stack.Screen name="save-study-plan" />
        </Stack>
    );
}
