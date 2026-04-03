import { Tabs, router, usePathname } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, User, Camera } from 'iconoir-react-native';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '@/lib/notifications';

// ─── Icons ───────────────────────────────────────────────────────────────────
const HomeIcon = ({ color, size, focused }: any) => (
    <Home width={size} height={size} color={color} strokeWidth={focused ? 2.5 : 2} />
);

const PersonIcon = ({ color, size, focused }: any) => (
    <User width={size} height={size} color={color} strokeWidth={focused ? 2.5 : 2} />
);

const CameraIcon = ({ color, size }: any) => (
    <Camera width={size} height={size} color={color} strokeWidth={2.5} />
);

// ─── Scan FAB (center elevated button) ───────────────────────────────────────
function ScanTabButton({ onPress }: { onPress?: () => void }) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={fab.wrapper}
            accessibilityRole="button"
            accessibilityLabel="Scan"
        >
            <View style={[fab.circle, { backgroundColor: C.primary }]}>
                <CameraIcon color="#FFFFFF" size={26} />
            </View>
        </TouchableOpacity>
    );
}

const fab = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    circle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
        position: 'absolute',
        bottom: 24, // Floating identically over the baseline
    },
});

// ─── Custom glass tab bar ─────────────────────────────────────────────────────
function TabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    return (
        <View style={bar.outerWrap}>
            <BlurView
                intensity={isDark ? 80 : 80}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    bar.blurBase, 
                    { 
                        paddingBottom: Math.max(insets.bottom, 12),
                        backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.65)',
                        borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }
                ]}
            >
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    
                    // Prevent hidden routes from rendering invisibly and pushing layout
                    if (options.href === null || options.tabBarItemStyle?.display === 'none') {
                        return null;
                    }

                    const isFocused = state.index === index;
                    const isScan = route.name === 'scan';

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    if (isScan) {
                        return <ScanTabButton key={route.key} onPress={onPress} />;
                    }

                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;

                    const iconColor = isFocused ? C.iconActive : C.icon;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            activeOpacity={0.7}
                            style={bar.tab}
                            accessibilityRole="button"
                            accessibilityLabel={String(label)}
                            accessibilityState={isFocused ? { selected: true } : {}}
                        >
                            {options.tabBarIcon?.({ color: iconColor, size: 24, focused: isFocused })}
                        </TouchableOpacity>
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
        justifyContent: 'flex-end',
        pointerEvents: 'box-none',
    },
    blurBase: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12, // Identical vertical baseline
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
                registerForPushNotificationsAsync(token).catch(() => {});
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [token, user, pathname]);

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                // Background under the tab bar
                sceneStyle: { backgroundColor: 'transparent' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) =>
                        <HomeIcon color={color} size={size} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    // Icon handled by ScanTabButton inside TabBar
                    tabBarIcon: ({ color, size }) => <CameraIcon color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="generate"
                options={{
                    href: null, // Hiding Quiz tab natively
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Me',
                    tabBarIcon: ({ color, size, focused }) =>
                        <PersonIcon color={color} size={size} focused={focused} />,
                }}
            />

            {/* Hidden screens — accessible via router.push() */}
            <Tabs.Screen name="flashcards" options={{ href: null }} />
            <Tabs.Screen name="history" options={{ href: null }} />
            <Tabs.Screen name="preferences" options={{ href: null }} />
            <Tabs.Screen name="streak" options={{ href: null }} />
            <Tabs.Screen name="referral" options={{ href: null }} />
            <Tabs.Screen name="support" options={{ href: null }} />
        </Tabs>
    );
}
