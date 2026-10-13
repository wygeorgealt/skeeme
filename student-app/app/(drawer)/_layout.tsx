import { Tabs, router, usePathname } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
import { haptics } from '@/lib/haptics';

import { Icon } from '@/components/ui/Icon';
import { Home, Camera, History as HistoryIcon, MessageSquare } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, SharedValue } from 'react-native-reanimated';

import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

// ─── Stitch-style Floating Pill Navbar ────────────────────
type TabDef = {
    name: string;
    label: string;
    icon: any;
};

const TAB_DEFS: TabDef[] = [
    { name: 'index', label: 'Home', icon: Home },
    { name: 'scan', label: 'Scan', icon: Camera },
    { name: 'history', label: 'History', icon: HistoryIcon },
    { name: 'chat', label: 'Chat', icon: MessageSquare },
];

function TabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pathname = usePathname();

    // Check if any screen has requested to hide the tab bar
    const focusedRoute = state.routes[state.index];
    const focusedOptions = descriptors[focusedRoute?.key]?.options;
    const hiddenScreens = [
        'generate',
        'chat',
        'scan',
        'account',
        'preferences',
        'settings',
        'support',
        'referral',
        'exams',
        'flashcards',
    ];

    if (
        focusedOptions?.tabBarStyle?.display === 'none' ||
        hiddenScreens.includes(focusedRoute?.name) ||
        pathname?.includes('/generate') ||
        pathname?.includes('/chat') ||
        pathname?.includes('/scan') ||
        pathname?.includes('/flashcards')
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

    return (
        <View style={[pill.outerWrap, { bottom: Math.max(insets.bottom, 12) + 6 }]} pointerEvents="box-none">
            <BlurView
                intensity={Platform.OS === 'ios' ? 80 : 100}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    pill.blurPill,
                    {
                        backgroundColor: isDark
                            ? (Platform.OS === 'android' ? '#16181D' : 'rgba(22,24,29,0.88)')
                            : (Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255,255,255,0.92)'),
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.12,
                        shadowRadius: 32,
                        elevation: 20,
                    },
                ]}
            >
                {visibleTabs.map((item: any) => {
                    const { route, isFocused, tabDef } = item;

                    if (isFocused) {
                        // Active tab — blue pill with icon + label
                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={() => {
                                    haptics.selectionAsync(true);
                                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                                    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                                }}
                                activeOpacity={0.85}
                                style={pill.activeTab}
                            >
                                <Icon icon={tabDef.icon} size={18} color="#FFFFFF" strokeWidth={2.4} />
                                <Text style={pill.activeLabel}>{tabDef.label}</Text>
                            </TouchableOpacity>
                        );
                    }

                    // Inactive tab — circular icon only
                    return (
                        <TouchableOpacity
                            key={route.key}
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
                                size={19}
                                color={isDark ? '#9CA3AF' : '#8E8E93'}
                                strokeWidth={2}
                            />
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
}

const pill = StyleSheet.create({
    outerWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 20,
        alignItems: 'center',
    },
    blurPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 999,
        overflow: 'hidden',
        gap: 4,
    },
    activeTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#007AFF',
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 18,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    activeLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    inactiveTab: {
        width: 42,
        height: 42,
        borderRadius: 21,
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
                        tabBarStyle: { display: 'none' },
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
