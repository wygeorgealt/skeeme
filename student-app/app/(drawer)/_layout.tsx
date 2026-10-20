import { Tabs, router, usePathname } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { AppState, AppStateStatus } from 'react-native';
import ClaimRewardModal from '@/components/ClaimRewardModal';
import { useState } from 'react';
import { haptics } from '@/lib/haptics';

import { Icon } from '@/components/ui/Icon';
import { Home, Camera, History as HistoryIcon, MessageSquare } from 'lucide-react-native';
import Animated, { LinearTransition, FadeIn } from 'react-native-reanimated';

import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

// ─── iOS Liquid Glass Floating Pill Navbar + Bottom Progressive Blur ─────────
type TabDef = {
    name: string;
    label: string;
    icon: any;
};

const TAB_DEFS: TabDef[] = [
    { name: 'index', label: 'Home', icon: Home },
    { name: 'history', label: 'History', icon: HistoryIcon },
    { name: 'chat', label: 'Chat', icon: MessageSquare },
];

const TAB_TRANSITION = LinearTransition.springify().damping(20).stiffness(220);

function TabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const pathname = usePathname();

    // Check if any screen has requested to hide the tab bar
    const focusedRoute = state.routes[state.index];
    const focusedOptions = descriptors[focusedRoute?.key]?.options;
    const hiddenScreens = [
        'generate',
        'scan',
        'chat',
        'account',
        'preferences',
        'settings',
        'support',
        'referral',
        'exams',
        'flashcards',
        'summary',
        'secret-credits',
    ];

    if (
        focusedOptions?.tabBarStyle?.display === 'none' ||
        hiddenScreens.includes(focusedRoute?.name) ||
        pathname?.includes('/generate') ||
        pathname?.includes('/scan') ||
        pathname?.includes('/chat') ||
        pathname?.includes('/flashcards') ||
        pathname?.includes('/summary') ||
        pathname?.includes('/secret-credits')
    ) {
        return null;
    }

    // Render tabs in the exact order specified by TAB_DEFS
    const visibleTabs = TAB_DEFS.map((tabDef) => {
        const routeIndex = state.routes.findIndex((r: any) => r.name === tabDef.name);
        if (routeIndex === -1) return null;
        return {
            route: state.routes[routeIndex],
            index: routeIndex,
            tabDef,
            isFocused: state.index === routeIndex,
        };
    }).filter(Boolean);

    const bottomOffset = Math.max(insets.bottom, 12) + 6;
    // Starts low — tucked beneath the upper half of the navbar so it has no visible top border on static screens
    const blurVeilHeight = bottomOffset + 38;

    return (
        <View style={pill.rootContainer} pointerEvents="box-none">
            {/* Subtle Progressive Bottom Blur Zone (invisible until content scrolls under the dock) */}
            <View
                pointerEvents="none"
                style={[pill.bottomBlurVeil, { height: blurVeilHeight }]}
            >
                <BlurView
                    intensity={Platform.OS === 'ios' ? 3 : 6}
                    tint={isDark ? 'dark' : 'light'}
                    blurMethod="dimezisBlurView"
                    style={pill.blurStep1}
                />
                <BlurView
                    intensity={Platform.OS === 'ios' ? 10 : 16}
                    tint={isDark ? 'dark' : 'light'}
                    blurMethod="dimezisBlurView"
                    style={pill.blurStep2}
                />
                <BlurView
                    intensity={Platform.OS === 'ios' ? 22 : 30}
                    tint={isDark ? 'dark' : 'light'}
                    blurMethod="dimezisBlurView"
                    style={pill.blurStep3}
                />
                <BlurView
                    intensity={Platform.OS === 'ios' ? 40 : 50}
                    tint={isDark ? 'dark' : 'light'}
                    blurMethod="dimezisBlurView"
                    style={pill.blurStep4}
                />
            </View>

            {/* Floating Liquid Glass Capsule Navbar */}
            <View style={[pill.outerWrap, { bottom: bottomOffset }]} pointerEvents="box-none">
                <View
                    style={[
                        pill.shadowShell,
                        {
                            shadowColor: isDark ? '#000000' : '#0F172A',
                            shadowOpacity: isDark ? 0.5 : 0.16,
                        },
                    ]}
                >
                    <BlurView
                        intensity={Platform.OS === 'ios' ? 88 : 100}
                        tint={isDark ? 'dark' : 'light'}
                        blurMethod="dimezisBlurView"
                        style={[
                            pill.blurPill,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(10, 12, 18, 0.86)'
                                    : 'rgba(230, 235, 245, 0.82)',
                                borderColor: isDark
                                    ? 'rgba(255, 255, 255, 0.14)'
                                    : 'rgba(15, 23, 42, 0.10)',
                            },
                        ]}
                    >
                        {/* Liquid Glass Specular Rim */}
                        <LinearGradient
                            pointerEvents="none"
                            colors={
                                isDark
                                    ? [
                                          'rgba(255,255,255,0.12)',
                                          'rgba(255,255,255,0.02)',
                                          'rgba(255,255,255,0)',
                                      ]
                                    : [
                                          'rgba(255,255,255,0.75)',
                                          'rgba(255,255,255,0.20)',
                                          'rgba(215,224,238,0.35)',
                                      ]
                            }
                            locations={[0, 0.4, 1]}
                            style={StyleSheet.absoluteFill}
                        />

                        {visibleTabs.map((item: any) => {
                            const { route, isFocused, tabDef } = item;

                            if (isFocused) {
                                // Active tab — smooth expanding electric-blue Liquid Glass pill
                                return (
                                    <Animated.View key={route.key} layout={TAB_TRANSITION}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                haptics.selectionAsync(true);
                                                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                                                if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                                            }}
                                            activeOpacity={0.85}
                                            style={pill.activeTab}
                                        >
                                            <LinearGradient
                                                colors={['#2B93FF', '#007AFF', '#005ECE']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                                style={StyleSheet.absoluteFill}
                                            />
                                            <LinearGradient
                                                pointerEvents="none"
                                                colors={['rgba(255,255,255,0.34)', 'rgba(255,255,255,0)']}
                                                style={pill.activeSpecular}
                                            />
                                            <Icon icon={tabDef.icon} size={20} color="#FFFFFF" strokeWidth={2.5} />
                                            <Text style={pill.activeLabel}>
                                                {tabDef.label}
                                            </Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            }

                            // Inactive tab — consistent circular glass button
                            return (
                                <Animated.View key={route.key} layout={TAB_TRANSITION}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            haptics.selectionAsync(true);
                                            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                                            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                                        }}
                                        activeOpacity={0.7}
                                        style={pill.inactiveTab}
                                    >
                                        <Icon
                                            icon={tabDef.icon}
                                            size={21}
                                            color={isDark ? '#94A3B8' : '#475569'}
                                            strokeWidth={2.1}
                                        />
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </BlurView>
                </View>
            </View>
        </View>
    );
}

