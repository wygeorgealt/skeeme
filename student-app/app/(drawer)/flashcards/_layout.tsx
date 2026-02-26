import { Stack } from 'expo-router';

export default function FlashcardsLayout() {
    const { colorScheme } = require('nativewind').useColorScheme();
    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? '#010100' : '#f8fafc';
    const tintColor = isDark ? '#fff' : '#0f172a';

    return (
        <Stack screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: bgColor },
            headerTintColor: tintColor,
            headerBackTitle: '', // Removes the "Back" text
            headerBackVisible: false,
            headerShadowVisible: false,
        }}>
            <Stack.Screen name="index" options={{
                title: 'Flashcards',
                headerShown: false
            }} />
            <Stack.Screen name="create" options={{
                title: 'Generate Deck',
                headerShown: true,
                headerTitleStyle: { fontFamily: 'Inter_900Black' }
            }} />
            <Stack.Screen name="[id]" options={{
                title: 'Study Deck',
                headerShown: true,
                headerTitleStyle: { fontFamily: 'Inter_900Black' }
            }} />
        </Stack>
    );
}
