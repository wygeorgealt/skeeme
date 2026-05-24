import { Text } from '@/components/ui/Text';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, ErrorBoundaryProps, SplashScreen, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/components/QueryProvider';
import { View, useColorScheme as useNativeColorScheme, LogBox, TouchableOpacity, TextStyle, Platform, AppState } from 'react-native';
import { cssInterop, useColorScheme as useTailwindColorScheme } from 'nativewind';
import AnimatedSplash from '@/components/AnimatedSplash';
import Animated, { FadeOut } from 'react-native-reanimated';
import { NetworkStatus } from '@/components/NetworkStatus';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/lib/posthog';
import * as SystemUI from 'expo-system-ui';
import { DangerTriangle, Refresh } from '@solar-icons/react-native/Bold';
import { initializeRevenueCat } from '@/lib/revenuecat';
import RevenueCatUI from 'react-native-purchases-ui';





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
  const { hydrate, isLoading, user, onboardingComplete, onboardingStep, storedEmail, checkAuth } = useAuthStore();
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  const [fontsLoaded] = useFonts({
    'ClashGrotesk-Regular': require('@/assets/fonts/ClashGrotesk-Regular.ttf'),
    'ClashGrotesk-Light': require('@/assets/fonts/ClashGrotesk-Light.ttf'),
    'ClashGrotesk-Extralight': require('@/assets/fonts/ClashGrotesk-Extralight.ttf'),
    'ClashGrotesk-Medium': require('@/assets/fonts/ClashGrotesk-Medium.ttf'),
    'ClashGrotesk-Semibold': require('@/assets/fonts/ClashGrotesk-Semibold.ttf'),
    'ClashGrotesk-Bold': require('@/assets/fonts/ClashGrotesk-Bold.ttf'),
  });

  const segments = useSegments();
  const router = useRouter();

  const systemTheme = useNativeColorScheme();
  const { colorScheme: tailwindScheme, setColorScheme: setTailwindScheme } = useTailwindColorScheme();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Foreground sync (AppState change to active) & background poll (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    // 1. Listen for AppState changes (Sync instantly when app returns to foreground)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuth();
      }
    });

    // 2. Poll every 30 seconds to keep limits/credits synced dynamically
    const interval = setInterval(() => {
      checkAuth();
    }, 30000);

    // Initial check on mount
    checkAuth();

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [user?.id, checkAuth]);

  // Initialize RevenueCat SDK — configure immediately on mount (anonymous),
  // then re-configure with the real user ID once authenticated.
  useEffect(() => {
    initializeRevenueCat(user?.id?.toString());
  }, [user?.id]);

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['login', 'signup', '(onboarding)', 'welcome', 'forgot-password', 'otp', 'new-password'];
    const currentSegment = segments[0] as string;
    const isPublicRoute = publicRoutes.includes(currentSegment);

    if (user) {
      if (!onboardingComplete) {
        if (currentSegment !== '(onboarding)') {
          router.replace('/(onboarding)/education');
        }
      } else {
        // Allow all users (free or premium) to access the app after onboarding
        // If they run out of credits, the OutOfCreditsModal will block their actions but they can still view their history
        if (isPublicRoute || !currentSegment) {
          router.replace('/(drawer)');
        }
      }
    } else {


      // Not logged in — always start at auth-select
      if (!isPublicRoute) {
        router.replace('/(onboarding)/auth-select');
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

  // Track page views in PostHog automatically
  useEffect(() => {
    if (segments.length > 0) {
      const currentRoute = segments.join('/');
      posthog.screen(currentRoute);
    }
  }, [segments]);

  const storeTheme = useAuthStore((state) => state.theme);

  useEffect(() => {
    setTailwindScheme(storeTheme || 'system');
  }, [storeTheme, setTailwindScheme]);

  // Set the NATIVE iOS root view background to match the theme.
  // This is the layer underneath React Native — the white/black strip
  // behind the status bar is this native view showing through.
  const rootBg = tailwindScheme === 'dark' ? '#000000' : '#F2F2F7';
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(rootBg);
  }, [rootBg]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
      <View style={{ flex: 1, backgroundColor: rootBg }}>
        <PostHogProvider client={posthog}>
          <QueryProvider>
            <ThemeProvider value={{
              ...(tailwindScheme === 'dark' ? DarkTheme : DefaultTheme),
              colors: {
                ...(tailwindScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
                background: 'transparent',
                card: 'transparent',
              }
            }}>

              {/* High-Fidelity Animated Splash Overlay */}
              {!isAnimationFinished && (
                <Animated.View exiting={FadeOut.duration(500)} style={{ position: 'absolute', zIndex: 99999, width: '100%', height: '100%' }}>
                  <AnimatedSplash onFinish={() => setIsAnimationFinished(true)} />
                </Animated.View>
              )}

              <NetworkStatus />

              <Stack screenOptions={{ headerShown: false, headerTransparent: true, contentStyle: { backgroundColor: 'transparent' } }}>
                <Stack.Screen name="(onboarding)" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="otp" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="new-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="(drawer)" options={{ headerShown: false, animation: 'fade', headerTransparent: true }} />
                <Stack.Screen name="paywall" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="buy-credits" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />

                <Stack.Screen name="+not-found" />
              </Stack>

              {/* Global Modals */}
              <OutOfCreditsModalWrapper />
              <CooldownModalWrapper />
              <GlobalErrorModalWrapper />
              <StreakRewardModalWrapper />

              <StatusBar style={tailwindScheme === 'dark' ? 'light' : 'dark'} />
            </ThemeProvider>
          </QueryProvider>
        </PostHogProvider>
      </View>
    </GestureHandlerRootView>
  );
}

