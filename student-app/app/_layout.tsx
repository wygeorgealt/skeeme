import { Text } from '@/components/ui/Text';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, ErrorBoundaryProps, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/components/QueryProvider';
import { useColorScheme as useNativeColorScheme, LogBox, View, TouchableOpacity, TextStyle, Platform } from 'react-native';
import { cssInterop, useColorScheme as useTailwindColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { WarningTriangle, Refresh } from 'iconoir-react-native';
import AnimatedSplash from '@/components/AnimatedSplash';
import Animated, { FadeOut } from 'react-native-reanimated';
import { NetworkStatus } from '@/components/NetworkStatus';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { useFonts } from 'expo-font';

cssInterop(LinearGradient, {
  className: 'style',
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

  // Removed RevenueCat identification
  useEffect(() => {
    // Other user-specific initializations can go here
  }, [user]);

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['login', 'signup', '(onboarding)', 'welcome', 'forgot-password', 'otp', 'new-password'];
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
      } else if (!onboardingComplete) {
        // Fresh install or incomplete onboarding → start from the beginning
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

  const storeTheme = useAuthStore((state) => state.theme);

  useEffect(() => {
    setTailwindScheme(storeTheme || 'system');
  }, [storeTheme, setTailwindScheme]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: tailwindScheme === 'dark' ? '#100921' : '#fafafa' }}>
      <GlowBackground isRoot={true}>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
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
            <Stack.Screen name="upgrade" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>

          {/* Global Modals */}
          <OutOfCreditsModalWrapper />

          <StatusBar style={tailwindScheme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
        </ThemeProvider>
      </QueryProvider>
      </View>
      </GlowBackground>
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

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colorScheme = useNativeColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: isDark ? '#0f0f11' : '#fafafa' }}>
      <WarningTriangle width={48} height={48} color="#ef4444" />
      <Text style={{ fontSize: 20, fontWeight: '900', color: isDark ? 'white' : '#0f172a', marginTop: 20, marginBottom: 8, textAlign: 'center' }}>
        Something went wrong.
      </Text>
      <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center' }}>
        {error?.message || "We encountered an unexpected error. Our team has been notified."}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{ backgroundColor: isDark ? 'white' : '#0f172a', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
      >
        <Refresh width={18} height={18} color={isDark ? '#121212' : 'white'} />
        <Text style={{ color: isDark ? '#0f172a' : 'white', fontWeight: 'bold', marginLeft: 8 }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
