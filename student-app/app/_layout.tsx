import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/components/QueryProvider';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { useColorScheme as useNativeColorScheme, LogBox } from 'react-native';
import { cssInterop } from 'nativewind';
import { useColorScheme as useTailwindColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

cssInterop(LinearGradient, {
  className: 'style',
});

// @ts-ignore
cssInterop(Ionicons, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: true,
      size: true,
    },
  },
});

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

SplashScreen.preventAutoHideAsync();

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(drawer)',
};

export default function RootLayout() {
  const { hydrate, isLoading, user } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  const segments = useSegments();
  const router = useRouter();

  const systemTheme = useNativeColorScheme();
  const { colorScheme: tailwindScheme, setColorScheme: setTailwindScheme } = useTailwindColorScheme();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(drawer)');
    }
  }, [user, isLoading, segments, router]);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  useEffect(() => {
    const storeTheme = useAuthStore.getState().theme;
    if (storeTheme === 'system' || !storeTheme) {
      setTailwindScheme(systemTheme || 'light');
    } else {
      setTailwindScheme(storeTheme as 'light' | 'dark');
    }
  }, [systemTheme]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ThemeProvider value={tailwindScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(drawer)" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="upgrade" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
