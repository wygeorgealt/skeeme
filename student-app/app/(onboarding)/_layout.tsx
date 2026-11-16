import { Stack } from 'expo-router';

export default function OnboardingLayout() {
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
            <Stack.Screen name="start" />
            <Stack.Screen name="explanation-preferences" />
            <Stack.Screen name="study-challenges" />
            <Stack.Screen name="daily-goal" />
            <Stack.Screen name="personalized-plan" />
            <Stack.Screen name="reminders" />
        </Stack>
    );
}
