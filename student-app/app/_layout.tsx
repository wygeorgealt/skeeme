import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/components/QueryProvider';
// Using platform system fonts (SF Pro on iOS, Roboto on Android) - no custom font loading needed
import { useColorScheme as useNativeColorScheme, LogBox, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { useColorScheme as useTailwindColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedSplash from '@/components/AnimatedSplash';
import Animated, { FadeOut } from 'react-native-reanimated';
import { NetworkStatus } from '@/components/NetworkStatus';

cssInterop(LinearGradient, {
  className: 'style',
});
cssInterop(Ionicons, { className: 'style' as any });


LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

SplashScreen.preventAutoHideAsync();

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(drawer)',
};

export default function RootLayout() {
  const { hydrate, isLoading, user } = useAuthStore();
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  // System fonts: SF Pro (iOS) / Roboto (Android) — no loading needed
  const fontsLoaded = true;

  const segments = useSegments();
  const router = useRouter();

  const systemTheme = useNativeColorScheme();
  const { colorScheme: tailwindScheme, setColorScheme: setTailwindScheme } = useTailwindColorScheme();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['login', 'signup', 'welcome'];
    const currentSegment = segments[0] as string;
    const isPublicRoute = publicRoutes.includes(currentSegment);

    if (!user && !isPublicRoute) {
      router.replace('/welcome');
    } else if (user && isPublicRoute) {
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

          {/* High-Fidelity Animated Splash Overlay */}
          {!isAnimationFinished && (
            <Animated.View exiting={FadeOut.duration(500)} style={{ position: 'absolute', zIndex: 99999, width: '100%', height: '100%' }}>
              <AnimatedSplash onFinish={() => setIsAnimationFinished(true)} />
            </Animated.View>
          )}

          <NetworkStatus />

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
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
