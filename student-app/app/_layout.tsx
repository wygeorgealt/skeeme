import { Text } from '@/components/ui/Text';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, ErrorBoundaryProps, SplashScreen, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/components/QueryProvider';
import { useStudent } from '@/hooks/useStudent';
import { View, useColorScheme as useNativeColorScheme, LogBox, TouchableOpacity, TextStyle, Platform, AppState } from 'react-native';
import { cssInterop, useColorScheme as useTailwindColorScheme } from 'nativewind';
import AnimatedSplash from '@/components/AnimatedSplash';
import Animated, { FadeOut } from 'react-native-reanimated';
import { NetworkStatus } from '@/components/NetworkStatus';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/lib/posthog';
import { SuperwallProviderWrapper } from '@/lib/monetization';
import * as SystemUI from 'expo-system-ui';
import DangerTriangle from '@/assets/icons/pikaicons/troubleshoot.svg';
import Refresh from '@/assets/icons/pikaicons/arrow-down.svg';
import { initializeMonetization } from '@/lib/monetization';
import * as Application from 'expo-application';
import { apiStandard } from '@/lib/api';





// Fix NativeWind v4 crash on Animated components
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });


SplashScreen.preventAutoHideAsync();


export const unstable_settings = {
  anchor: '(drawer)',
};

function parseSemver(version: string) {
  const parts = (version || '').split('.').map((p) => parseInt(p, 10));
  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
  };
}

function isVersionLess(a: string, b: string) {
  const A = parseSemver(a);
  const B = parseSemver(b);

  if (A.major !== B.major) return A.major < B.major;
  if (A.minor !== B.minor) return A.minor < B.minor;
  return A.patch < B.patch;
}

export default function RootLayout() {
  const { hydrate, isLoading, user, onboardingComplete, onboardingStep, storedEmail } = useAuthStore();
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  // Force-update modal state
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateMinVersion, setUpdateMinVersion] = useState<string | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.skeeme.app';

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

  // Initialize monetization SDK (Superwall when configured, otherwise RevenueCat),
  // then re-configure with the real user ID once authenticated.
  useEffect(() => {
    // RevenueCat "offerings" can be empty in Expo Go/dev if appUserID changes or is undefined.
    // Use a stable fallback anon id when logged out so paywalls render correctly.
    const stableAnonId = user?.id?.toString() ?? 'anon';
    initializeMonetization(stableAnonId);
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

  // IMPORTANT: These must EXACTLY match Colors.light.background / Colors.dark.background
  // in constants/theme.ts — any mismatch creates a visible color strip behind the status bar.
  const rootBg = tailwindScheme === 'dark' ? '#0D0D0D' : '#F0F2F7';

  // Force-update check (only once auth is hydrated)
  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (isLoading) return;
      if (!user) return;
      if (checkingUpdate) return;

      setCheckingUpdate(true);
      try {
        const appVersion =
          Application.nativeApplicationVersion ||
          Application.nativeBuildVersion ||
          '0.0.0';

        const res = await apiStandard.get('system/app-version');
        const minVersion = res.data?.min_version;

        if (!minVersion) return;

        if (!cancelled && isVersionLess(String(appVersion), String(minVersion))) {
          setUpdateMinVersion(String(minVersion));
          setNeedsUpdate(true);
        }
      } catch (e) {
        // Ignore update-check failures; do not block.
      } finally {
        if (!cancelled) setCheckingUpdate(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [isLoading, user?.id]);
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(rootBg);
  }, [rootBg]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
      <View style={{ flex: 1, backgroundColor: rootBg }}>
        <SuperwallProviderWrapper>
          <PostHogProvider client={posthog}>
            <QueryProvider>
            <PollingSync user={user} />
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

              <Stack screenOptions={{ headerShown: false, headerTransparent: true, statusBarTranslucent: true, contentStyle: { backgroundColor: 'transparent' } }}>
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

              {/* Force-update overlay */}
              {needsUpdate && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999999,
                    backgroundColor: tailwindScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 24,
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      maxWidth: 440,
                      backgroundColor: tailwindScheme === 'dark' ? '#0f172a' : '#ffffff',
                      borderRadius: 20,
                      padding: 20,
                      borderWidth: 1,
                      borderColor: tailwindScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: '900', textAlign: 'center' }}>
                      App update needed
                    </Text>
                    <Text
                      style={{
                        marginTop: 10,
                        fontSize: 14,
                        fontWeight: '600',
                        color: tailwindScheme === 'dark' ? '#CBD5E1' : '#475569',
                        textAlign: 'center',
                        lineHeight: 20,
                      }}
                    >
                      To keep everything working properly, please update Skeeme to continue.
                    </Text>

                    {updateMinVersion && (
                      <Text
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          fontWeight: '700',
                          color: tailwindScheme === 'dark' ? '#94A3B8' : '#64748B',
                          textAlign: 'center',
                        }}
                      >
                        Minimum required: {updateMinVersion}
                      </Text>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        try {
                          // eslint-disable-next-line @typescript-eslint/no-var-requires
                          const Linking = require('expo-linking');
                          Linking.openURL('https://play.google.com/store/apps/details?id=com.skeeme.app');
                        } catch (e) {
                          // ignore
                        }
                      }}
                      style={{
                        marginTop: 16,
                        backgroundColor: '#007AFF',
                        borderRadius: 14,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '900' }}>Update to continue</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Global Modals */}
              <OutOfCreditsModalWrapper />
              <CooldownModalWrapper />
              <GlobalErrorModalWrapper />
              <StreakRewardModalWrapper />
              <EnjoyReviewModalWrapper />

              <StatusBar style={tailwindScheme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
            </ThemeProvider>
          </QueryProvider>
        </PostHogProvider>
      </SuperwallProviderWrapper>
      </View>
    </GestureHandlerRootView>
  );
}

// Polling component that syncs user data and runs inside QueryProvider context
function PollingSync({ user }: { user: any }) {
  const studentQuery = useStudent();

  useEffect(() => {
    if (!user) return;

    // 1. Listen for AppState changes (Sync instantly when app returns to foreground)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        studentQuery.refetch();
      }
    });

    // 2. Poll every 30 seconds to keep limits/credits synced dynamically
    const interval = setInterval(() => {
      studentQuery.refetch();
    }, 30000);

    // Initial check on mount
    studentQuery.refetch();

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [user?.id, studentQuery]);

  return null;
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

function EnjoyReviewModalWrapper() {
  const { showEnjoyReviewModal, toggleEnjoyReviewModal } = useAuthStore();
  const EnjoyReviewModal = require('@/components/EnjoyReviewModal').default;

  return (
    <EnjoyReviewModal
      visible={showEnjoyReviewModal}
      onDismiss={() => toggleEnjoyReviewModal(false)}
    />
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colorScheme = useNativeColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: isDark ? '#0f0f11' : '#fafafa' }}>
      <DangerTriangle width={48} height={48} color="#ef4444" />
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
        <Refresh width={18} height={18} color={isDark ? '#0f172a' : 'white'} />
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
