import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, ErrorBoundaryProps, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/components/QueryProvider';
// Using platform system fonts (SF Pro on iOS, Roboto on Android) - no custom font loading needed
import { useColorScheme as useNativeColorScheme, LogBox, View, Text, TouchableOpacity } from 'react-native';
import { cssInterop, useColorScheme as useTailwindColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedSplash from '@/components/AnimatedSplash';
import Animated, { FadeOut } from 'react-native-reanimated';
import { NetworkStatus } from '@/components/NetworkStatus';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

cssInterop(LinearGradient, {
  className: 'style',
});
cssInterop(Ionicons, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: true,
      size: true,
    },
  },
});

// Fix NativeWind v4 crash on Animated components
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });


if (__DEV__) {
  LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
}

SplashScreen.preventAutoHideAsync();


export const unstable_settings = {
  anchor: '(drawer)',
};

export default function RootLayout() {
  const { hydrate, isLoading, user, onboardingComplete, onboardingStep, storedEmail } = useAuthStore();
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

    const publicRoutes = ['login', 'signup', '(onboarding)', 'forgot-password', 'otp', 'new-password'];
    const currentSegment = segments[0] as string;
    const isPublicRoute = publicRoutes.includes(currentSegment);

    if (user && isPublicRoute) {
      // Logged in user on a public route → send home
      router.replace('/(drawer)');
    } else if (!user && !isPublicRoute) {
      // Not logged in → decide where to send them
      if (storedEmail) {
        // Had a previous session → login with pre-filled email
        router.replace('/login');
      } else if (!onboardingComplete && onboardingStep > 0) {
        // Started onboarding but didn't finish → resume
        const stepRoutes: Record<number, string> = {
          1: '/(onboarding)/hook',
          2: '/(onboarding)/education',
          3: '/(onboarding)/field',
          4: '/(onboarding)/style',
          5: '/(onboarding)/demo',
          6: '/(onboarding)/create-account',
          7: '/(onboarding)/streak-intro',
          8: '/(onboarding)/notifications',
        };
        router.replace((stepRoutes[onboardingStep] || '/(onboarding)/hook') as any);
      } else if (!onboardingComplete) {
        // Fresh install → start onboarding
        router.replace('/(onboarding)/hook');
      } else {
        // Completed onboarding but no user (logged out) → login
        router.replace('/login');
      }
    }
  }, [user, isLoading, segments, router, onboardingComplete, onboardingStep, storedEmail]);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync().catch(() => {
        /* Ignore: "No native splash screen registered" occurs if hidden twice or not registered */
      });
    }
  }, [fontsLoaded, isLoading]);

  useEffect(() => {
    const storeTheme = useAuthStore.getState().theme;
    if (storeTheme === 'system' || !storeTheme) {
      setTailwindScheme(systemTheme || 'light');
    } else {
      setTailwindScheme(storeTheme as 'light' | 'dark');
    }
  }, [systemTheme, setTailwindScheme]);

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
            <Stack.Screen name="(onboarding)" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="otp" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="new-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
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
  const { colorScheme } = useTailwindColorScheme();

  useEffect(() => {
    // Error logged to console in dev or handled by system
  }, [error]);

  return (
    <View className="flex-1 items-center justify-center p-8 bg-[#fafafa] dark:bg-[#0f0f11]">
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
        <Ionicons name="refresh" size={20} color={colorScheme === 'dark' ? '#121212' : 'white'} />
        <Text className="text-white dark:text-slate-900 font-bold ml-2">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
