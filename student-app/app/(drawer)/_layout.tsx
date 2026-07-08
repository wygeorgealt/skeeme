import { Tabs, router, usePathname } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { AppState, AppStateStatus } from 'react-native';
import ClaimRewardModal from '@/components/ClaimRewardModal';
import { useState } from 'react';

import { Home, User, CameraAdd } from '@solar-icons/react-native/Bold';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, SharedValue } from 'react-native-reanimated';

import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

// ─── Custom simple 2-tab bar ─────────────────────────────
function TabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    // Filter to only visible tabs (Home + Account)
    const visibleRoutes = state.routes
        .map((route: any, index: number) => ({ route, index }))
        .filter(({ route }: any) => ['index', 'account'].includes(route.name));
        
    // Check if any screen has requested to hide the tab bar
    const focusedRoute = state.routes[state.index];
    const focusedOptions = descriptors[focusedRoute.key].options;
    if (focusedOptions.tabBarStyle?.display === 'none') {
        return null;
    }

    return (
        <View style={bar.outerWrap} pointerEvents="box-none">
            <BlurView
                intensity={Platform.OS === 'ios' ? 80 : 100}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    bar.blurBase,
                    {
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                        backgroundColor: isDark
                            ? (Platform.OS === 'android' ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.7)')
                            : (Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)'),
                        borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    },
                ]}
            >
                {visibleRoutes.map(({ route, index }: any) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const iconColor = isFocused ? C.primary : (isDark ? '#6b7280' : '#9ca3af');
                    const label = options.title ?? route.name;
                    
                    const iconSource = route.name === 'index' 
                        ? require('@/assets/3dicons/home-3d-icon.png') 
                        : require('@/assets/3dicons/3dicons-boy-front-color.png');

                    return (
                        <View key={route.key} style={bar.sideTab}>
                            <AnimatedIcon
                                source={iconSource}
                                size={28}
                                animationType={route.name === 'index' ? 'pop' : 'wobble'}
                                onPress={() => {
                                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                                    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                                }}
                                style={[{ opacity: isFocused ? 1 : 0.4 }, bar.iconPressable]}
                            >
                                <Text style={[bar.tabLabel, { color: iconColor, marginTop: 4 }]}>{label}</Text>
                            </AnimatedIcon>
                        </View>
                    );
                })}
            </BlurView>
        </View>
    );
}

const bar = StyleSheet.create({
    outerWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    blurBase: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingTop: 6,
        paddingHorizontal: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        overflow: 'hidden',
    },
    sideTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    iconPressable: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.1,
        textAlign: 'center',
    }
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    // P3: Use individual selectors — the old `const { user, token, ... } = useAuthStore()`
    // subscribed to the entire store, so ANY store change (credits modal, global error,
    // cooldown modal) would re-render the entire tab navigator + custom blur tab bar.
    const user = useAuthStore(s => s.user);
    const token = useAuthStore(s => s.token);
    const onboardingComplete = useAuthStore(s => s.onboardingComplete);
    const onboardingJustCompleted = useAuthStore(s => s.onboardingJustCompleted);
    const clearOnboardingJustCompleted = useAuthStore(s => s.clearOnboardingJustCompleted);
    const pathname = usePathname();
    const [pendingReward, setPendingReward] = useState<{ total: number } | null>(null);

    useEffect(() => {
        // Clear the "just completed" flag after 2 seconds to let data settle
        if (onboardingJustCompleted) {
            const timer = setTimeout(() => {
                clearOnboardingJustCompleted();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [onboardingJustCompleted, clearOnboardingJustCompleted]);

    useEffect(() => {
        // Refresh auth state when app becomes active to pick up remote changes (credits, plan updates)
        const handleAppState = (next: AppStateStatus) => {
            if (next === 'active') {
                try {
                    useAuthStore.getState().checkAuth().catch(() => {});
                } catch (e) { }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppState);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        // AI Personalization Guard
        if (
            token &&
            user &&
            onboardingComplete &&
            !onboardingJustCompleted &&
            (!user.ai_preferences || !user.ai_preferences.tone) &&
            !String(pathname || '').startsWith('/(onboarding)')
        ) {
            if (pathname !== '/preferences') {
                router.replace('/preferences');
            }
        }
    }, [token, user, pathname, onboardingComplete, onboardingJustCompleted]);

    useEffect(() => {
        // Run once per session when token becomes available
        const timer = setTimeout(() => {
            if (token) {
                registerForPushNotificationsAsync(token).catch(() => { });

                // Check for pending referral rewards
                api.get('referral/pending-rewards').then(res => {
                    if (res.data.total > 0) {
                        setPendingReward({ total: res.data.total });
                    }
                }).catch(() => { });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [token]);

    return (
        <>
            <Tabs
                tabBar={(props) => <TabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                    // Background under the tab bar should be solid to avoid bleed-through
                    sceneStyle: { backgroundColor: C.background },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: 'Me',
                    }}
                />

                {/* Hidden screens — accessible via router.push() */}
                <Tabs.Screen name="history" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="preferences" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="support" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="referral" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="exams" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="generate" options={{ href: null, tabBarStyle: { display: 'none' } }} />

            </Tabs>

            {/* Claim Reward Modal */}
            <ClaimRewardModal
                visible={pendingReward !== null}
                total={pendingReward?.total || 0}
                onClaim={() => setPendingReward(null)}
            />
        </>
    );
}
