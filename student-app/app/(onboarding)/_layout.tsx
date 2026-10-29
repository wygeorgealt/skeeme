import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: '',
                headerTransparent: false,
                animation: 'slide_from_right',
                gestureEnabled: false,
                contentStyle: { backgroundColor: 'transparent' },
            }}
        />
    );
}
