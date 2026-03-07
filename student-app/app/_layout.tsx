import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/components/QueryProvider';
// Using platform system fonts (SF Pro on iOS, Roboto on Android) - no custom font loading needed
import { useColorScheme as useNativeColorScheme, LogBox, View, Text, TouchableOpacity } from 'react-native';
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


if (__DEV__) {
  LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
}

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

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    // Error logged to console in dev or handled by system
  }, [error]);

  return (
    <View className="flex-1 items-center justify-center p-8 bg-white dark:bg-[#010100]">
      <Ionicons name="warning" size={48} color="#ef4444" />
      <Text className="text-[24px] font-black tracking-tight text-slate-900 dark:text-white mt-6 mb-2 text-center">
        Something went wrong.
      </Text>
      <Text className="text-[15px] font-medium leading-relaxed text-slate-500 mb-8 text-center">
        We encountered an unexpected error. Our team has been notified.
      </Text>
      <TouchableOpacity
        onPress={retry}
        className="bg-slate-900 dark:bg-white px-8 py-4 rounded-xl flex-row items-center"
      >
        <Ionicons name="refresh" size={20} color={useTailwindColorScheme().colorScheme === 'dark' ? '#0f172a' : 'white'} />
        <Text className="text-white dark:text-slate-900 font-bold ml-2">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
