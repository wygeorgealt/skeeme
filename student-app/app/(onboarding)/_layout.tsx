import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

export default function OnboardingLayout() {
    const reduceMotion = useReducedMotion();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: reduceMotion ? 'fade' : 'slide_from_right',
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