const pill = StyleSheet.create({
    rootContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
    },
    bottomBlurVeil: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    blurStep1: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    blurStep2: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '22%',
        bottom: 0,
    },
    blurStep3: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '48%',
        bottom: 0,
    },
    blurStep4: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '72%',
        bottom: 0,
    },
    outerWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    shadowShell: {
        borderRadius: 999,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 30,
        elevation: 24,
    },
    blurPill: {
        height: 62,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 999,
        overflow: 'hidden',
        gap: 6,
    },
    activeTab: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 999,
        paddingHorizontal: 22,
        overflow: 'hidden',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    activeSpecular: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    activeLabel: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    inactiveTab: {
        width: 54,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
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
            if (pathname !== '/(drawer)/preferences') {
                router.replace('/(drawer)/preferences');
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
                backBehavior="history"
                screenOptions={{
                    headerShown: false,
                    headerTransparent: true,
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
                    name="scan"
                    options={{
                        title: 'Scan',
                        href: null,
                        headerShown: false,
                        tabBarStyle: { display: 'none' },
                        sceneStyle: { backgroundColor: '#090d16' },
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: 'History',
                    }}
                />
                <Tabs.Screen
                    name="chat"
                    options={{
                        title: 'Chat',
                        headerShown: false,
                        tabBarStyle: { display: 'none' },
                    }}
                />

                {/* Hidden screens — accessible via router.push() */}
                <Tabs.Screen name="account" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="preferences" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="support" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="referral" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="exams" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="generate" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="flashcards" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="summary" options={{ href: null, tabBarStyle: { display: 'none' } }} />
                <Tabs.Screen name="secret-credits" options={{ href: null, tabBarStyle: { display: 'none' } }} />

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
