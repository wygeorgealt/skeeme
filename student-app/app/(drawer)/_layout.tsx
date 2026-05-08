import { Tabs, router, usePathname } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '@/lib/notifications';

import { Home, User, CameraAdd } from '@solar-icons/react-native/Bold';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, SharedValue } from 'react-native-reanimated';

// ─── Icons logic moved to TabBar / TabLayout with direct HugeiconsIcon imports ───

// ─── Custom glass tab bar with center camera FAB ─────────────────────────────
function TabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    // Find scan route to get its onPress
    const scanRouteIndex = state.routes.findIndex((r: any) => r.name === 'scan');
    const scanOnPress = () => {
        if (scanRouteIndex !== -1) {
            const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[scanRouteIndex].key,
                canPreventDefault: true,
            });
            if (state.index !== scanRouteIndex && !event.defaultPrevented) {
                navigation.navigate('scan');
            }
        }
    };

    // ── Camera FAB fold animation ──────────────────────────────────────────
    const currentRouteName = state.routes[state.index]?.name;
    const isMainTab = ['index', 'account'].includes(currentRouteName);

    // Shared value: 0 = prominent (main tabs), 1 = folded (sub-pages)
    const foldProgress = useSharedValue(isMainTab ? 0 : 1);

    useEffect(() => {
        foldProgress.value = withSpring(isMainTab ? 0 : 1, {
            damping: 16,
            stiffness: 140,
            mass: 0.8,
        });
    }, [isMainTab]);

    const fabAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: foldProgress.value * 22 },
            { scale: 1 - foldProgress.value * 0.22 },
        ],
        opacity: 1 - foldProgress.value * 0.15,
    }));

    // Filter to only visible tabs (Home + Account)
    const visibleRoutes = state.routes
        .map((route: any, index: number) => ({ route, index }))
        .filter(({ route }: any) => {
            const { options } = descriptors[route.key];
            return options.href !== null && route.name !== 'scan';
        });

    return (
        <View style={bar.outerWrap} pointerEvents="box-none">
            {/* The bar itself */}
            <BlurView
                intensity={Platform.OS === 'ios' ? 80 : 100}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    bar.blurBase,
                    {
                        paddingBottom: Math.max(insets.bottom, 16),
                        backgroundColor: isDark 
                            ? (Platform.OS === 'android' ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.6)') 
                            : (Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)'),
                        borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    },
                ]}
            >
                {/* Left tab (Home) */}
                {visibleRoutes[0] && (() => {
                    const { route, index } = visibleRoutes[0];
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const iconColor = isFocused ? C.primary : (isDark ? '#6b7280' : '#9ca3af');
                    const label = options.title ?? route.name;
                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => {
                                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                                if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                            }}
                            activeOpacity={0.7}
                            style={bar.sideTab}
                            accessibilityRole="button"
                            accessibilityLabel={String(label)}
                            accessibilityState={isFocused ? { selected: true } : {}}
                        >
                            <Home color={iconColor} size={24} />
                            <Text style={[bar.tabLabel, { color: iconColor }]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })()}

                {/* Center spacer for the FAB */}
                <View style={bar.centerSpacer} />

                {/* Right tab (Profile/Me) */}
                {visibleRoutes[1] && (() => {
                    const { route, index } = visibleRoutes[1];
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const iconColor = isFocused ? C.primary : (isDark ? '#6b7280' : '#9ca3af');
                    const label = options.title ?? route.name;
                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => {
                                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                                if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                            }}
                            activeOpacity={0.7}
                            style={bar.sideTab}
                            accessibilityRole="button"
                            accessibilityLabel={String(label)}
                            accessibilityState={isFocused ? { selected: true } : {}}
                        >
                            <User color={iconColor} size={24} />
                            <Text style={[bar.tabLabel, { color: iconColor }]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })()}
            </BlurView>

            {/* Camera FAB — folds into bar on sub-pages, springs out on main tabs */}
            <View style={[bar.fabOuter, { bottom: Math.max(insets.bottom, 16) + 16 }]} pointerEvents="box-none">
                <Animated.View style={fabAnimatedStyle} pointerEvents="box-none">
                    <TouchableOpacity
                        onPress={scanOnPress}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Scan"
                    >
                        <View style={[bar.fabCircle, { backgroundColor: C.primary }]}>
                            <CameraAdd color="#FFFFFF" size={28} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
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
        paddingTop: 14,
        paddingHorizontal: 32,
        borderTopWidth: 1,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    sideTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    centerSpacer: {
        width: 80, // space reserved for the FAB
    },
    // Camera FAB
    fabOuter: {
        position: 'absolute',
        alignSelf: 'center',
        left: '50%',
        marginLeft: -34, // half of 68
        zIndex: 10,
    },
    fabCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 12,
    },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const { user, token } = useAuthStore();
    const pathname = usePathname();

    useEffect(() => {
        // AI Personalization Guard — if logged in but no education level, force preferences
        if (token && user && !user.ai_preferences?.education_level) {
            if (pathname !== '/preferences') {
                router.replace('/preferences');
            }
        }

        // Defer push token registration
        const timer = setTimeout(() => {
            if (token) {
                registerForPushNotificationsAsync(token).catch(() => { });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [token, user, pathname]);

    return (
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
                        tabBarIcon: ({ color, size }) =>
                        <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    // Icon handled by ScanTabButton inside TabBar
                    tabBarIcon: ({ color, size }) => <CameraAdd color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Me',
                    tabBarIcon: ({ color, size }) =>
                        <User color={color} size={size} />,
                }}
            />

            {/* Hidden screens — accessible via router.push() */}
            <Tabs.Screen name="flashcards" options={{ href: null }} />
            <Tabs.Screen name="history" options={{ href: null }} />
            <Tabs.Screen name="preferences" options={{ href: null }} />
            <Tabs.Screen name="streak" options={{ href: null }} />
            <Tabs.Screen name="support" options={{ href: null }} />
        </Tabs>
    );
}