function OutOfCreditsModalWrapper() {
  const { showCreditsModal, creditsModalFeature, toggleCreditsModal } = useAuthStore();
  const OutOfCreditsModal = require('@/components/OutOfCreditsModal').default;

  return (
    <OutOfCreditsModal
      visible={showCreditsModal}
      onDismiss={() => toggleCreditsModal(false)}
      featureAttempted={creditsModalFeature || 'scan'}
    />
  );
}

function CooldownModalWrapper() {
  const { showCooldownModal, toggleCooldownModal } = useAuthStore();
  const CooldownModal = require('@/components/CooldownModal').default;

  return (
    <CooldownModal
      visible={showCooldownModal}
      onDismiss={() => toggleCooldownModal(false)}
    />
  );
}

function GlobalErrorModalWrapper() {
  const { globalError, setGlobalError } = useAuthStore();
  const GlobalErrorModal = require('@/components/GlobalErrorModal').default;

  return (
    <GlobalErrorModal
      visible={globalError !== null}
      error={globalError}
      onDismiss={() => setGlobalError(null)}
    />
  );
}

function StreakRewardModalWrapper() {
  const { showStreakRewardModal, streakRewardData, toggleStreakRewardModal } = useAuthStore();
  const { RewardModal } = require('@/components/RewardModal');

  return (
    <RewardModal
      isVisible={showStreakRewardModal}
      onClose={() => toggleStreakRewardModal(false)}
      reward={streakRewardData}
    />
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colorScheme = useNativeColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: isDark ? '#0f0f11' : '#fafafa' }}>
      <DangerTriangle size={48} color="#ef4444" />
      <Text style={{ fontSize: 20, fontWeight: '900', color: isDark ? 'white' : '#0f172a', marginTop: 20, marginBottom: 8, textAlign: 'center' }}>
        Something went wrong.
      </Text>
      <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center' }}>
        {error?.message || "We encountered an unexpected error. Our team has been notified."}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{ backgroundColor: isDark ? 'white' : '#0f172a', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' }}
      >
        <Refresh size={18} color={isDark ? '#0f172a' : 'white'} />
        <Text style={{ color: isDark ? '#0f172a' : 'white', fontWeight: 'bold', marginLeft: 8 }}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          // Use a hard link or router push to get them to help
          try {
            // If the error is deep, we might need a reset or specific path
            router.replace('/(drawer)/support');
          } catch (e) {
            // Fallback for extreme cases
            retry();
          }
        }}
        style={{ marginTop: 16, paddingVertical: 12 }}
      >
        <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600', fontSize: 15 }}>
          Need help? <Text style={{ color: '#007AFF' }}>Contact Support</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
