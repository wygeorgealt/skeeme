import { Stack } from 'expo-router';

export default function FlashcardsLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
        }}>
            <Stack.Screen name="create" options={{ headerShown: false }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
